import { NewsListView } from "@/components/news/news-list-view";
import { fetchNewsFeedsServer } from "@/lib/api/news.server";

export const dynamic = "force-dynamic";
export const metadata = { title: "뉴스피드" };

export default async function NewsPage() {
  const feeds = await fetchNewsFeedsServer({ page: 0, size: 20 });

  return (
    <main className="bg-background">
      <NewsListView feeds={feeds} />
    </main>
  );
}
