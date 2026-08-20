import "client-only";

import axios from "axios";
import { applyApiLanguageHeader } from "./request-language";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1",
  timeout: 15_000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  applyApiLanguageHeader(config.headers, document.cookie);
  if (process.env.NODE_ENV !== "production") {
    const localUserId = process.env.NEXT_PUBLIC_LOCAL_USER_ID?.trim();
    if (localUserId && !config.headers.get("X-User-Id")) {
      config.headers.set("X-User-Id", localUserId);
    }
  }
  return config;
});

export default apiClient;
