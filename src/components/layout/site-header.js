import Link from "next/link";

import { CountrySelector } from "@/components/common/country-selector";

const navigation = [
  { href: "/ai-course", label: "AI 코스 만들기" },
  { href: "/courses", label: "코스 리스트" },
  { href: "/community", label: "커뮤니티" },
  { href: "/news", label: "뉴스피드" },
  { href: "/mypage", label: "마이페이지" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 lg:px-8">
        <Link href="/" className="shrink-0" aria-label="DITTO 홈">
          <span className="text-2xl font-black tracking-tight text-ink">
            Di<span className="text-brand">tt</span>o
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-ink-muted lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <CountrySelector />
      </div>
    </header>
  );
}
