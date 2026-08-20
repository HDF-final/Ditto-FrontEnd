"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";

const publicNavigation = [
  { href: "/", label: "홈" },
  { href: "/ai-course", label: "코스 만들기", badge: "NEW" },
  { href: "/#picks", label: "코스 추천" },
  { href: "/#community", label: "커뮤니티" },
  { href: "/news", label: "뉴스피드" },
];

export function HeaderNavLinks() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const navigation = [
    ...publicNavigation,
    ...(isAuthenticated ? [{ href: "/mypage", label: "마이페이지" }] : []),
  ];

  return (
    <nav className="hidden items-center gap-5 text-base font-black lg:flex xl:gap-6">
      {navigation.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap transition hover:text-brand ${
              isActive ? "text-brand" : "text-ink"
            }`}
          >
            {item.label}
            {item.badge ? (
              <span className="rounded-full bg-brand px-3 py-1 text-[10px] font-bold text-white">
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
