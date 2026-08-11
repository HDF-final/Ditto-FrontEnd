import Link from "next/link";
import { notFound } from "next/navigation";

import { ViewCount } from "@/components/news/view-count";
import { allNews, getNewsBySlug, getRelatedNews } from "@/lib/fixtures/news";

export function generateStaticParams() {
  return allNews.map((news) => ({ slug: news.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const news = getNewsBySlug(slug);

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
  const news = getNewsBySlug(slug);

  if (!news) {
    notFound();
  }

  const relatedNews = getRelatedNews(news.slug);
  const categoryLabel = news.label ?? news.category;
  const body = news.body ?? [
    news.summary,
    "K-컬처 트렌드는 콘텐츠 소비와 실제 여행 동선을 함께 바꾸고 있습니다. 브랜드 경험, 팬덤 이벤트, 쇼핑 스팟이 연결되며 여행자는 더 촘촘한 코스를 기대하게 되었어요.",
    "DITTO는 뉴스 관심사를 실제 방문 가능한 코스와 연결해 여행자가 지금 가장 주목받는 장소를 쉽게 발견하도록 돕습니다.",
  ];
  const summaryPoints =
    news.summaryPoints ??
    [
      `${categoryLabel} 흐름이 빠르게 확산`,
      "여행 동선과 브랜드 경험의 연결 강화",
      "저장한 관심사를 코스 추천에 활용",
    ];

  return (
    <main className="bg-surface-soft">
      <section className="bg-white px-5 pb-10 pt-8 lg:px-24 lg:pb-14">
        <div
          className={`mx-auto grid max-w-7xl gap-10 rounded-[32px] bg-linear-to-br ${news.gradient} px-6 py-10 text-white shadow-[0_18px_50px_rgba(43,28,89,0.16)] sm:px-10 lg:grid-cols-[1fr_330px] lg:px-14 lg:py-16`}
        >
          <div className="flex min-h-[360px] flex-col justify-center">
            <p className="text-xs font-black uppercase tracking-[0.04em]">
              DITTO NEWSLETTER
            </p>
            <span className="mt-7 w-fit rounded-full bg-white/90 px-7 py-3 text-xs font-black text-brand">
              {categoryLabel}
            </span>
            <h1 className="mt-8 max-w-3xl whitespace-pre-line text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-[52px]">
              {news.title}
            </h1>
            <p className="mt-7 max-w-2xl text-base font-medium leading-8 text-white/88">
              {news.summary}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/news"
                className="inline-flex min-h-12 items-center justify-center rounded-control border border-white px-7 text-sm font-black text-white transition hover:bg-white/10"
              >
                뉴스피드로 돌아가기
              </Link>
              <button
                type="button"
                className="inline-flex min-h-12 items-center justify-center rounded-control bg-brand px-7 text-sm font-black text-white shadow-control transition hover:bg-brand-dark"
              >
                기사 공유
              </button>
            </div>
          </div>

          <aside className="self-center rounded-[24px] bg-white/92 p-8 text-ink shadow-card">
            <p className="text-xs font-black uppercase text-brand">
              Article Insight
            </p>
            <p className="mt-6 text-3xl font-black">{news.views}</p>
            <p className="mt-3 text-sm font-semibold text-ink-muted">
              {news.insight ?? `${news.tags[0]} 키워드`}
            </p>
          </aside>
        </div>
      </section>

      <section className="px-5 py-14 lg:px-24 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
          <article className="flex flex-col gap-10 text-[17px] font-medium leading-8 text-ink">
            {body.slice(0, 2).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            {news.quote ? (
              <blockquote className="rounded-[24px] bg-white px-7 py-8 shadow-card">
                <p className="text-2xl font-black leading-snug text-ink">
                  “{news.quote}”
                </p>
                <cite className="mt-3 block text-sm font-black not-italic text-brand">
                  {news.quoteSource}
                </cite>
              </blockquote>
            ) : null}

            {body.slice(2).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            <div className="flex flex-wrap gap-3 pt-4">
              {news.tags.map((tag, index) => (
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
          </article>

          <aside className="h-fit rounded-[28px] bg-white p-7 shadow-card">
            <h2 className="text-2xl font-black text-ink">기사 요약</h2>
            <ol className="mt-7 flex flex-col gap-7">
              {summaryPoints.map((point, index) => (
                <li key={point} className="flex items-center gap-4">
                  <span className="flex size-7 flex-none items-center justify-center rounded-full bg-brand-soft text-xs font-black text-brand">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold leading-6 text-ink">
                    {point}
                  </span>
                </li>
              ))}
            </ol>
            <button
              type="button"
              className="mt-9 w-full rounded-control bg-brand px-5 py-4 text-sm font-black text-white shadow-control transition hover:bg-brand-dark"
            >
              뉴스 저장하기
            </button>
          </aside>
        </div>
      </section>

      <section className="bg-white px-5 py-12 lg:px-24">
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
                <div
                  className={`min-h-24 rounded-[18px] bg-linear-to-br ${item.gradient}`}
                />
                <div className="min-w-0">
                  <p className="text-xs font-black text-brand">
                    {item.label ?? item.category}
                  </p>
                  <h3 className="mt-2 line-clamp-2 text-base font-black leading-snug text-ink">
                    {item.title}
                  </h3>
                  <div className="mt-4 flex items-center gap-3 text-xs font-semibold text-ink-muted">
                    <span>{item.date}</span>
                    <ViewCount value={item.views} />
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
