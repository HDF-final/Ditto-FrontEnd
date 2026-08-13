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

/* ─── [임시] 프론트 발급 sessionId ────────────────────────────────────────────
 * 도입일: 2026-08-14
 *
 * 정식 규격은 "서버 발급"입니다. 첫 요청은 sessionId 없이 보내고, 응답으로 받은
 * sessionId를 이후 turn에 실어 보내야 앞 대화 조건을 이어받습니다.
 * 지금은 그 규격 대신 프론트가 만든 id를 첫 turn부터 계속 실어 보냅니다.
 *
 * 주의: 이 조치로 403이 풀리지는 않습니다. 403의 원인은 로그인 세션(JSESSIONID)
 * 부재이고, 요청은 컨트롤러에 닿기 전 Spring Security에서 차단됩니다.
 *
 * 되돌리는 법 (로그인 API가 붙은 뒤):
 *   1. 이 블록과 createCourseSessionId()를 삭제
 *   2. sendCourseChatMessage 안의 [임시] 줄을 지우고 그 아래 [원본] 줄을 되살림
 *   3. use-course-chat.js의 같은 [임시] 표시 블록도 함께 되돌림
 * ────────────────────────────────────────────────────────────────────────── */

const SESSION_ID_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const SESSION_ID_LENGTH = 11; // 서버 예시값(Op3uskz8Gpo)과 같은 길이

/** [임시] 대화 세션 id를 클라이언트에서 만듭니다. 서버 발급으로 바뀌면 삭제합니다. */
export function createCourseSessionId() {
  const bytes = new Uint8Array(SESSION_ID_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(
    bytes,
    (byte) => SESSION_ID_ALPHABET[byte % SESSION_ID_ALPHABET.length],
  ).join("");
}

/**
 * 사용자 발화 한 turn을 보내고 응답 봉투의 `data`를 돌려줍니다.
 *
 * `{ sessionId, reply, turn, places: [{ navigationKey, placeName, reason }] }`
 *
 * 생성·다듬기·재추천이 모두 이 엔드포인트 하나입니다.
 */
export async function sendCourseChatMessage({ sessionId, message, signal }) {
  const { data } = await apiClient.post(
    CHAT_ENDPOINT,
    // [임시] 프론트가 만든 sessionId를 첫 turn부터 항상 실어 보냅니다.
    { sessionId, message },
    // [원본] 서버 발급 규격 — 되돌릴 때 위 줄 대신 아래 줄을 사용:
    // sessionId ? { sessionId, message } : { message },
    { timeout: COURSE_CHAT_TIMEOUT_MS, signal },
  );

  if (data?.success === false) {
    throw new Error(data.message || "코스 추천 응답을 받지 못했어요.");
  }

  return data?.data ?? null;
}
