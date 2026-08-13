import "client-only";

import { apiClient } from "./client";

/**
 * AI 코스 추천 API.
 *
 * `POST /v1/ai/course-recommendations/chat` 한 번은 LLM 플래닝을 통째로 돌기
 * 때문에 응답까지 40초 안팎이 걸립니다. 공통 인스턴스의 15초 기본 타임아웃으로는
 * 항상 끊기므로, 기능 전용 Axios 인스턴스를 새로 만들지 않고 이 요청에만
 * 타임아웃을 넓혀서 보냅니다.
 */

const CHAT_ENDPOINT = "/v1/ai/course-recommendations/chat";

/** 40초 응답 + 서버 지연 여유. */
export const COURSE_CHAT_TIMEOUT_MS = 120_000;

/** 서버 스펙상 message는 500자까지만 받습니다. */
export const COURSE_CHAT_MAX_MESSAGE_LENGTH = 500;

/**
 * 사용자 발화 한 turn을 보내고 응답 봉투의 `data`를 돌려줍니다.
 *
 * `{ sessionId, reply, turn, places: [{ navigationKey, placeName, reason }] }`
 *
 * `sessionId`는 서버가 발급합니다. 첫 요청은 비워 보내고(새 대화 시작), 이후
 * turn은 직전 응답의 sessionId를 그대로 실어 보내야 앞 대화 조건을 이어받습니다.
 * 생성·다듬기·재추천이 모두 이 엔드포인트 하나입니다.
 */
export async function sendCourseChatMessage({ sessionId, message, signal }) {
  const { data } = await apiClient.post(
    CHAT_ENDPOINT,
    sessionId ? { sessionId, message } : { message },
    { timeout: COURSE_CHAT_TIMEOUT_MS, signal },
  );

  if (data?.success === false) {
    throw new Error(data.message || "코스 추천 응답을 받지 못했어요.");
  }

  return data?.data ?? null;
}
