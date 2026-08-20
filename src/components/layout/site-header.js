import Image from "next/image";
import Link from "next/link";

import { HeaderNavLinks } from "./header-nav-links";
import { HeaderAuthNav } from "./header-auth-nav";

function GlobeIcon({ className = "size-5" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
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
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur-md lg:hidden">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <Link href="/" className="block shrink-0" aria-label="DITTO 홈">
            <Image
              src="/assets/common/ditto-logo.svg"
              alt="DITTO"
              width={96}
              height={30}
              priority
              style={{ width: "96px", height: "auto" }}
            />
          </Link>

          <div className="flex items-center gap-3 text-ink">
            <Link
              href="/country"
              aria-label="국가·언어 선택"
              className="hover:text-brand"
            >
              <GlobeIcon />
            </Link>
            <HeaderAuthNav />
          </div>
        </div>
      </header>

      <header className="sticky top-0 z-50 hidden border-b border-line bg-white lg:block">
        <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-4 px-6 sm:px-10 xl:px-16">
          <Link href="/" className="block shrink-0" aria-label="DITTO 홈">
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

          <HeaderNavLinks />

          <div className="flex items-center gap-4 text-ink">
            <Link
              href="/country"
              aria-label="국가·언어 선택"
              className="hover:text-brand"
            >
              <GlobeIcon className="size-[27px]" />
            </Link>
            <HeaderAuthNav />
          </div>
        </div>
      </header>
    </>
  );
}
