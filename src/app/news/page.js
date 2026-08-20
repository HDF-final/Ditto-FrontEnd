import { NewsFeaturedCard } from "@/components/news/news-featured-card";
import { NewsFeed } from "@/components/news/news-feed";
import { fetchNewsFeedsServer } from "@/lib/api/news.server";

export const dynamic = "force-dynamic";
export const metadata = { title: "뉴스피드" };

export default async function NewsPage() {
  const feeds = await fetchNewsFeedsServer({ page: 0, size: 20 });
  const featured = feeds[0] || null;
  const feedItems = feeds.length > 1 ? feeds.slice(1) : feeds;

  return (
    <main className="bg-background">
      <section className="bg-white px-5 py-6 lg:px-52 lg:py-[60px] xl:px-60 2xl:px-72">
        <div className="mb-4 lg:mb-6">
          <p className="text-[11px] font-black uppercase tracking-[0.04em] text-brand lg:text-xs">
            DITTO NEWSLETTER
          </p>
          <h1 className="mt-1 text-[22px] font-black tracking-tight text-ink lg:text-[28px]">
            뉴스피드
          </h1>
          <p className="mt-1 text-[13px] text-ink-muted lg:text-sm">
            K-컬처와 브랜드, 그리고 우리 사회에 선한 변화를 만드는 소식.
          </p>
        </div>
        {featured ? <NewsFeaturedCard news={featured} /> : null}
      </section>
      <NewsFeed items={feedItems} />
    </main>
  );
}
