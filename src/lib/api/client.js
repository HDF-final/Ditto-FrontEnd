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

  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    if (typeof config.headers?.delete === "function") {
      config.headers.delete("Content-Type");
    } else if (config.headers) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }
  }

  const isExplicitlyLoggedOut =
    typeof window !== "undefined" &&
    window.sessionStorage?.getItem("ditto_logged_out") === "true";

  const authUser = useAuthStore.getState()?.user;
  const userId = !isExplicitlyLoggedOut
    ? authUser?.id ||
      authUser?.userId ||
      process.env.NEXT_PUBLIC_LOCAL_USER_ID?.trim() ||
      "1"
    : authUser?.id || authUser?.userId || null;

  if (userId) {
    if (typeof config.headers?.set === "function") {
      config.headers.set("X-User-Id", String(userId));
    } else if (config.headers) {
      config.headers["X-User-Id"] = String(userId);
    }
  } else if (typeof config.headers?.delete === "function") {
    config.headers.delete("X-User-Id");
  } else if (config.headers) {
    delete config.headers["X-User-Id"];
  }

  return config;
});

export default apiClient;
