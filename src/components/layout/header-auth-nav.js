"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/use-auth-store";
import { logout } from "@/lib/api/auth";

function HeartIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-[27px]"
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
      <div className="flex items-center gap-6">
        <Link
          href="/community/bookmarks"
          aria-label="내가 좋아요한 커뮤니티 코스"
          className="text-ink transition hover:text-brand"
        >
          <HeartIcon />
        </Link>
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
