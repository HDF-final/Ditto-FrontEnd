import Image from "next/image";
import Link from "next/link";

const footerColumns = [
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
      { href: "/news", label: "문의하기" },
      { href: "/news", label: "공지사항" },
    ],
  },
  {
    title: "DITTO",
    links: [
      { href: "/news", label: "회사 소개" },
      { href: "/news", label: "제휴 문의" },
      { href: "/news", label: "채용" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-white px-10 pb-5 pt-[34px] sm:px-14 lg:px-52 xl:px-60 2xl:px-72">
      <div className="flex flex-wrap gap-x-[62px] gap-y-5">
        <div className="min-w-[150px]">
          <Link href="/" className="block" aria-label="DITTO 홈">
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
          <div key={column.title} className="flex min-w-[70px] flex-col gap-[6px]">
            <p className="text-xs font-black leading-none text-ink">{column.title}</p>
            {column.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs leading-none text-ink-muted transition hover:text-brand"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-6 h-px bg-line" />
      <div className="mt-2 flex flex-col gap-2 text-[10px] font-semibold text-ink-muted sm:flex-row sm:items-center sm:gap-5">
        <span>© 2026 DITTO. All rights reserved.</span>
        <div className="flex flex-wrap gap-6">
          <Link href="/news">이용약관</Link>
          <Link href="/news">개인정보처리방침</Link>
          <Link href="/news">위치기반서비스 이용약관</Link>
        </div>
      </div>
    </footer>
  );
}
