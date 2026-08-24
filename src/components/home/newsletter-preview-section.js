import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { SectionHeading } from "@/components/home/section-heading";
import { newsletters as defaultNewsletters } from "@/lib/fixtures/home";

export async function NewsletterPreviewSection({ items = [] }) {
  const t = await getTranslations("home");
  const displayItems = items.length > 0 ? items.slice(0, 3) : defaultNewsletters;

  return (
    <section
      id="newsletter"
      className="scroll-mt-16 bg-surface-soft px-5 py-8 lg:scroll-mt-[94px] lg:px-52 lg:py-16 xl:px-60 2xl:px-72"
    >
      <SectionHeading
        eyebrow="DITTO NEWSLETTER"
        title={t("newsletterTitle")}
        description={t("newsletterDescription")}
        href="/news"
        linkLabel={t("allNews")}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-6">
        {displayItems.map((news) => {
          const category = news.label || news.category || (news.keywords?.[0] ? `${news.keywords[0]}` : null);
          const slug = news.slug || "";
          const href = slug ? `/news/${slug}` : "/news";

          return (
            <Link
              key={news.slug || news.title}
              href={href}
              className="group flex min-w-0 flex-col overflow-hidden rounded-[18px] border border-line bg-white shadow-[0_8px_20px_rgba(43,28,89,0.06)] lg:rounded-[24px] lg:transition lg:duration-200 lg:hover:-translate-y-1.5 lg:hover:shadow-[0_18px_32px_rgba(43,28,89,0.12)]"
            >
              <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-surface-muted lg:h-[210px] lg:aspect-auto">
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
              <div className="flex min-w-0 flex-1 flex-col justify-between p-3 lg:p-6">
                <h3 className="line-clamp-3 text-[13px] font-black leading-snug text-ink lg:line-clamp-2 lg:text-lg lg:transition-colors lg:group-hover:text-brand">
                  {news.title}
                </h3>
                {news.summary ? (
                  <p className="mt-2.5 hidden line-clamp-2 text-sm leading-relaxed text-ink-muted lg:block">
                    {news.summary}
                  </p>
                ) : null}
                {news.date ? (
                  <p className="mt-2 text-[10px] font-semibold text-ink-muted lg:mt-5 lg:border-t lg:border-line/60 lg:pt-4 lg:text-xs">
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
