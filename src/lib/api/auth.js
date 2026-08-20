import apiClient from "./client";
import { requestData } from "./api-response";

/**
 * 로그인 API
 * POST /api/v1/auth/login
 * @param {Object} credentials
 * @param {string} credentials.email
 * @param {string} credentials.password
 */
export function login({ email, password }) {
  return requestData(
    apiClient.post("/auth/login", {
      email,
      username: email,
      loginId: email,
      password,
    }),
  );
}

/**
 * 회원가입 API
 * POST /api/v1/auth/signup
 */
export function signup({
  email,
  password,
  nickname,
  country = "KR",
  languageCode = "ko",
  persona = "openrun",
  marketingAgreed = false,
}) {
  return requestData(
    apiClient.post("/auth/signup", {
      email,
      password,
      nickname: nickname || "디또러버",
      name: nickname || "디또러버",
      country,
      countryCode: country,
      languageCode,
      persona,
      marketingAgreed: Boolean(marketingAgreed),
      marketingAccepted: Boolean(marketingAgreed),
    }),
  );
}

/**
 * 로그아웃 API
 * POST /api/v1/auth/logout
 */
export function logout() {
  return requestData(apiClient.post("/auth/logout"));
}

/**
 * 세션 로그인 상태 확인 API
 * GET /api/v1/auth/me
 */
export function getAuthSession() {
  return requestData(apiClient.get("/auth/me"));
}

/**
 * 내 정보 조회 API
 * GET /api/v1/users/me
 */
export function getCurrentUser() {
  return requestData(apiClient.get("/users/me"));
}
