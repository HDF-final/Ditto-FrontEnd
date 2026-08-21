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
          <HeaderAuthNav />
        </div>
      </div>
    </header>
  );
}
