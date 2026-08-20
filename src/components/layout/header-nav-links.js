"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const navigation = [
  { href: "/ai-course", labelKey: "createCourse", badge: "NEW" },
  { href: "/#picks", labelKey: "courseRecommendations" },
  { href: "/#community", labelKey: "community" },
  { href: "/#newsletter", labelKey: "news" },
];

export function HeaderNavLinks() {
  const t = useTranslations("navigation");
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-8 text-[17px] font-black lg:flex xl:gap-10 xl:text-lg 2xl:gap-12">
      {navigation.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center gap-2 transition hover:text-brand ${
              isActive ? "text-brand" : "text-ink"
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
