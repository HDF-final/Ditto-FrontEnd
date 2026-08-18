import apiClient from "./client";
import { requestData } from "./api-response";

/**
 * 내 프로필 정보 조회
 * GET /api/v1/users/me
 */
export function getMyProfile() {
  return requestData(apiClient.get("/users/me"));
}

/**
 * 내 코스 목록 조회
 * GET /api/v1/users/me/courses
 */
export function getMyCourses() {
  return requestData(apiClient.get("/users/me/courses"));
}

/**
 * 내 찜한 코스 (북마크) 목록 조회
 * GET /api/v1/users/me/bookmarks
 */
export function getMyBookmarks() {
  return requestData(apiClient.get("/users/me/bookmarks"));
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
