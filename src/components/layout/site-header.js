"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { HeaderNavLinks } from "./header-nav-links";
import { HeaderAuthNav } from "./header-auth-nav";
import { CountrySelector } from "@/components/common/country-selector";

function GlobeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-[27px]"
      viewBox="0 0 27 27"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="13.5" cy="13.5" r="11.25" />
      <path d="M2.25 13.5h22.5" />
      <path d="M13.5 2.25c3.15 3.08 4.73 6.83 4.73 11.25s-1.58 8.17-4.73 11.25c-3.15-3.08-4.73-6.83-4.73-11.25s1.58-8.17 4.73-11.25Z" />
    </svg>
  );
}

export function SiteHeader() {
  const t = useTranslations("navigation");

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white">
      <div className="flex lg:grid lg:grid-cols-[1fr_auto_1fr] min-h-[94px] items-center justify-between gap-4 px-4 py-4 sm:px-8 lg:px-10 xl:px-14 2xl:px-20">
        <div className="flex items-center justify-start">
          <Link href="/" className="block shrink-0" aria-label={t("dittoHome")}>
            <div className="flex flex-col">
              <Image
                src="/assets/common/ditto-logo.svg"
                alt="DITTO"
                width={137}
                height={43}
                priority
                style={{ width: "137px", height: "auto" }}
              />
              <span className="mt-1 whitespace-nowrap text-[13px] font-medium leading-none text-ink-muted">
                K-Culture Shopping Mate
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center justify-center">
          <HeaderNavLinks />
        </div>

        <div className="flex items-center justify-end gap-3 text-ink sm:gap-5">
          <div className="hidden xl:block">
            <CountrySelector />
          </div>
          <Link
            href="/country"
            aria-label={t("preferences")}
            className="hover:text-brand xl:hidden"
          >
            <GlobeIcon />
          </Link>
          <HeaderAuthNav />
        </div>
      </div>
    </header>
  );
}
