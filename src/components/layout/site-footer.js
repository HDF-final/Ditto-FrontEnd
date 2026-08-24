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
      <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
        {/* 왼쪽: 로고 및 내비게이션 링크 */}
        <div className="flex flex-wrap items-start gap-x-10 gap-y-5 xl:gap-x-14">
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
        </div>

        {/* 오른쪽: 글자가 잘리지 않고 목업과 쾌적한 여백을 유지하는 배너 */}
        <div className="shrink-0 overflow-hidden rounded-[24px] bg-linear-to-br from-[#2d1b8e] via-[#4a2fa8] to-[#6d28d9] px-6 py-5 text-white shadow-[0_8px_24px_rgba(45,27,142,0.18)] lg:w-[580px] xl:w-[630px] 2xl:w-[670px]">
          <div className="flex items-center justify-between gap-6 xl:gap-8">
            {/* 좌측 안내 텍스트 (글자가 잘리지 않도록 안전 여백 확보) */}
            <div className="min-w-0 flex-1">
              <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10.5px] font-black tracking-wider uppercase text-violet-200 backdrop-blur-xs xl:text-[11px]">
                PWA MOBILE APP
              </span>
              <h3 className="mt-1.5 whitespace-nowrap text-[17px] font-black tracking-tight text-white sm:text-[19px] xl:text-[21px]">
                {t("home.appTitle")}
              </h3>
              <p className="mt-1.5 whitespace-nowrap text-[12px] leading-relaxed text-violet-100 sm:text-[12.5px] xl:text-[13px]">
                {t("home.appDescription")}
              </p>
              <p className="mt-2 whitespace-nowrap text-[11px] font-semibold text-violet-200 xl:text-[11.5px]">
                {t("home.browserInstallHint")}
              </p>
            </div>

            {/* 우측: 사진/목업 */}
            <div className="relative h-[88px] w-[130px] shrink-0 overflow-hidden rounded-[14px] border-[2.5px] border-slate-900 bg-slate-900 shadow-[0_10px_25px_rgba(0,0,0,0.35)] xl:h-[92px] xl:w-[138px]">
              {/* 상단 카메라 렌즈 홈 */}
              <div className="absolute left-2 top-1/2 z-20 h-2 w-1 -translate-y-1/2 rounded-full bg-slate-700" />

              {/* 스크린 화면 */}
              <div className="absolute inset-[2px] flex flex-col overflow-hidden rounded-[11px] bg-[#f8f6f0]">
                {/* 상단 미니 앱 바 */}
                <div className="flex items-center justify-between bg-white/90 px-2 py-0.5 text-[7.5px] font-black text-ink shadow-2xs backdrop-blur-xs">
                  <span className="flex items-center gap-1 text-[#4a2fa8]">
                    <span className="size-1 rounded-full bg-[#4a2fa8]" />
                    Ditto Map
                  </span>
                  <span className="rounded bg-brand/10 px-1 py-0.2 text-[6.5px] font-bold text-brand">
                    B2F 길찾기
                  </span>
                </div>

                {/* 가로형 실내 맵 도면 & 네비게이션 경로 */}
                <div className="relative flex-1 bg-[#f4f1ea]">
                  <svg
                    viewBox="0 0 160 85"
                    className="h-full w-full"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <rect width="160" height="85" fill="#f4f1ea" />

                    {/* 매장 구역 블록들 */}
                    <g fill="#e6e1d6" stroke="#dad4c5" strokeWidth="0.8">
                      <rect x="8" y="8" width="36" height="26" rx="3" />
                      <rect x="52" y="8" width="40" height="24" rx="3" />
                      <rect x="100" y="8" width="48" height="28" rx="3" />

                      <rect x="8" y="48" width="44" height="28" rx="3" />
                      <rect x="60" y="48" width="36" height="28" rx="3" />
                      <rect x="104" y="46" width="46" height="30" rx="3" />
                    </g>

                    {/* 추천 매장 하이라이트 */}
                    <rect x="10" y="10" width="18" height="12" rx="2" fill="#d1fae5" />
                    <rect x="62" y="50" width="20" height="14" rx="2" fill="#fce7f3" />
                    <rect x="106" y="48" width="22" height="14" rx="2" fill="#ede9fe" />

                    {/* 실시간 길찾기 추천 동선 (오렌지 점선) */}
                    <polyline
                      points="26,68 26,38 78,38 78,16 128,16 128,42"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="1 5"
                    />

                    {/* 출발지 핀 */}
                    <circle cx="26" cy="68" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
                    {/* 도착지 핀 (목적지 펄스) */}
                    <circle cx="128" cy="42" r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                    <circle cx="128" cy="42" r="9" fill="#ef4444" fillOpacity="0.3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
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
