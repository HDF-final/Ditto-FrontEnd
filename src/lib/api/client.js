import "client-only";

import axios from "axios";
import { applyApiLanguageHeader } from "./request-language";
import { useAuthStore } from "@/stores/use-auth-store";

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

  const authUser = useAuthStore.getState()?.user;
  const userId =
    authUser?.id ||
    authUser?.userId ||
    process.env.NEXT_PUBLIC_LOCAL_USER_ID?.trim() ||
    "1";

  if (userId) {
    if (typeof config.headers?.set === "function") {
      config.headers.set("X-User-Id", String(userId));
    } else if (config.headers) {
      config.headers["X-User-Id"] = String(userId);
    }
  }

  return config;
});

export default apiClient;
