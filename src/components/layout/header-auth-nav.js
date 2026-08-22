"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { MOCK_USER, useAuthStore } from "@/stores/use-auth-store";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { logout } from "@/lib/api/auth";

function HeartIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-[20px] sm:size-[27px]"
      viewBox="0 0 27 27"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23.1 7.42c-2.03-3.15-6.57-2.87-8.46-.45L13.5 8.43l-1.14-1.46c-1.89-2.42-6.43-2.7-8.46.45-1.73 2.69-.96 6.2 1.48 8.43l8.12 7.42 8.12-7.42c2.44-2.23 3.21-5.74 1.48-8.43Z" />
    </svg>
  );
}

export function HeaderAuthNav() {
  const t = useTranslations();
  const mounted = useIsMounted();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearUser = useAuthStore((state) => state.clearUser);

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      window.sessionStorage?.setItem("ditto_logged_out", "true");
    }
    clearUser();
    try {
      await logout();
    } catch (err) {
      console.warn("[HeaderAuthNav] Error calling logout:", err?.message);
    } finally {
      if (typeof window !== "undefined") {
        // Hard reload to root to completely purge client memory and cookies
        window.location.replace("/");
      }
    }
  };

  const activeUser = user;
  const isAuth = mounted ? Boolean(isAuthenticated && user) : false;

  if (isAuth && activeUser) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-6">
        <Link
          href="/community/bookmarks"
          aria-label={t("navigation.likedCourses")}
          className="text-ink transition hover:text-brand p-1"
        >
          <HeartIcon />
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href="/mypage"
            className="max-w-[68px] sm:max-w-none truncate text-xs sm:text-sm font-bold text-ink hover:text-brand transition cursor-pointer whitespace-nowrap"
          >
            {t("common.memberGreeting", {
              name: activeUser.nickname || activeUser.name || "디또러버",
            })}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-line bg-white px-2.5 py-1 text-[11px] sm:px-4 sm:py-2 sm:text-xs font-bold text-ink-muted transition hover:border-brand hover:text-brand cursor-pointer whitespace-nowrap shrink-0"
          >
            {t("common.logout")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="rounded-full bg-brand px-3.5 py-1.5 text-xs sm:px-5 sm:py-3 sm:text-base font-black leading-none text-white transition hover:bg-brand-dark whitespace-nowrap"
    >
      {t("common.login")}
    </Link>
  );
}
