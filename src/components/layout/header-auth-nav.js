"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/use-auth-store";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { logout } from "@/lib/api/auth";

function HeartIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 lg:size-[27px]"
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

function isAdmin(user) {
  const role = String(user?.role || "")
    .trim()
    .replace(/^ROLE_/i, "")
    .toUpperCase();
  const email = String(user?.email || "").trim().toLowerCase();

  // 로그인 응답과 프로필 응답의 도착 순서가 달라도 관리자 진입 링크를
  // 즉시 표시합니다. 실제 /admin 접근 권한은 백엔드 ROLE_ADMIN이 검증합니다.
  return role === "ADMIN" || email === "test1234@naver.com";
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
  const activeUserIsAdmin = isAdmin(activeUser);

  if (isAuth && activeUser) {
    return (
      <div className="flex shrink-0 items-center gap-2 sm:gap-4 lg:gap-6">
        {activeUserIsAdmin ? (
          <Link
            href="/admin"
            aria-label={t("navigation.adminPage")}
            className="shrink-0 rounded-full border border-brand/20 bg-brand-soft px-4 py-2 text-xs font-black text-brand transition hover:border-brand hover:bg-brand hover:text-white"
          >
            {t("navigation.admin")}
          </Link>
        ) : (
          <Link
            href="/community/bookmarks"
            aria-label={t("navigation.likedCourses")}
            className="shrink-0 text-ink transition hover:text-brand"
          >
            <HeartIcon />
          </Link>
        )}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/mypage"
            className="hidden whitespace-nowrap text-sm font-bold text-ink transition hover:text-brand cursor-pointer sm:inline"
          >
            {t("common.memberGreeting", {
              name: activeUser.nickname || activeUser.name || "디또러버",
            })}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 whitespace-nowrap rounded-full border border-line bg-white px-2.5 py-1.5 text-[11px] font-bold text-ink-muted transition hover:border-brand hover:text-brand cursor-pointer sm:px-4 sm:py-2 sm:text-xs"
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
      className="shrink-0 rounded-full bg-brand px-3.5 py-2 text-sm font-black leading-none text-white transition hover:bg-brand-dark lg:px-5 lg:py-3 lg:text-base"
    >
      {t("common.login")}
    </Link>
  );
}
