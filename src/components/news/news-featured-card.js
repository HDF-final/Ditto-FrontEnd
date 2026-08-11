import { ViewCount } from "@/components/news/view-count";

export function NewsFeaturedCard({ news }) {
  return (
    <article className="grid overflow-hidden rounded-[32px] border border-line bg-white shadow-[0_12px_30px_rgba(43,28,89,0.08)] lg:grid-cols-[520px_1fr]">
      <div
        className={`min-h-[240px] bg-linear-to-br ${news.gradient} lg:min-h-[305px]`}
      />
      <div className="flex flex-col justify-center gap-5 p-9 lg:p-[60px]">
        <span className="w-fit rounded-full bg-brand-soft px-4 py-2 text-xs font-black text-brand">
          {news.category}
        </span>
        <h2 className="whitespace-pre-line text-2xl font-black leading-snug text-ink md:text-[34px]">
          {news.title}
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-xs font-semibold text-brand">
            {news.tags.map((tag) => `#${tag}`).join(" ")}
          </p>
          <ViewCount value={news.views} />
        </div>
      </div>
    </article>
  );
}
