"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

const footerColumns = [
  {
    titleKey: "service",
    links: [
      { href: "/ai-course", labelKey: "aiCourse" },
      { href: "/courses", labelKey: "courseList" },
      { href: "/community", labelKey: "community" },
      { href: "/news", labelKey: "news" },
    ],
  },
  {
    titleKey: "support",
    links: [
      { href: "/news", labelKey: "faq" },
      { href: "/news", labelKey: "contact" },
      { href: "/news", labelKey: "notices" },
    ],
  },
  {
    titleKey: "ditto",
    links: [
      { href: "/news", labelKey: "about" },
      { href: "/news", labelKey: "partnership" },
      { href: "/news", labelKey: "careers" },
    ],
  },
];

export function SiteFooter() {
  const t = useTranslations();

  return (
    <footer className="hidden bg-white px-10 pb-5 pt-[34px] sm:px-14 lg:block lg:px-52 xl:px-60 2xl:px-72">
      <div className="flex flex-wrap gap-x-[62px] gap-y-5">
        <div className="min-w-[150px]">
          <Link href="/" className="block" aria-label={t("navigation.dittoHome")}>
            <Image
              src="/assets/common/ditto-logo.svg"
              alt="Ditto"
              width={137}
              height={43}
              style={{ width: "137px", height: "auto" }}
            />
          </Link>
          <p className="mt-0.5 whitespace-nowrap text-[11px] font-bold leading-none tracking-[-0.02em] text-ink-muted">
            K-Culture Shopping Mate
          </p>
        </div>
        {footerColumns.map((column) => (
          <div key={column.titleKey} className="flex min-w-[70px] flex-col gap-[6px]">
            <p className="text-xs font-black leading-none text-ink">
              {column.titleKey === "ditto"
                ? "DITTO"
                : t(`footer.${column.titleKey}`)}
            </p>
            {column.links.map((link) => (
              <Link
                key={link.labelKey}
                href={link.href}
                className="text-xs leading-none text-ink-muted transition hover:text-brand"
              >
                {link.labelKey === "community"
                  ? t("navigation.community")
                  : link.labelKey === "news"
                    ? t("navigation.news")
                    : t(`footer.${link.labelKey}`)}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-6 h-px bg-line" />
      <div className="mt-2 flex flex-col gap-2 text-[10px] font-semibold text-ink-muted sm:flex-row sm:items-center sm:gap-5">
        <span>© 2026 DITTO. All rights reserved.</span>
        <div className="flex flex-wrap gap-6">
          <Link href="/news">{t("footer.terms")}</Link>
          <Link href="/news">{t("footer.privacy")}</Link>
          <Link href="/news">{t("footer.locationTerms")}</Link>
        </div>
      </div>
    </footer>
  );
}
