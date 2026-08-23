"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { HeaderNavLinks } from "./header-nav-links";
import { HeaderAuthNav } from "./header-auth-nav";

export function SiteHeader() {
  const t = useTranslations("navigation");

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white">
      <div className="flex lg:grid lg:grid-cols-[1fr_auto_1fr] min-h-[62px] sm:min-h-[94px] items-center justify-between gap-2 px-3.5 py-2.5 sm:gap-4 sm:px-8 sm:py-4 lg:px-10 xl:px-14 2xl:px-20">
        <div className="flex items-center justify-start shrink-0">
          <Link href="/" className="block shrink-0" aria-label={t("dittoHome")}>
            <div className="flex flex-col">
              <Image
                src="/assets/common/ditto-logo.svg"
                alt="DITTO"
                width={137}
                height={43}
                priority
                className="w-[96px] sm:w-[137px] h-auto"
              />
              <span className="mt-0.5 sm:mt-1 whitespace-nowrap text-[9px] sm:text-[13px] font-medium leading-none text-ink-muted">
                K-Culture Shopping Mate
              </span>
            </div>
          </Link>
        </div>

        <div className="hidden lg:flex items-center justify-center">
          <HeaderNavLinks />
        </div>

        <div className="flex items-center justify-end gap-1.5 text-ink sm:gap-5 shrink-0">
          <HeaderAuthNav />
        </div>
      </div>
    </header>
  );
}
