import { NewsFeaturedCard } from "@/components/news/news-featured-card";
import { NewsFeed } from "@/components/news/news-feed";
import { fetchNewsFeedsServer } from "@/lib/api/news.server";
import { newsTabs } from "@/lib/fixtures/news";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const t = await getTranslations("news");
  return { title: t("title"), description: t("description") };
}

export default async function NewsPage() {
  const [feeds, t] = await Promise.all([
    fetchNewsFeedsServer({ page: 0, size: 20 }),
    getTranslations("news"),
  ]);
  const featured = feeds[0] || null;
  const feedItems = feeds.length > 1 ? feeds.slice(1) : feeds;

  return (
    <main className="bg-background">
      <section className="bg-white px-10 sm:px-14 py-[60px] lg:px-52 xl:px-60 2xl:px-72">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.04em] text-brand">
            DITTO NEWSLETTER
          </p>
          <h1 className="mt-1 text-[28px] font-black tracking-tight text-ink">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {t("description")}
          </p>
        </div>
        {featured ? <NewsFeaturedCard news={featured} /> : null}
      </section>
      <NewsFeed tabs={newsTabs} items={feedItems} />
    </main>
  );
}
