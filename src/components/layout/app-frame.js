"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { ScanLocationLifecycle } from "@/components/layout/scan-location-lifecycle";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { useAuthStore } from "@/stores/use-auth-store";
import { getMyProfile } from "@/lib/api/users";

const AUTH_PATHS = new Set(["/login", "/signup", "/country", "/persona"]);

/**
 * App chrome. Phone viewports keep the 430px PWA shell and tab bar.
 * Desktop (lg+) keeps the original full-width header and footer, except the
 * course studio which needs the remaining viewport for the editor + map.
 */
export function AppFrame({ children }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_PATHS.has(pathname);
  const isAdminRoute = pathname.startsWith("/admin");
  const isCourseStudio = pathname.startsWith("/ai-course");
  const isScanMap = pathname.startsWith("/scan-map");
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

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
          setUser(profile);
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
              : "pb-[calc(var(--app-tabbar)+0.5rem)] lg:pb-0"
        }`}
      >
        {children}
      </div>
      {isScanMap ? null : <BottomTabBar />}
      {isCourseStudio || isScanMap ? null : <SiteFooter />}
    </>
  );
}
