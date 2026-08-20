"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();
  const isAuthRoute = AUTH_PATHS.has(pathname);
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const hydratePreferences = usePreferenceStore(
    (state) => state.hydratePreferences,
  );
  const languageCode = usePreferenceStore((state) => state.languageCode);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      if (
        typeof window !== "undefined" &&
        window.sessionStorage?.getItem("ditto_logged_out") === "true"
      ) {
        clearUser();
        return;
      }

      try {
        const profile = await getMyProfile();
        if (isMounted && profile) {
          const profileLanguageCode =
            profile.languageCode || profile.preferredLanguageCode;
          setUser(profile);
          hydratePreferences({
            countryCode: profile.countryCode,
            languageCode: profileLanguageCode,
            languageWasManuallySelected: true,
          });
          if (profileLanguageCode && profileLanguageCode !== languageCode) {
            router.refresh();
          }
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
  }, [setUser, clearUser, hydratePreferences, languageCode, router]);

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
