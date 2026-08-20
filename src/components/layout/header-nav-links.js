"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/use-auth-store";
import { useIsMounted } from "@/hooks/use-is-mounted";

const baseNavigation = [
  { href: "/ai-course", labelKey: "createCourse", badge: "NEW" },
  { href: "/#picks", labelKey: "courseRecommendations" },
  { href: "/#community", labelKey: "community" },
  { href: "/#newsletter", labelKey: "news" },
];

function subscribeHash(callback) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getHashSnapshot() {
  return window.location.hash;
}

function getHashServerSnapshot() {
  return "";
}

function isItemActive(item, pathname, currentHash) {
  if (item.href === "/ai-course") {
    return pathname.startsWith("/ai-course");
  }
  if (item.href === "/mypage") {
    return pathname.startsWith("/mypage");
  }
  if (item.href === "/#picks" || item.href === "/courses") {
    if (pathname.startsWith("/courses")) return true;
    if (pathname === "/" && currentHash === "#picks") return true;
    return false;
  }
  if (item.href === "/#community" || item.href === "/community") {
    if (pathname.startsWith("/community")) return true;
    if (pathname === "/" && currentHash === "#community") return true;
    return false;
  }
  if (item.href === "/#newsletter" || item.href === "/news") {
    if (pathname.startsWith("/news")) return true;
    if (pathname === "/" && currentHash === "#newsletter") return true;
    return false;
  }
  return pathname === item.href;
}

export function HeaderNavLinks() {
  const t = useTranslations("navigation");
  const pathname = usePathname();
  const isMounted = useIsMounted();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const currentHash = useSyncExternalStore(
    subscribeHash,
    getHashSnapshot,
    getHashServerSnapshot,
  );

  const navigation = [
    ...baseNavigation,
    ...(isMounted && isAuthenticated && user
      ? [{ href: "/mypage", labelKey: "mypage" }]
      : []),
  ];

  return (
    <nav className="hidden items-center gap-7 text-[17px] font-black lg:flex xl:gap-9 xl:text-lg 2xl:gap-11">
      {navigation.map((item) => {
        const active = isMounted && isItemActive(item, pathname, currentHash);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center gap-2 transition-colors ${
              active ? "text-brand" : "text-ink hover:text-brand"
            }`}
          >
            {t(item.labelKey)}
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
