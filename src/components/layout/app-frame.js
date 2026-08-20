"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { useAuthStore } from "@/stores/use-auth-store";
import { usePreferenceStore } from "@/stores/use-preference-store";
import { getMyProfile } from "@/lib/api/users";

const AUTH_PATHS = new Set(["/login", "/signup", "/country", "/persona"]);

/**
 * Site chrome wrapper. Auth routes match the HTML mock (no header/footer).
 */
export function AppFrame({ children }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_PATHS.has(pathname);
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const setPreferences = usePreferenceStore((state) => state.setPreferences);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      await usePreferenceStore.persist.rehydrate();
      if (!isMounted) return;

      try {
        const profile = await getMyProfile();
        if (isMounted && profile) {
          setUser(profile);
          setPreferences({
            countryCode: profile.countryCode,
            languageCode:
              profile.languageCode || profile.preferredLanguageCode,
          });
        }
      } catch {
        if (isMounted) {
          clearUser();
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [setUser, clearUser, setPreferences]);

  if (isAuthRoute) {
    return children;
  }

  return (
    <>
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </>
  );
}
