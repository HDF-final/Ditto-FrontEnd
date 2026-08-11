import Image from "next/image";
import Link from "next/link";

const navigation = [
  { href: "/", label: "홈" },
  { href: "/ai-course", label: "코스 만들기", badge: "NEW" },
  { href: "/courses", label: "코스 추천" },
  { href: "/community", label: "커뮤니티" },
  { href: "/news", label: "뉴스피드" },
  { href: "/mypage", label: "마이페이지" },
];

const utilityLinks = [
  { href: "/news", label: "언어/국가", icon: "◎" },
  { href: "/courses", label: "관심 코스", icon: "♡" },
  { href: "/mypage", label: "마이페이지", icon: "◉" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-surface">
      <div className="mx-auto grid h-24 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-6 px-5 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 flex-col items-start"
          aria-label="DITTO 홈"
        >
          <Image
            src="/assets/common/ditto-logo.svg"
            alt="DITTO"
            width={118}
            height={40}
            className="h-auto w-[118px]"
            priority
          />
          <span className="mt-0.5 text-[11px] font-medium text-ink-muted">
            K-Culture Shopping Mate
          </span>
        </Link>

        <nav className="hidden items-center justify-center gap-7 text-sm font-black text-ink lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-2 transition hover:text-brand focus-visible:rounded-control"
            >
              <span className={item.href === "/" ? "text-brand" : ""}>
                {item.label}
              </span>
              {item.badge ? (
                <span className="rounded-control bg-brand px-3 py-1 text-[11px] font-black text-white">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        <nav className="hidden items-center justify-end gap-6 lg:flex">
          {utilityLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-3xl leading-none text-ink transition hover:text-brand"
              aria-label={item.label}
            >
              {item.icon}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
