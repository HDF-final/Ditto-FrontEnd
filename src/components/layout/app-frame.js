"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { ScanLocationLifecycle } from "@/components/layout/scan-location-lifecycle";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { useAuthStore } from "@/stores/use-auth-store";
import { login, logout } from "@/lib/api/auth";
import { getMyProfile } from "@/lib/api/users";

const AUTH_PATHS = new Set(["/login", "/signup", "/country", "/persona"]);
const AUTO_LOGIN_EMAIL = "emily.johnson.us@example.com";
const MANUAL_LOGIN_STORAGE_KEY = "ditto_manual_login";
const MANUAL_USER_STORAGE_KEY = "ditto_manual_user";
const AUTO_LOGIN_CREDENTIALS = {
  email: AUTO_LOGIN_EMAIL,
  password: "qwer1234",
};

function isAutoLoginProfile(user) {
  const email = String(user?.email || "").trim().toLowerCase();
  return email === AUTO_LOGIN_EMAIL;
}

function hasManualLoginSession() {
  if (typeof window === "undefined") return false;
  return window.sessionStorage?.getItem(MANUAL_LOGIN_STORAGE_KEY) === "true";
}

function getManualLoginUser() {
  if (typeof window === "undefined") return null;
  try {
    const rawUser = window.sessionStorage?.getItem(MANUAL_USER_STORAGE_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

async function loginWithDefaultAccount() {
  const loginResult = await login(AUTO_LOGIN_CREDENTIALS);
  return getMyProfile().catch(() => loginResult);
}

/**
 * App chrome. Phone viewports keep the 430px PWA shell and tab bar.
 * Desktop (lg+) keeps the original full-width header and footer, except the
 * course studio which needs the remaining viewport for the editor + map.
 */
export function AppFrame({ children }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_PATHS.has(pathname);
  const isAdminRoute = pathname.startsWith("/admin");
  const isHomeRoute = pathname === "/";
  const isCourseStudio = pathname.startsWith("/ai-course");
  const isScanMap = pathname.startsWith("/scan-map");
  const isSoftCanvasRoute =
    pathname === "/" ||
    pathname === "/community" ||
    pathname === "/news" ||
    pathname.startsWith("/news/");
  // 코스/커뮤니티 상세는 홈처럼 덩어리 스냅이라 푸터를 마지막 패널 안에 넣는다.
  // 형제 푸터를 그대로 두면 데스크톱에서 스냅 영역이 푸터 높이만큼 쭈그러든다.
  const isSnapDetail = /^\/(courses|community)\/[^/]+/.test(pathname);
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    const shell = document.querySelector(".app-shell");
    if (!shell) return undefined;
    shell.classList.toggle("app-shell-soft-canvas", isSoftCanvasRoute);
    return () => {
      shell.classList.remove("app-shell-soft-canvas");
    };
  }, [isSoftCanvasRoute]);

  useEffect(() => {
    if (AUTH_PATHS.has(pathname)) return undefined;

    let isMounted = true;

    async function restoreSession() {
      const isExplicitlyLoggedOut =
        typeof window !== "undefined" &&
        window.sessionStorage?.getItem("ditto_logged_out") === "true";

      if (isExplicitlyLoggedOut) {
        clearUser();
        return;
      }

      const manualUser = getManualLoginUser();
      if (manualUser) {
        setUser(manualUser);
        return;
      }

      try {
        const profile = await getMyProfile();
        if (isMounted && profile) {
          if (isAutoLoginProfile(profile) || hasManualLoginSession()) {
            setUser(profile);
            return;
          }
          await logout().catch(() => {});
          const defaultProfile = await loginWithDefaultAccount();
          if (isMounted) {
            setUser(defaultProfile);
          }
        } else if (isMounted && !useAuthStore.getState().isAuthenticated) {
          clearUser();
        }
      } catch {
        if (!isMounted) return;
        // 로그인 직후 세션 복원이 한발 늦어도, 방금 세팅한 로그인 상태를 지우지 않습니다.
        if (useAuthStore.getState().isAuthenticated) return;
        try {
          const profile = await loginWithDefaultAccount();
          if (!isMounted) return;
          setUser(profile);
        } catch (autoLoginError) {
          if (isMounted) {
            console.warn("[AppFrame] Auto login failed:", autoLoginError?.message);
            clearUser();
          }
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [pathname, setUser, clearUser]);

  if (isAuthRoute) {
    return (
      <>
        <ScanLocationLifecycle />
        {children}
      </>
    );
  }

  if (isAdminRoute) {
    return (
      <>
        <ScanLocationLifecycle />
        <div className="admin-shell min-h-dvh w-full">{children}</div>
      </>
    );
  }

  return (
    <>
      <ScanLocationLifecycle />
      {isScanMap ? null : <SiteHeader />}
      <div
        className={`flex min-h-0 flex-1 flex-col ${
          isScanMap
            ? "h-dvh overflow-hidden"
            : isCourseStudio
              ? "pb-[calc(var(--app-tabbar)+0.5rem)] max-lg:h-[calc(100dvh-var(--app-header))] max-lg:overflow-hidden lg:min-h-0 lg:overflow-hidden lg:pb-0"
              : isSoftCanvasRoute
                ? "max-lg:bg-surface-soft max-lg:pb-[var(--app-tabbar)] lg:pb-0"
                : "pb-[calc(var(--app-tabbar)+0.5rem)] lg:pb-0"
        }`}
      >
        {children}
      </div>
      {isScanMap ? null : <BottomTabBar />}
      {isHomeRoute || isCourseStudio || isScanMap || isSnapDetail ? null : (
        <SiteFooter />
      )}
    </>
  );
}
