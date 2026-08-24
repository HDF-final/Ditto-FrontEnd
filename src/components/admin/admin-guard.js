"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/use-auth-store";

function isAdmin(user) {
  return String(user?.role || "").replace(/^ROLE_/, "") === "ADMIN";
}

export function AdminGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, isAuthenticated, pathname, router]);

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#f3f5fa]">
        <div className="flex items-center gap-3 text-sm font-semibold text-[#596078]">
          <span className="size-5 animate-spin rounded-full border-2 border-[#d9ddef] border-t-brand" />
          관리자 권한을 확인하고 있어요
        </div>
      </div>
    );
  }

  if (!isAdmin(user)) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#f3f5fa] px-6">
        <section className="w-full max-w-lg rounded-[28px] border border-[#e2e5ef] bg-white p-10 text-center shadow-[0_24px_80px_rgba(30,35,64,0.08)]">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#f2edff] text-2xl">🔒</div>
          <h1 className="mt-6 text-2xl font-bold text-[#171b30]">관리자 전용 페이지예요</h1>
          <p className="mt-3 text-sm leading-6 text-[#70768d]">
            현재 계정에는 관리자 권한이 없습니다. 관리자 계정으로 다시 로그인해주세요.
          </p>
          <Link href="/" className="mt-7 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-bold text-white">
            서비스로 돌아가기
          </Link>
        </section>
      </main>
    );
  }

  return children;
}
