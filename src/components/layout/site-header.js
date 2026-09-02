"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { HeaderNavLinks } from "./header-nav-links";
import { HeaderAuthNav } from "./header-auth-nav";
import { HeaderLanguageSwitcher } from "./header-language-switcher";

export function SiteHeader() {
  const t = useTranslations("navigation");

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white">
      <div className="flex min-h-[var(--app-header)] flex-nowrap items-center justify-between gap-3 px-4 py-2 sm:px-8 lg:grid lg:min-h-[94px] lg:grid-cols-[1fr_auto_1fr] lg:gap-4 lg:px-10 lg:py-4 xl:px-14 2xl:px-20">
        <div className="flex shrink-0 items-center justify-start">
          <Link href="/" className="block shrink-0" aria-label={t("dittoHome")}>
            <div className="flex flex-col">
              <Image
                src="/assets/common/ditto-logo.svg"
                alt="DITTO"
                width={137}
                height={43}
                priority
                className="h-7 w-auto lg:h-auto lg:w-[137px]"
              />
              <span className="mt-1 hidden whitespace-nowrap text-[13px] font-medium leading-none text-ink-muted lg:block">
                K-Culture Shopping Mate
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center justify-center">
          <HeaderNavLinks />
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 text-ink sm:gap-5">
          <HeaderLanguageSwitcher />
          <HeaderAuthNav />
        </div>
      </div>
    </header>
  );
}
