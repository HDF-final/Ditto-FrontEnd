"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/", label: "홈" },
  { href: "/ai-course", label: "코스 만들기", badge: "NEW" },
  { href: "/courses", label: "코스 추천" },
  { href: "/community", label: "커뮤니티" },
  { href: "/news", label: "뉴스피드" },
  { href: "/mypage", label: "마이페이지" },
];

function isNavActive(href, pathname) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

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

function HeartIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-[27px]"
      viewBox="0 0 27 27"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23.1 7.42c-2.03-3.15-6.57-2.87-8.46-.45L13.5 8.43l-1.14-1.46c-1.89-2.42-6.43-2.7-8.46.45-1.73 2.69-.96 6.2 1.48 8.43l8.12 7.42 8.12-7.42c2.44-2.23 3.21-5.74 1.48-8.43Z" />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white">
      <div className="flex h-[94px] items-center justify-between gap-6 px-10 sm:px-14 lg:px-52 xl:px-60 2xl:px-72">
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

        <nav className="hidden items-center gap-6 text-base font-black lg:flex">
          {navigation.map((item) => {
            const active = isNavActive(item.href, pathname);
            const className = `inline-flex items-center gap-2 transition hover:text-brand ${
              active ? "text-brand" : "text-ink"
            }`;
            const content = (
              <>
                {item.label}
                {item.badge ? (
                  <span className="rounded-full bg-brand px-3 py-1 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </>
            );

            if (active) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current="page"
                  className={className}
                >
                  {content}
                </a>
              );
            }

            return (
              <Link key={item.href} href={item.href} className={className}>
                {content}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-6 text-ink">
          <Link
            href="/country"
            aria-label="국가·언어 선택"
            className="hover:text-brand"
          >
            <GlobeIcon />
          </Link>
          <Link
            href="/community"
            aria-label="관심 코스"
            className="hover:text-brand"
          >
            <HeartIcon />
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-brand px-5 py-3 text-base font-black leading-none text-white transition hover:bg-brand-dark"
          >
            로그인
          </Link>
        </div>
      </div>
    </header>
  );
}
