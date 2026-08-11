import { NewsFeaturedCard } from "@/components/news/news-featured-card";
import { NewsFeed } from "@/components/news/news-feed";
import { featuredNews, newsItems, newsTabs } from "@/lib/fixtures/news";

export const metadata = { title: "뉴스피드" };

export default function NewsPage() {
  return (
    <main className="bg-background">
      <section className="bg-white px-5 py-[60px] lg:px-24">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.04em] text-brand">
            DITTO NEWSLETTER
          </p>
          <h1 className="mt-1 text-[28px] font-black tracking-tight text-ink">
            뉴스피드
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            K-컬처와 브랜드, 그리고 우리 사회에 선한 변화를 만드는 소식.
          </p>
        </div>
        <NewsFeaturedCard news={featuredNews} />
      </section>
      <NewsFeed tabs={newsTabs} items={newsItems} />
    </main>
  );
}
