import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { NewsShareButton } from "@/components/news/news-share-button";
import { NewsImageLightbox } from "@/components/news/news-image-lightbox";
import {
  getNewsDetailBySlug,
  getNewsSitemap,
  getRelatedNewsList,
} from "@/lib/api/news.server";

export const dynamic = "force-dynamic";

function FormattedParagraph({ text, originalArticle = "원문 기사" }) {
  if (!text) return null;

  // 1. Markdown link pattern: [연합뉴스](https://...)
  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

  if (markdownLinkRegex.test(text)) {
    markdownLinkRegex.lastIndex = 0;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = markdownLinkRegex.exec(text)) !== null) {
      const [fullMatch, label, url] = match;
      const matchIndex = match.index;

      if (matchIndex > lastIndex) {
        parts.push(text.slice(lastIndex, matchIndex));
      }

      parts.push(
        <a
          key={matchIndex}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-brand underline decoration-brand/40 underline-offset-4 transition hover:text-brand-dark hover:decoration-brand inline-flex items-center gap-1"
        >
          {label}
          <svg
            aria-hidden="true"
            className="inline size-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>,
      );

      lastIndex = matchIndex + fullMatch.length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  }

  // 2. Plain source link pattern: 출처: 연합뉴스 (https://...)
  const sourceWithUrlRegex = /^(출처:\s*)([^\s(]+)?\s*\((https?:\/\/[^\s)]+)\)$/;
  const sourceMatch = text.match(sourceWithUrlRegex);
  if (sourceMatch) {
    const [, prefix, label = originalArticle, url] = sourceMatch;
    return (
      <>
        {prefix}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-brand underline decoration-brand/40 underline-offset-4 transition hover:text-brand-dark hover:decoration-brand inline-flex items-center gap-1"
        >
          {label}
          <svg
            aria-hidden="true"
            className="inline size-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </>
    );
  }

  return text;
}

export async function generateStaticParams() {
  const sitemapItems = await getNewsSitemap();
  return sitemapItems.map((news) => ({ slug: news.slug }));
}

export async function generateMetadata({ params }) {
  const [{ slug }, t] = await Promise.all([
    params,
    getTranslations("news"),
  ]);
  const news = await getNewsDetailBySlug(slug);

  if (!news) {
    return { title: t("detailTitle") };
  }

  return {
    title: news.title.replace(/\n/g, " "),
    description: news.summary,
  };
}

export default async function NewsDetailPage({ params }) {
  const [{ slug }, t] = await Promise.all([
    params,
    getTranslations("news"),
  ]);
  const news = await getNewsDetailBySlug(slug);

  if (!news) {
    notFound();
  }

  const relatedNews = await getRelatedNewsList(news.slug);
  const categoryLabel = news.label ?? news.category;
  const body = news.body;
  const summaryPoints = news.summaryPoints;
  const tags = news.tags || news.keywords || [];
  const primaryTag = tags[0] || categoryLabel || "";
  const coursePrompt = primaryTag
    ? `${primaryTag} 관련한 코스 생성해줘`
    : "K-컬처 추천 코스 생성해줘";
  const createCourseLabel =
    typeof t?.has === "function" && t.has("createCourse")
      ? t("createCourse")
      : "코스 생성하기";

  return (
    <main className="bg-surface-soft min-h-screen">
      {/* 1. Hero Header */}
      <section className="bg-white px-3.5 sm:px-8 pb-6 sm:pb-10 pt-4 sm:pt-8 lg:px-52 xl:px-60 2xl:px-72 lg:pb-14">
        <div
          className={`relative mx-auto max-w-7xl min-h-[360px] sm:min-h-[440px] lg:min-h-[500px] overflow-hidden rounded-[20px] sm:rounded-[32px] px-5 py-6 sm:px-12 lg:px-16 lg:py-16 text-white shadow-[0_18px_50px_rgba(43,28,89,0.16)] ${
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
            <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.04em] text-white/80">
              DITTO NEWSLETTER
            </p>
            <span className="mt-3 sm:mt-5 w-fit rounded-full bg-white/95 px-4 sm:px-5 py-1.5 sm:py-2 text-xs font-black text-brand shadow-sm">
              {categoryLabel}
            </span>
            <h1 className="mt-4 sm:mt-6 whitespace-pre-line text-2xl sm:text-4xl lg:text-[46px] font-black leading-snug tracking-tight text-white break-keep">
              {news.title}
            </h1>
            <p className="mt-3 sm:mt-5 text-sm sm:text-base font-medium leading-relaxed text-white/90 break-keep">
              {news.summary}
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3 w-full sm:w-auto">
              <Link
                href="/news"
                className="inline-flex min-h-11 sm:min-h-12 w-full sm:w-auto items-center justify-center rounded-control border border-white/80 bg-black/20 backdrop-blur-xs px-5 sm:px-7 text-xs sm:text-sm font-black text-white transition hover:bg-white/20"
              >
                {t("backToFeed")}
              </Link>
              <NewsShareButton
                title={news.title}
                summary={news.summary}
              />
              <Link
                href={`/ai-course?prompt=${encodeURIComponent(coursePrompt)}`}
                className="inline-flex min-h-11 sm:min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-control border border-white/80 bg-black/40 backdrop-blur-xs px-5 sm:px-6 text-xs sm:text-sm font-black text-white transition hover:bg-white/25 cursor-pointer shadow-xs group"
              >
                <svg
                  aria-hidden="true"
                  className="size-4 sm:size-4.5 text-brand-light transition-transform group-hover:scale-110"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                <span>{createCourseLabel}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content & Sidebar Grid */}
      <section className="px-3.5 sm:px-8 py-6 sm:py-10 lg:px-52 xl:px-60 2xl:px-72 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
            {/* Left: Article Body */}
            <article className="flex flex-col gap-6 sm:gap-8 text-[15px] sm:text-[17px] font-medium leading-7 sm:leading-8 text-ink break-keep overflow-hidden">
              {news.representativeImageUrl ? (
                <div className="w-full">
                  <NewsImageLightbox
                    src={news.representativeImageUrl}
                    alt={news.title}
                    caption={news.imageCaption || news.summary}
                    mode="card"
                  />
                </div>
              ) : null}

              {body.slice(0, 2).map((paragraph, index) => (
                <p key={index}>
                  <FormattedParagraph
                    text={paragraph}
                    originalArticle={t("originalArticle")}
                  />
                </p>
              ))}

              {news.quote ? (
                <blockquote className="rounded-[18px] sm:rounded-[24px] bg-white px-5 py-6 sm:px-7 sm:py-8 shadow-card">
                  <p className="text-lg sm:text-2xl font-black leading-snug text-ink">
                    “{news.quote}”
                  </p>
                  {news.quoteSource ? (
                    <cite className="mt-2.5 sm:mt-3 block text-xs sm:text-sm font-black not-italic text-brand">
                      - {news.quoteSource}
                    </cite>
                  ) : null}
                </blockquote>
              ) : null}

              {body.slice(2).map((paragraph, index) => (
                <p key={index}>
                  <FormattedParagraph
                    text={paragraph}
                    originalArticle={t("originalArticle")}
                  />
                </p>
              ))}

              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2.5 sm:gap-3 pt-2 sm:pt-4">
                  {tags.map((tag, index) => (
                    <Link
                      key={tag}
                      href={`/ai-course?prompt=${encodeURIComponent(`${tag} 관련한 코스 생성해줘`)}`}
                      className={[
                        "rounded-control px-4 sm:px-5 py-1.5 sm:py-2 text-xs font-black transition-all hover:scale-105 active:scale-95 cursor-pointer",
                        index === 0
                          ? "bg-brand text-white shadow-sm hover:bg-brand-dark"
                          : "bg-brand-soft text-brand hover:bg-brand-soft/80",
                      ].join(" ")}
                      title={`${tag} 관련 코스 생성하기`}
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              ) : null}
            </article>

            {/* Right: Key Points Aside (Sticky on Scroll) */}
            <aside className="lg:sticky lg:top-[116px] h-fit rounded-[20px] sm:rounded-[28px] border border-line bg-white p-5 sm:p-8 shadow-card transition-all">
              <div className="flex items-center justify-between gap-3 border-b border-line pb-4 sm:pb-5">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <span className="size-2.5 sm:size-3 rounded-full bg-brand" />
                  <h2 className="text-xl sm:text-2xl font-black text-ink">{t("summary")}</h2>
                </div>
                <span className="rounded-full bg-brand-soft px-3 sm:px-3.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-black text-brand">
                  KEY POINTS
                </span>
              </div>
              <ol className="mt-5 sm:mt-6 flex flex-col gap-4 sm:gap-6">
                {summaryPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3 sm:gap-3.5">
                    <span className="flex size-6 sm:size-7 flex-none items-center justify-center rounded-full bg-brand text-[11px] sm:text-xs font-black text-white mt-0.5">
                      {index + 1}
                    </span>
                    <p className="text-[15px] sm:text-[17px] font-bold leading-relaxed text-ink break-keep">
                      {point}
                    </p>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </div>
      </section>

      {/* 3. Related News Section */}
      <section className="bg-white px-3.5 sm:px-8 py-8 sm:py-12 lg:px-52 xl:px-60 2xl:px-72">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 sm:mb-6 flex items-center justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-black text-ink">{t("related")}</h2>
            <Link href="/news" className="text-xs sm:text-sm font-bold text-brand hover:underline">
              {t("viewAll")}
            </Link>
          </div>
          <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {relatedNews.map((item) => (
              <Link
                key={item.slug}
                href={`/news/${item.slug}`}
                className="grid grid-cols-[88px_1fr] sm:grid-cols-[108px_1fr] gap-3.5 sm:gap-5 rounded-[16px] sm:rounded-[20px] border border-line bg-white p-3.5 sm:p-4 shadow-card transition hover:-translate-y-1 hover:border-line-strong"
              >
                <div className="relative min-h-20 sm:min-h-24 overflow-hidden rounded-[14px] sm:rounded-[18px]">
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
                  <h3 className="mt-1.5 sm:mt-2 line-clamp-2 text-sm sm:text-base font-black leading-snug text-ink break-keep">
                    {item.title}
                  </h3>
                  <div className="mt-3 sm:mt-4 flex items-center gap-3 text-[11px] sm:text-xs font-semibold text-ink-muted">
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
