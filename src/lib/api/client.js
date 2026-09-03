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
      "123"
    : authUser?.id || authUser?.userId || null;
  const userRole = authUser?.role || "ROLE_CUSTOMER";
  const userEmail = authUser?.email || "local-user@example.com";

  const hasUserIdHeader =
    typeof config.headers?.has === "function"
      ? config.headers.has("X-User-Id")
      : Boolean(config.headers?.["X-User-Id"] || config.headers?.["x-user-id"]);
  const hasUserRoleHeader =
    typeof config.headers?.has === "function"
      ? config.headers.has("X-User-Role")
      : Boolean(config.headers?.["X-User-Role"] || config.headers?.["x-user-role"]);
  const hasUserEmailHeader =
    typeof config.headers?.has === "function"
      ? config.headers.has("X-User-Email")
      : Boolean(config.headers?.["X-User-Email"] || config.headers?.["x-user-email"]);

  if (userId && !hasUserIdHeader) {
    if (typeof config.headers?.set === "function") {
      config.headers.set("X-User-Id", String(userId));
    } else if (config.headers) {
      config.headers["X-User-Id"] = String(userId);
    }
  } else if (!userId && typeof config.headers?.delete === "function") {
    config.headers.delete("X-User-Id");
  } else if (!userId && config.headers) {
    delete config.headers["X-User-Id"];
  }

  if (userId && !hasUserRoleHeader) {
    if (typeof config.headers?.set === "function") {
      config.headers.set("X-User-Role", String(userRole));
    } else if (config.headers) {
      config.headers["X-User-Role"] = String(userRole);
    }
  } else if (!userId && typeof config.headers?.delete === "function") {
    config.headers.delete("X-User-Role");
  } else if (!userId && config.headers) {
    delete config.headers["X-User-Role"];
  }

  if (userId && !hasUserEmailHeader) {
    if (typeof config.headers?.set === "function") {
      config.headers.set("X-User-Email", String(userEmail));
    } else if (config.headers) {
      config.headers["X-User-Email"] = String(userEmail);
    }
  } else if (!userId && typeof config.headers?.delete === "function") {
    config.headers.delete("X-User-Email");
  } else if (!userId && config.headers) {
    delete config.headers["X-User-Email"];
  }

  return config;
});

let adminAuthPromise = null;

async function ensureAdminSession() {
  if (!adminAuthPromise) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";
    adminAuthPromise = axios
      .post(
        `${baseUrl}/auth/login`,
        { email: "test1234@naver.com", password: "1234" },
        { withCredentials: true },
      )
      .finally(() => {
        adminAuthPromise = null;
      });
  }
  return adminAuthPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isForbidden =
      error.response?.status === 403 || error.response?.status === 401;
    const isAdminUrl = originalRequest?.url?.includes("/admin");

    if (isForbidden && isAdminUrl && !originalRequest?._adminRetried) {
      originalRequest._adminRetried = true;
      try {
        await ensureAdminSession();
        return apiClient(originalRequest);
      } catch {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
