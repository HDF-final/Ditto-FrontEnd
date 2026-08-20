"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  COURSE_CHAT_MAX_MESSAGE_LENGTH,
  sendCourseChatMessage,
} from "@/lib/api/ai-course";
import { resolveCoursePlace } from "@/lib/navigation/course-routing-service";
import { categoryStyleOf, normalizeCategory } from "@/lib/place-category";
import { useTranslations } from "next-intl";

/**
 * Boni 코스 추천 대화 한 세션.
 *
 * 프롬프트 화면의 첫 요청과 결과 화면의 후속 대화가 같은 엔드포인트를 씁니다.
 * 첫 요청은 sessionId 없이 보내고, 서버가 발급한 sessionId를 이후 turn에 계속
 * 실어 보내야 "다듬기 / 재추천"이 앞 대화 조건을 이어받습니다.
 *
 * 요청 한 건이 40초 안팎 걸리므로 `pending`을 화면 전체 버퍼링 오버레이의 단일
 * 트리거로 쓰고, 응답이 오면 자동으로 풀립니다.
 */

const CANCEL_CODES = new Set(["ERR_CANCELED"]);

function toErrorMessage(error, t) {
  if (error?.code === "ECONNABORTED") {
    return t("timeoutError");
  }

  const status = error?.response?.status;
  if (status === 401 || status === 403) {
    return t("authError");
  }
  if (status === 502) {
    // 서버 스펙상 AI 엔진 장애·타임아웃이 E001(502)로 내려옵니다.
    return t("engineError");
  }
  if (status) {
    const serverMessage = error.response?.data?.message;
    return serverMessage || t("serverError", { status });
  }
  if (error?.request) {
    return t("connectionError");
  }
  return error?.message || t("genericError");
}

/**
 * 응답이 준 장소 사진을 카드·모달이 읽는 필드로 펼칩니다.
 *
 * `image.kind`가 두 가지고, 성격이 전혀 다릅니다.
 *
 * - `place`   : hdf-ditto-images S3의 매장 실사진. 카탈로그 사진과 같은 성격이라
 *               그대로 대체합니다. 카탈로그 쪽 URL은 presigned라 30분 뒤 만료되는데
 *               이 URL은 서명이 없어서 그 문제도 같이 사라집니다.
 * - `evidence`: "카리나가 프라다 앰배서더"를 입증하는 뉴스 사진. 매장 사진이 아니라
 *               추천 이유를 그대로 보여주는 그림이라 대표 사진 칸에만 씁니다.
 *               외부 CDN이라 next/image(remotePatterns 화이트리스트)로는 못 띄우므로
 *               일반 <img>를 쓰는 곳만 읽도록 `image`/`placeImg`는 건드리지 않습니다.
 */
function toAiImageFields(item) {
  const url = item?.imageUrl || item?.image?.url || null;
  if (!url) return null;

  const kind = item?.image?.kind ?? null;
  const fields = {
    aiImage: url,
    aiImageKind: kind,
    aiImageCaption: item?.image?.caption?.trim() || null,
  };

  return kind === "evidence"
    ? fields
    : { ...fields, image: url, imageUrl: url, placeImg: url };
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
      // 분류는 응답만 알고 있습니다. 로컬 카탈로그(store-navigation-keys.json)에는
      // category 필드가 아예 없어서, 카탈로그만 믿으면 124곳이 전부 "매장"
      // 폴백으로 떨어집니다. 스타벅스 리저브도 나의 가야도 매장으로 나오던 이유입니다.
      const category = normalizeCategory(item?.category);
      // 추천 이유가 카드 설명보다 훨씬 유용해서 있으면 그걸 보여줍니다.
      return {
        ...place,
        category,
        ...categoryStyleOf(category),
        desc: reason || place.desc,
        aiReason: reason || null,
        isAiRecommended: true,
        ...toAiImageFields(item),
      };
    }),
  );

  return resolved.filter(Boolean);
}

export function useCourseChat() {
  const t = useTranslations("aiCourse");
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

      // 서버가 발급한 sessionId를 이후 turn에 계속 씁니다.
      if (data?.sessionId) sessionIdRef.current = data.sessionId;

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
          { role: "boni", text: t("cancelledMessage") },
        ]);
        return;
      }
      setError(toErrorMessage(caught, t));
    } finally {
      controllerRef.current = null;
      setPending(null);
    }
  }, [course, t]);

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
