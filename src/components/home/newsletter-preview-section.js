import Link from "next/link";

import { newsletters } from "@/lib/fixtures/home";
import { SectionHeading } from "@/components/home/section-heading";

export function NewsletterPreviewSection() {
  return (
    <section
      id="newsletter"
      className="scroll-mt-[94px] bg-surface-soft px-6 sm:px-8 py-16 lg:px-28 xl:px-32"
    >
      <SectionHeading
        eyebrow="DITTO NEWSLETTER"
        title="차근차근 나아가는 임팩트 소식"
        description="K-컬처와 브랜드, 그리고 우리 사회에 선한 변화를 만드는 소식을 전해드려요."
        href="/news"
        linkLabel="뉴스 전체보기"
      />
      <div className="grid gap-5 lg:grid-cols-3">
        {newsletters.map((news) => (
          <Link
            key={news.title}
            href="/news"
            className="overflow-hidden rounded-[20px] bg-white shadow-[0_8px_20px_rgba(43,28,89,0.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_32px_rgba(43,28,89,0.14)]"
          >
            <div
              className={`h-[170px] bg-linear-to-br ${news.gradient} p-4`}
            >
              {news.category ? (
                <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-black text-accent">
                  {news.category}
                </span>
              ) : null}
            </div>
            <div className="p-5">
              <h3 className="min-h-12 text-base font-black leading-snug text-ink">
                {news.title}
              </h3>
              <div className="mt-4 flex justify-between text-xs text-ink-muted">
                <span>{news.date}</span>
                <span>{news.readTime}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-7 flex justify-center gap-2" aria-hidden="true">
        <span className="h-2 w-5 rounded-full bg-brand" />
        <span className="h-2 w-2 rounded-full bg-[#d9d5e8]" />
        <span className="h-2 w-2 rounded-full bg-[#d9d5e8]" />
        <span className="h-2 w-2 rounded-full bg-[#d9d5e8]" />
      </div>
    </section>
  );
}
