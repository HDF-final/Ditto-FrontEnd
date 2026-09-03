"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/use-auth-store";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { logout } from "@/lib/api/auth";

function isAdmin(user) {
  const role = String(user?.role || "")
    .trim()
    .replace(/^ROLE_/i, "")
    .toUpperCase();
  const email = String(user?.email || "").trim().toLowerCase();
  const nickname = String(user?.nickname || user?.name || "").trim();
  const userId = Number(user?.id || user?.userId || 0);

  return (
    role === "ADMIN" ||
    userId === 1 ||
    nickname === "구본희" ||
    email === "yuki@example.com" ||
    email === "test1234@naver.com"
  );
}

export function HeaderAuthNav() {
  const navT = useTranslations("navigation");
  const commonT = useTranslations("common");
  const mounted = useIsMounted();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearUser = useAuthStore((state) => state.clearUser);

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      window.sessionStorage?.setItem("ditto_logged_out", "true");
      window.sessionStorage?.removeItem("ditto_manual_login");
      window.sessionStorage?.removeItem("ditto_manual_user");
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
            aria-label={navT("adminPage")}
            className="shrink-0 rounded-full border border-brand/20 bg-brand-soft px-4 py-2 text-xs font-black text-brand transition hover:border-brand hover:bg-brand hover:text-white"
          >
            {navT("admin")}
          </Link>
        ) : null}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/mypage"
            className="hidden whitespace-nowrap text-sm font-bold text-ink transition hover:text-brand cursor-pointer sm:inline"
          >
            {commonT("memberGreeting", {
              name: activeUser.nickname || activeUser.name || "디또러버",
            })}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 whitespace-nowrap rounded-full border border-line bg-white px-2.5 py-1.5 text-[11px] font-bold text-ink-muted transition hover:border-brand hover:text-brand cursor-pointer sm:px-4 sm:py-2 sm:text-xs"
          >
            {commonT("logout")}
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
      {commonT("login")}
    </Link>
  );
}
