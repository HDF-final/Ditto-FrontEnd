import apiClient from "./client";
import { requestData } from "./api-response";
import { toBackendPersonaEnum } from "@/lib/fixtures/personas";

/**
 * 내 프로필 정보 조회
 * GET /api/v1/users/me
 */
export function getMyProfile() {
  return requestData(apiClient.get("/users/me"));
}

/**
 * 내 찜한 코스 (북마크) 목록 조회
 * GET /api/v1/users/me/bookmarks
 */
export function getMyBookmarks() {
  return requestData(apiClient.get("/users/me/bookmarks"));
}

/**
 * 내 프로필 정보 (닉네임, 비밀번호, 페르소나 등) 수정
 * PATCH /api/v1/users/me
 *
 * @param {Object} params
 * @param {string} [params.nickname] - 최대 100자
 * @param {string} [params.password] - 8~100자 (전달 시 BCrypt 암호화)
 * @param {string} [params.persona] - OPEN_RUN_LOVER, FLEX_SPENDER, LITTLE_JOY, ULTIMATE_STAN
 */
export async function updateMyProfile({ nickname, password, persona }) {
  const payload = {};
  if (nickname && nickname.trim()) {
    payload.nickname = nickname.trim();
  }
  if (password && password.trim()) {
    payload.password = password.trim();
  }
  if (persona) {
    payload.persona = toBackendPersonaEnum(persona);
  }

  return requestData(apiClient.patch("/users/me", payload));
}

/**
 * 내 환경설정 (국가, 언어, 페르소나 등) 수정
 * PATCH /api/v1/users/me/preferences
 */
export function updateMyPreferences({ countryCode, language, persona, country }) {
  return requestData(
    apiClient.patch("/users/me/preferences", {
      countryCode: countryCode || country,
      country: country || countryCode,
      language,
      persona,
    }),
  );
}
