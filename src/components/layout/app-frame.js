"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
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
  const isCourseStudio = pathname.startsWith("/ai-course");
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
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
        } else if (isMounted) {
          setUser();
        }
      } catch {
        if (isMounted) {
          setUser();
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [setUser, clearUser]);

  if (isAuthRoute) {
    return children;
  }

  return (
    <>
      <SiteHeader />
      <div className="flex min-h-0 flex-1 flex-col pb-[calc(var(--app-tabbar)+0.5rem)] lg:pb-0">
        {children}
      </div>
      <BottomTabBar />
      {isCourseStudio ? null : <SiteFooter />}
    </>
  );
}
