"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  COURSE_CHAT_MAX_MESSAGE_LENGTH,
  createCourseSessionId, // [임시] 서버 발급으로 되돌릴 때 이 import도 삭제
  sendCourseChatMessage,
} from "@/lib/api/ai-course";
import { resolveCoursePlace } from "@/lib/navigation/course-routing-service";

/**
 * Boni 코스 추천 대화 한 세션.
 *
 * 프롬프트 화면의 첫 요청과 결과 화면의 후속 대화가 같은 엔드포인트를 씁니다.
 * 하나의 대화는 sessionId 하나를 계속 재사용해야 "다듬기 / 재추천"이 앞 대화
 * 조건을 이어받습니다.
 *
 * sessionId 발급 주체는 지금 [임시] 상태입니다. 자세한 배경과 되돌리는 방법은
 * `lib/api/ai-course.js` 상단의 [임시] 블록을 참고하세요.
 *
 * 요청 한 건이 40초 안팎 걸리므로 `pending`을 화면 전체 버퍼링 오버레이의 단일
 * 트리거로 쓰고, 응답이 오면 자동으로 풀립니다.
 */

const CANCEL_CODES = new Set(["ERR_CANCELED"]);

function toErrorMessage(error) {
  if (error?.code === "ECONNABORTED") {
    return "응답이 너무 오래 걸려 요청을 중단했어요. 다시 시도해주세요.";
  }

  const status = error?.response?.status;
  if (status === 401 || status === 403) {
    return "코스 추천은 로그인이 필요한 기능이에요. 로그인 후 다시 시도해주세요.";
  }
  if (status === 502) {
    // 서버 스펙상 AI 엔진 장애·타임아웃이 E001(502)로 내려옵니다.
    return "AI 추천 엔진이 응답하지 않았어요. 잠시 후 다시 시도해주세요.";
  }
  if (status) {
    const serverMessage = error.response?.data?.message;
    return serverMessage || `코스를 만들지 못했어요. (서버 응답 ${status})`;
  }
  if (error?.request) {
    return "코스 추천 서버에 연결하지 못했어요. 서버가 실행 중인지 확인해주세요.";
  }
  return error?.message || "코스를 만들지 못했어요. 잠시 후 다시 시도해주세요.";
}

/**
 * 서버가 준 navigationKey를 실내 지도 데이터셋의 장소로 바꿉니다.
 * 길찾기가 navigationKey 기준이라 매칭되지 않는 항목은 코스에 담지 않습니다.
 */
async function toCoursePlaces(apiPlaces) {
  if (!Array.isArray(apiPlaces) || apiPlaces.length === 0) return [];

  const resolved = await Promise.all(
    apiPlaces.map(async (item) => {
      const place = await resolveCoursePlace({
        navigationKey: item?.navigationKey,
      });
      if (!place) return null;
      const reason = item?.reason?.trim() || "";
      // 추천 이유가 카드 설명보다 훨씬 유용해서 있으면 그걸 보여줍니다.
      return { ...place, desc: reason || place.desc, aiReason: reason || null };
    }),
  );

  return resolved.filter(Boolean);
}

export function useCourseChat() {
  const sessionIdRef = useRef(null);
  const controllerRef = useRef(null);

  const [lastMessage, setLastMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [course, setCourse] = useState(null); // 응답마다 새 객체 → 결과 화면 동기화 트리거
  const [pending, setPending] = useState(null); // { message, isFirstTurn } | null
  const [error, setError] = useState(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const send = useCallback(async (rawMessage) => {
    const raw = typeof rawMessage === "string" ? rawMessage.trim() : "";
    if (!raw) return;
    if (controllerRef.current) return; // 한 번에 한 turn만 보냅니다.

    const message = raw.slice(0, COURSE_CHAT_MAX_MESSAGE_LENGTH);

    // [임시] 첫 turn 전에 프론트에서 sessionId를 만들어 대화 내내 고정합니다.
    // [원본] 서버 발급 규격에서는 이 줄이 필요 없습니다 — 첫 turn은 null로
    //        나가고, 아래 응답 처리에서 서버가 준 값을 받아 씁니다.
    sessionIdRef.current ??= createCourseSessionId();

    const controller = new AbortController();
    controllerRef.current = controller;

    setError(null);
    setLastMessage(message);
    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setPending({ message, isFirstTurn: course === null });

    try {
      const data = await sendCourseChatMessage({
        sessionId: sessionIdRef.current,
        message,
        signal: controller.signal,
      });

      // [임시] 프론트가 만든 sessionId를 대화 내내 그대로 유지합니다.
      // [원본] 서버 발급 규격 — 되돌릴 때 아래 줄을 되살립니다:
      // if (data?.sessionId) sessionIdRef.current = data.sessionId;

      const places = await toCoursePlaces(data?.places);
      if (controller.signal.aborted) return;

      if (data?.reply) {
        setMessages((prev) => [...prev, { role: "boni", text: data.reply }]);
      }
      // 장소가 비어 있는 turn(단순 질의응답)은 기존 코스를 유지합니다.
      if (places.length > 0) {
        setCourse({ places, turn: data?.turn ?? null });
      }
    } catch (caught) {
      if (controller.signal.aborted || CANCEL_CODES.has(caught?.code)) {
        setMessages((prev) => [
          ...prev,
          { role: "boni", text: "요청을 취소했어요. 다시 물어봐 주세요 🐾" },
        ]);
        return;
      }
      setError(toErrorMessage(caught));
    } finally {
      controllerRef.current = null;
      setPending(null);
    }
  }, [course]);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  const retry = useCallback(() => {
    if (lastMessage) send(lastMessage);
  }, [lastMessage, send]);

  return {
    messages,
    course,
    pending,
    error,
    canRetry: Boolean(lastMessage) && !pending,
    send,
    cancel,
    retry,
  };
}
