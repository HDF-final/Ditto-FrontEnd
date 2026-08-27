import { NewsListView } from "@/components/news/news-list-view";
import { fetchNewsFeedsServer } from "@/lib/api/news.server";

export const dynamic = "force-dynamic";
export const metadata = { title: "뉴스피드" };

export default async function NewsPage() {
  const feeds = await fetchNewsFeedsServer({ page: 0, size: 60 });

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-surface-soft lg:block lg:flex-none lg:bg-background">
      <NewsListView feeds={feeds} />
    </main>
  );
}
