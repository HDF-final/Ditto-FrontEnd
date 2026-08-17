import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { NewsShareButton } from "@/components/news/news-share-button";
import {
  getNewsDetailBySlug,
  getNewsSitemap,
  getRelatedNewsList,
} from "@/lib/api/news.server";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const sitemapItems = await getNewsSitemap();
  return sitemapItems.map((news) => ({ slug: news.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const news = await getNewsDetailBySlug(slug);

  if (!news) {
    return { title: "뉴스 상세" };
  }

  return {
    title: news.title.replace(/\n/g, " "),
    description: news.summary,
  };
}

export default async function NewsDetailPage({ params }) {
  const { slug } = await params;
  const news = await getNewsDetailBySlug(slug);

  if (!news) {
    notFound();
  }

  const relatedNews = await getRelatedNewsList(news.slug);
  const categoryLabel = news.label ?? news.category;
  const body = news.body;
  const summaryPoints = news.summaryPoints;
  const tags = news.tags || news.keywords || [];

  return (
    <main className="bg-surface-soft">
      <section className="bg-white px-10 sm:px-14 pb-10 pt-8 lg:px-52 xl:px-60 2xl:px-72 lg:pb-14">
        <div
          className={`relative mx-auto max-w-7xl min-h-[400px] overflow-hidden rounded-[32px] px-8 py-12 text-white shadow-[0_18px_50px_rgba(43,28,89,0.16)] sm:px-12 lg:px-16 lg:py-16 ${
            news.representativeImageUrl ? "" : `bg-linear-to-br ${news.gradient}`
          }`}
        >
          {news.representativeImageUrl ? (
            <>
              <Image
                src={news.representativeImageUrl}
                alt={news.title}
                fill
                unoptimized
                priority
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/65 to-black/35" />
            </>
          ) : null}

          <div className="relative z-10 flex max-w-3xl flex-col justify-center">
            <p className="text-xs font-black uppercase tracking-[0.04em] text-white/80">
              DITTO NEWSLETTER
            </p>
            <span className="mt-5 w-fit rounded-full bg-white/95 px-5 py-2 text-xs font-black text-brand shadow-sm">
              {categoryLabel}
            </span>
            <h1 className="mt-6 whitespace-pre-line text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-[46px]">
              {news.title}
            </h1>
            <p className="mt-5 text-base font-medium leading-relaxed text-white/90">
              {news.summary}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/news"
                className="inline-flex min-h-12 items-center justify-center rounded-control border border-white/80 bg-black/20 backdrop-blur-xs px-7 text-sm font-black text-white transition hover:bg-white/20"
              >
                뉴스피드로 돌아가기
              </Link>
              <NewsShareButton
                title={news.title}
                summary={news.summary}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-10 sm:px-14 py-14 lg:px-52 xl:px-60 2xl:px-72 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
          <article className="flex flex-col gap-10 text-[17px] font-medium leading-8 text-ink">
            {body.slice(0, 2).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}

            {news.quote ? (
              <blockquote className="rounded-[24px] bg-white px-7 py-8 shadow-card">
                <p className="text-2xl font-black leading-snug text-ink">
                  “{news.quote}”
                </p>
                {news.quoteSource ? (
                  <cite className="mt-3 block text-sm font-black not-italic text-brand">
                    - {news.quoteSource}
                  </cite>
                ) : null}
              </blockquote>
            ) : null}

            {body.slice(2).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}

            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-3 pt-4">
                {tags.map((tag, index) => (
                  <span
                    key={tag}
                    className={[
                      "rounded-control px-5 py-2 text-xs font-black",
                      index === 0
                        ? "bg-brand text-white"
                        : "bg-brand-soft text-brand",
                    ].join(" ")}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </article>

          <aside className="h-fit rounded-[28px] border border-line bg-white p-8 shadow-card">
            <div className="flex items-center justify-between gap-3 border-b border-line pb-5">
              <div className="flex items-center gap-3">
                <span className="size-3 rounded-full bg-brand" />
                <h2 className="text-2xl font-black text-ink">기사 요약</h2>
              </div>
              <span className="rounded-full bg-brand-soft px-3.5 py-1 text-xs font-black text-brand">
                KEY POINTS
              </span>
            </div>
            <ol className="mt-6 flex flex-col gap-6">
              {summaryPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-4">
                  <span className="flex size-8 flex-none items-center justify-center rounded-full bg-brand text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <p className="text-[19px] font-bold leading-snug text-ink">
                    {point}
                  </p>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>

      <section className="bg-white px-10 sm:px-14 py-12 lg:px-52 xl:px-60 2xl:px-72">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-ink">관련 뉴스</h2>
            <Link href="/news" className="text-sm font-bold text-brand">
              뉴스피드 전체보기
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {relatedNews.map((item) => (
              <Link
                key={item.slug}
                href={`/news/${item.slug}`}
                className="grid grid-cols-[108px_1fr] gap-5 rounded-[20px] border border-line bg-white p-4 shadow-card transition hover:-translate-y-1 hover:border-line-strong"
              >
                <div className="relative min-h-24 overflow-hidden rounded-[18px]">
                  {item.representativeImageUrl ? (
                    <Image
                      src={item.representativeImageUrl}
                      alt={item.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className={`h-full w-full bg-linear-to-br ${item.gradient}`}
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-brand">
                    {item.label ?? item.category}
                  </p>
                  <h3 className="mt-2 line-clamp-2 text-base font-black leading-snug text-ink">
                    {item.title}
                  </h3>
                  <div className="mt-4 flex items-center gap-3 text-xs font-semibold text-ink-muted">
                    <span>{item.date}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
