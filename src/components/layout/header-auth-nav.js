"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/use-auth-store";
import { logout } from "@/lib/api/auth";

export function HeaderAuthNav() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearUser = useAuthStore((state) => state.clearUser);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      clearUser();
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-ink">
          {user.nickname || user.name || "회원"}님
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-line bg-white px-4 py-2 text-xs font-bold text-ink-muted transition hover:border-brand hover:text-brand cursor-pointer"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="rounded-full bg-brand px-5 py-3 text-base font-black leading-none text-white transition hover:bg-brand-dark"
    >
      로그인
    </Link>
  );
}
