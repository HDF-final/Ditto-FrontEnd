import Link from "next/link";
import Image from "next/image";

export function NewsFeaturedCard({ news }) {
  if (!news) return null;
  const tags = news.tags || news.keywords || [];
  const category = news.label || news.category || "DITTO NEWS";

  return (
    <Link
      href={`/news/${news.slug}`}
      className="grid overflow-hidden rounded-[32px] border border-line bg-white shadow-[0_12px_30px_rgba(43,28,89,0.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(43,28,89,0.12)] lg:grid-cols-[520px_1fr]"
    >
      <div className="relative min-h-[240px] overflow-hidden lg:min-h-[305px]">
        {news.representativeImageUrl ? (
          <Image
            src={news.representativeImageUrl}
            alt={news.title}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div
            className={`h-full w-full min-h-[240px] bg-linear-to-br ${news.gradient || "from-[#2d1b8e] via-[#5c2ef5] to-[#8c57fa]"} lg:min-h-[305px]`}
          />
        )}
      </div>
      <div className="flex flex-col justify-center gap-5 p-9 lg:p-[60px]">
        <span className="w-fit rounded-full bg-brand-soft px-4 py-2 text-xs font-black text-brand">
          {category}
        </span>
        <h2 className="whitespace-pre-line text-2xl font-black leading-snug text-ink md:text-[34px]">
          {news.title}
        </h2>
        {news.summary ? (
          <p className="line-clamp-2 text-sm font-medium leading-relaxed text-ink-muted">
            {news.summary}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {tags.length > 0 ? (
            <p className="text-xs font-semibold text-brand">
              {tags.map((tag) => `#${tag}`).join(" ")}
            </p>
          ) : null}
          {news.date ? (
            <span className="text-xs font-semibold text-ink-muted">
              {news.date}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
