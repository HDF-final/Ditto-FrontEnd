import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { NewsShareButton } from "@/components/news/news-share-button";
import { NewsImageLightbox } from "@/components/news/news-image-lightbox";
import { NewsKeyPoints } from "@/components/news/news-key-points";
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
    ? t("relatedCoursePrompt", { keyword: primaryTag })
    : t("defaultCoursePrompt");
  const createCourseLabel = t("createCourse");

  return (
    <main className="bg-surface-soft min-h-screen">
      {/* 1. Hero Header */}
      <section className="bg-white px-4 pb-4 pt-3 lg:px-52 lg:pb-14 lg:pt-8 xl:px-60 2xl:px-72">
        <div
          className={`relative mx-auto max-w-7xl min-h-0 overflow-hidden rounded-[16px] px-4 py-4 text-white shadow-[0_18px_50px_rgba(43,28,89,0.16)] lg:min-h-[500px] lg:rounded-[32px] lg:px-16 lg:py-16 ${
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
            <p className="text-[10px] font-black uppercase tracking-[0.04em] text-white/80 lg:text-xs">
              DITTO NEWSLETTER
            </p>
            <span className="mt-2 w-fit rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black text-brand shadow-sm lg:mt-5 lg:px-5 lg:py-2 lg:text-xs">
              {categoryLabel}
            </span>
            <h1 className="mt-2.5 whitespace-pre-line text-[20px] font-black leading-snug tracking-tight text-white break-keep lg:mt-6 lg:text-[46px]">
              {news.title}
            </h1>
            <p className="mt-2 text-[13px] font-medium leading-relaxed text-white/90 break-keep lg:mt-5 lg:text-base">
              {news.summary}
            </p>
            <div className="mt-3.5 flex w-full flex-nowrap items-stretch gap-1.5 lg:mt-8 lg:w-auto lg:flex-wrap lg:gap-3">
              <Link
                href="/news"
                className="inline-flex min-h-9 min-w-0 flex-1 items-center justify-center rounded-control border border-white/80 bg-black/20 px-1.5 text-center text-[10px] font-black leading-tight text-white backdrop-blur-xs transition hover:bg-white/20 lg:min-h-12 lg:w-auto lg:flex-none lg:px-7 lg:text-sm lg:leading-normal"
              >
                <span className="truncate">{t("backToFeed")}</span>
              </Link>
              <NewsShareButton
                title={news.title}
                summary={news.summary}
              />
              <Link
                href={`/ai-course?prompt=${encodeURIComponent(coursePrompt)}`}
                className="inline-flex min-h-9 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1 rounded-control border border-white/80 bg-black/40 px-1.5 text-center text-[10px] font-black leading-tight text-white shadow-xs backdrop-blur-xs transition hover:bg-white/25 group lg:min-h-12 lg:w-auto lg:flex-none lg:gap-2 lg:px-6 lg:text-sm lg:leading-normal"
              >
                <svg
                  aria-hidden="true"
                  className="hidden size-4.5 text-brand-light transition-transform group-hover:scale-110 lg:block"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                <span className="truncate">{createCourseLabel}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content & Sidebar Grid */}
      <section className="px-4 py-4 lg:px-52 lg:py-16 xl:px-60 2xl:px-72">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-10">
            {/* Left: Article Body */}
            <article className="flex flex-col gap-4 overflow-hidden break-keep text-[14px] font-medium leading-6 text-ink lg:gap-8 lg:text-[17px] lg:leading-8">
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
                <blockquote className="rounded-[14px] bg-white px-4 py-4 shadow-card lg:rounded-[24px] lg:px-7 lg:py-8">
                  <p className="text-[15px] font-black leading-snug text-ink lg:text-2xl">
                    “{news.quote}”
                  </p>
                  {news.quoteSource ? (
                    <cite className="mt-2 block text-[11px] font-black not-italic text-brand lg:mt-3 lg:text-sm">
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

              {news.sourceUrl &&
              !body.some(
                (p) =>
                  typeof p === "string" &&
                  (p.includes("출처:") || p.includes(news.sourceUrl)),
              ) ? (
                <div className="pt-2 text-xs sm:text-sm font-medium text-ink-muted">
                  {t("source")}:{" "}
                  <a
                    href={news.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-brand underline decoration-brand/40 underline-offset-4 transition hover:text-brand-dark hover:decoration-brand inline-flex items-center gap-1"
                  >
                    {t("sourcePublisherYonhap")}
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
                </div>
              ) : null}

              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1 lg:gap-3 lg:pt-4">
                  {tags.map((tag, index) => (
                    <Link
                      key={tag}
                      href={`/ai-course?prompt=${encodeURIComponent(t("relatedCoursePrompt", { keyword: tag }))}`}
                      className={[
                        "rounded-control px-2.5 py-1 text-[11px] font-black transition-all hover:scale-105 active:scale-95 cursor-pointer lg:px-5 lg:py-2 lg:text-xs",
                        index === 0
                          ? "bg-brand text-white shadow-sm hover:bg-brand-dark"
                          : "bg-brand-soft text-brand hover:bg-brand-soft/80",
                      ].join(" ")}
                      title={t("relatedCourseTitle", { keyword: tag })}
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              ) : null}
            </article>

            {/* Right: Key Points Aside (Sticky on Scroll) */}
            <NewsKeyPoints
              summaryTitle={t("summary")}
              summaryPoints={summaryPoints}
              news={news}
              initialPlace={news.place || null}
            />
          </div>
        </div>
      </section>

      {/* 3. Related News Section */}
      <section className="bg-white px-4 py-5 lg:px-52 lg:py-12 xl:px-60 2xl:px-72">
        <div className="mx-auto max-w-7xl">
          <div className="mb-3.5 flex items-center justify-between gap-4 lg:mb-6">
            <h2 className="text-base font-black text-ink lg:text-2xl">{t("related")}</h2>
            <Link href="/news" className="text-[11px] font-bold text-brand hover:underline lg:text-sm">
              {t("viewAll")}
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-3 lg:gap-5">
            {relatedNews.map((item) => (
              <Link
                key={item.slug}
                href={`/news/${item.slug}`}
                className="grid grid-cols-[72px_1fr] gap-3 rounded-[14px] border border-line bg-white p-2.5 shadow-card transition hover:-translate-y-1 hover:border-line-strong lg:grid-cols-[108px_1fr] lg:gap-5 lg:rounded-[20px] lg:p-4"
              >
                <div className="relative min-h-16 overflow-hidden rounded-[10px] lg:min-h-24 lg:rounded-[18px]">
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
                  <p className="text-[10px] font-black text-brand lg:text-xs">
                    {item.label ?? item.category}
                  </p>
                  <h3 className="mt-1 line-clamp-2 text-[13px] font-black leading-snug text-ink break-keep lg:mt-2 lg:text-base">
                    {item.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-3 text-[10px] font-semibold text-ink-muted lg:mt-4 lg:text-xs">
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
