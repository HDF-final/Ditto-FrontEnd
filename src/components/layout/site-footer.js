import Image from "next/image";
import Link from "next/link";

const footerGroups = [
  {
    title: "서비스",
    links: [
      { href: "/ai-course", label: "AI 코스 만들기" },
      { href: "/courses", label: "코스 리스트" },
      { href: "/community", label: "커뮤니티" },
      { href: "/news", label: "뉴스피드" },
    ],
  },
  {
    title: "고객지원",
    links: [
      { href: "/news", label: "자주 묻는 질문" },
      { href: "/community", label: "문의하기" },
      { href: "/news", label: "공지사항" },
    ],
  },
  {
    title: "DITTO",
    links: [
      { href: "/", label: "회사 소개" },
      { href: "/community", label: "제휴 문의" },
      { href: "/news", label: "채용" },
    ],
  },
];

const policyLinks = [
  { href: "/", label: "이용약관" },
  { href: "/", label: "개인정보처리방침" },
  { href: "/", label: "위치기반서비스 이용약관" },
];

export function SiteFooter() {
  return (
    <footer className="bg-surface">
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-16 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.2fr_3fr]">
          <Link href="/" className="flex w-fit flex-col items-start" aria-label="DITTO 홈">
            <Image
              src="/assets/common/ditto-logo.svg"
              alt="DITTO"
              width={118}
              height={40}
              className="h-auto w-[118px]"
            />
            <span className="mt-1 text-[11px] font-medium text-ink-muted">
              K-Culture Shopping Mate
            </span>
          </Link>

          <nav className="grid gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h2 className="text-sm font-black text-ink">{group.title}</h2>
                <ul className="mt-4 space-y-3 text-sm font-medium text-ink-muted">
                  {group.links.map((item) => (
                    <li key={`${group.title}-${item.label}`}>
                      <Link href={item.href} className="transition hover:text-brand">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-line pt-6 text-xs font-medium text-ink-muted sm:flex-row sm:items-center">
          <p>© 2026 DITTO. All rights reserved.</p>
          <nav className="flex flex-wrap gap-x-7 gap-y-2">
            {policyLinks.map((item) => (
              <Link key={item.label} href={item.href} className="transition hover:text-brand">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
