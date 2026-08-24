"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const baseNavigation = [
  { href: "/ai-course", labelKey: "createCourse", badge: "NEW" },
  { href: "/#picks", labelKey: "courseRecommendations" },
  { href: "/#community", labelKey: "community" },
  { href: "/#newsletter", labelKey: "news" },
];

function subscribeHash(callback) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getHashSnapshot() {
  if (typeof window === "undefined") return "";
  return window.location.hash || "";
}

function getHashServerSnapshot() {
  return "";
}

function isItemActive(item, pathname, currentHash) {
  if (item.href === "/ai-course") {
    return pathname.startsWith("/ai-course");
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
  const currentHash = useSyncExternalStore(
    subscribeHash,
    getHashSnapshot,
    getHashServerSnapshot,
  );

  return (
    <nav className="hidden items-center gap-10 text-[17px] font-black lg:flex xl:gap-14 xl:text-lg 2xl:gap-16">
      {baseNavigation.map((item) => {
        const active = isItemActive(item, pathname, currentHash);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group inline-flex items-center transition-colors duration-300 ease-out hover:text-brand focus-visible:text-brand focus-visible:outline-none ${
              active ? "text-brand" : "text-ink"
            }`}
          >
            <span className="inline-flex transform-gpu items-center gap-2 will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:-translate-y-[3px] motion-reduce:transform-none motion-reduce:transition-none">
              {t(item.labelKey)}
              {item.badge ? (
                <span className="rounded-full bg-brand px-3 py-1 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              ) : null}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
