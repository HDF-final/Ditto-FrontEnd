import Link from "next/link";
import Image from "next/image";

import { SectionHeading } from "@/components/home/section-heading";
import { newsletters as defaultNewsletters } from "@/lib/fixtures/home";

export function NewsletterPreviewSection({ items = [] }) {
  const displayItems = items.length > 0 ? items.slice(0, 3) : defaultNewsletters;

  return (
    <section
      id="newsletter"
      className="scroll-mt-16 bg-surface-soft px-5 py-8 lg:scroll-mt-[94px] lg:px-52 lg:py-16 xl:px-60 2xl:px-72"
    >
      <SectionHeading
        eyebrow="DITTO NEWSLETTER"
        title="DITTO 임팩트 소식"
        description="K-컬처와 브랜드, 그리고 우리 사회에 선한 변화를 만드는 소식을 전해드려요."
        href="/news"
        linkLabel="뉴스 전체보기"
      />
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        {displayItems.map((news) => {
          const category = news.label || news.category || (news.keywords?.[0] ? `${news.keywords[0]}` : null);
          const slug = news.slug || "";
          const href = slug ? `/news/${slug}` : "/news";

          return (
            <Link
              key={news.slug || news.title}
              href={href}
              className="group flex overflow-hidden rounded-[20px] border border-line bg-white shadow-[0_8px_20px_rgba(43,28,89,0.06)] lg:flex-col lg:rounded-[24px] lg:transition lg:duration-200 lg:hover:-translate-y-1.5 lg:hover:shadow-[0_18px_32px_rgba(43,28,89,0.12)]"
            >
              <div className="relative h-[92px] w-[92px] shrink-0 overflow-hidden bg-surface-muted lg:h-[210px] lg:w-full">
                {news.representativeImageUrl ? (
                  <Image
                    src={news.representativeImageUrl}
                    alt={news.title}
                    fill
                    unoptimized
                    className="object-cover lg:transition lg:duration-300 lg:group-hover:scale-105"
                  />
                ) : (
                  <div
                    className={`h-full w-full bg-linear-to-br ${news.gradient || "from-[#2d1b8e] to-[#5c2ef5]"}`}
                  />
                )}
                {category ? (
                  <span className="absolute left-4 top-4 hidden rounded-full bg-white/95 px-3.5 py-1 text-xs font-black text-brand shadow-sm lg:inline-flex">
                    {category}
                  </span>
                ) : null}
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center p-3.5 lg:justify-between lg:p-6">
                {category ? (
                  <span className="mb-1 text-[10px] font-black text-brand lg:hidden">
                    {category}
                  </span>
                ) : null}
                <h3 className="line-clamp-2 text-sm font-black leading-snug text-ink lg:text-lg lg:transition-colors lg:group-hover:text-brand">
                  {news.title}
                </h3>
                {news.summary ? (
                  <p className="mt-2.5 hidden line-clamp-2 text-sm leading-relaxed text-ink-muted lg:block">
                    {news.summary}
                  </p>
                ) : null}
                {news.date ? (
                  <p className="mt-1 text-[11px] font-semibold text-ink-muted lg:mt-5 lg:border-t lg:border-line/60 lg:pt-4 lg:text-xs">
                    {news.date}
                  </p>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
