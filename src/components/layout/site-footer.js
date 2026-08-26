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
    <footer className="hidden bg-white px-10 pb-5 pt-8 sm:px-14 lg:block lg:px-52 xl:px-60 2xl:px-72">
      <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-4 xl:gap-x-10 2xl:gap-x-12">
        <div className="min-w-[140px]">
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

        <div className="relative flex h-[96px] w-[320px] shrink-0 items-center overflow-hidden rounded-2xl bg-linear-to-br from-[#2d1b8e] via-[#4a2fa8] to-[#6d28d9] pl-5 pr-[92px] text-white shadow-[0_6px_18px_rgba(45,27,142,0.16)]">
          <div className="min-w-0">
            <span className="block text-[10px] font-black tracking-wide text-violet-200">
              PWA MOBILE APP
            </span>
            <h3 className="mt-1.5 text-[16px] font-black leading-snug tracking-tight text-white">
              {t("home.appTitle")}
            </h3>
          </div>
          <Image
            src="/assets/common/footer-app-mockup.png"
            alt=""
            aria-hidden="true"
            width={110}
            height={119}
            className="pointer-events-none absolute -bottom-1 right-2.5 h-[90px] w-auto select-none"
          />
        </div>
      </div>
      <div className="mt-5 h-px bg-line" />
      <div className="mt-2 flex flex-col items-center justify-center gap-2 text-[10px] font-semibold text-ink-muted sm:flex-row sm:gap-5">
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
