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
      className="scroll-mt-[94px] bg-surface-soft px-10 sm:px-14 py-16 lg:px-52 xl:px-60 2xl:px-72"
    >
      <SectionHeading
        eyebrow="DITTO NEWSLETTER"
        title={t("newsletterTitle")}
        description={t("newsletterDescription")}
        href="/news"
        linkLabel={t("allNews")}
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayItems.map((news) => {
          const category = news.label || news.category || (news.keywords?.[0] ? `${news.keywords[0]}` : null);
          const slug = news.slug || "";
          const href = slug ? `/news/${slug}` : "/news";

          return (
            <Link
              key={news.slug || news.title}
              href={href}
              className="group flex flex-col overflow-hidden rounded-[24px] border border-line bg-white shadow-[0_8px_20px_rgba(43,28,89,0.06)] transition duration-200 hover:-translate-y-1.5 hover:shadow-[0_18px_32px_rgba(43,28,89,0.12)]"
            >
              <div className="relative h-[210px] w-full overflow-hidden bg-surface-muted">
                {news.representativeImageUrl ? (
                  <Image
                    src={news.representativeImageUrl}
                    alt={news.title}
                    fill
                    unoptimized
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className={`h-full w-full bg-linear-to-br ${news.gradient || "from-[#2d1b8e] to-[#5c2ef5]"}`}
                  />
                )}
                {category ? (
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3.5 py-1 text-xs font-black text-brand shadow-sm">
                    {category}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <h3 className="line-clamp-2 text-lg font-black leading-snug text-ink group-hover:text-brand transition-colors">
                    {news.title}
                  </h3>
                  {news.summary ? (
                    <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-ink-muted">
                      {news.summary}
                    </p>
                  ) : null}
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-line/60 pt-4 text-xs font-semibold text-ink-muted">
                  <span>{news.date}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
