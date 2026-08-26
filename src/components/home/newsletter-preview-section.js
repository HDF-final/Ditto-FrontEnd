import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { SectionHeading } from "@/components/home/section-heading";
import { NewsletterPreviewSlider } from "@/components/home/newsletter-preview-slider";
import { newsletters as defaultNewsletters } from "@/lib/fixtures/home";

export async function NewsletterPreviewSection({ items = [] }) {
  const t = await getTranslations("home");
  // 모바일 슬라이더는 최대 5개까지 넘기고, 데스크톱 그리드는 3개만 노출
  const mobileItems = items.length > 0 ? items.slice(0, 5) : defaultNewsletters;
  const desktopItems = items.length > 0 ? items.slice(0, 3) : defaultNewsletters;

  return (
    <section
      id="newsletter"
      className="scroll-mt-16 bg-surface-soft px-5 py-8 lg:flex lg:min-h-0 lg:flex-1 lg:scroll-mt-0 lg:flex-col lg:justify-center lg:px-0 lg:py-[clamp(22px,3.5dvh,40px)]"
    >
      <div className="home-content-boundary">
        <SectionHeading
          eyebrow="DITTO NEWSLETTER"
          title={t("newsletterTitle")}
          description={t("newsletterDescription")}
          href="/news"
          linkLabel={t("allNews")}
        />
        {/* 모바일: 드래그 슬라이더 (최대 5개) */}
        <NewsletterPreviewSlider items={mobileItems} />

        {/* 데스크톱: 3열 그리드 */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
          {desktopItems.map((news) => {
          const category = news.label || news.category || (news.keywords?.[0] ? `${news.keywords[0]}` : null);
          const slug = news.slug || "";
          const href = slug ? `/news/${slug}` : "/news";

          return (
            <Link
              key={news.slug || news.title}
              href={href}
              className="home-news-card group flex min-w-0 flex-col overflow-hidden rounded-[18px] border border-line bg-white shadow-[0_8px_20px_rgba(43,28,89,0.06)] lg:rounded-[24px] lg:transition lg:duration-200 lg:hover:-translate-y-1.5 lg:hover:shadow-[0_18px_32px_rgba(43,28,89,0.12)]"
            >
                  <div className="home-news-image relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-surface-muted lg:h-[clamp(132px,18dvh,210px)] lg:aspect-auto">
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
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2 py-1 text-[10px] font-black text-brand shadow-sm lg:left-4 lg:top-4 lg:px-3.5 lg:text-xs">
                    {category}
                  </span>
                ) : null}
              </div>
              <div className="home-news-copy flex min-w-0 flex-1 flex-col justify-between p-3 lg:p-[clamp(16px,2.2dvh,24px)]">
                <h3 className="line-clamp-3 text-[13px] font-black leading-snug text-ink lg:line-clamp-2 lg:text-lg lg:transition-colors lg:group-hover:text-brand">
                  {news.title}
                </h3>
                {news.summary ? (
                  <p className="home-news-summary mt-2.5 hidden line-clamp-2 text-sm leading-relaxed text-ink-muted lg:block">
                    {news.summary}
                  </p>
                ) : null}
                {news.date ? (
                  <p className="home-news-date mt-2 text-[10px] font-semibold text-ink-muted lg:mt-5 lg:border-t lg:border-line/60 lg:pt-4 lg:text-xs">
                    {news.date}
                  </p>
                ) : null}
              </div>
            </Link>
          );
          })}
        </div>
      </div>
    </section>
  );
}
