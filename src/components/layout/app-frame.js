"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { ScanLocationLifecycle } from "@/components/layout/scan-location-lifecycle";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ADMIN_MOCK_USER, useAuthStore } from "@/stores/use-auth-store";
import { getMyProfile } from "@/lib/api/users";

const AUTH_PATHS = new Set(["/login", "/signup", "/country", "/persona"]);

function isAdminProfile(user) {
  const role = String(user?.role || "")
    .trim()
    .replace(/^ROLE_/i, "")
    .toUpperCase();
  const email = String(user?.email || "").trim().toLowerCase();
  const nickname = String(user?.nickname || user?.name || "").trim();

  return (
    role === "ADMIN" ||
    nickname === "구본희" ||
    email === "yuki@example.com" ||
    email === "test1234@naver.com"
  );
}

function normalizeSessionUser(profile, isAdminRoute) {
  if (isAdminRoute) {
    return isAdminProfile(profile)
      ? {
          ...profile,
          ...ADMIN_MOCK_USER,
          email: profile?.email || ADMIN_MOCK_USER.email,
        }
      : profile;
  }
  if (!isAdminProfile(profile)) return profile;

  return {
    ...profile,
    ...ADMIN_MOCK_USER,
    email: profile?.email || ADMIN_MOCK_USER.email,
  };
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

      try {
        const profile = await getMyProfile();
        if (isMounted && profile) {
          setUser(normalizeSessionUser(profile, isAdminRoute));
        } else if (isMounted && !useAuthStore.getState().isAuthenticated) {
          clearUser();
        }
      } catch {
        if (!isMounted) return;
        // 로그인 직후 세션 복원이 한발 늦어도, 방금 세팅한 로그인 상태를 지우지 않습니다.
        if (useAuthStore.getState().isAuthenticated) return;
        clearUser();
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [pathname, isAdminRoute, setUser, clearUser]);

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
