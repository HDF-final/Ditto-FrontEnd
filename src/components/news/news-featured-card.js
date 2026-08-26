import Link from "next/link";
import Image from "next/image";

export function NewsFeaturedCard({ news }) {
  if (!news) return null;
  const tags = news.tags || news.keywords || [];

  return (
    <Link
      href={`/news/${news.slug}`}
      className="grid overflow-hidden rounded-[22px] border border-line bg-white shadow-[0_12px_30px_rgba(43,28,89,0.08)] lg:grid-cols-[520px_1fr] lg:rounded-[32px] lg:transition lg:hover:-translate-y-1 lg:hover:shadow-[0_18px_42px_rgba(43,28,89,0.12)]"
    >
      <div className="relative min-h-[180px] overflow-hidden lg:min-h-[305px]">
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
            className={`h-full w-full min-h-[180px] bg-linear-to-br lg:min-h-[305px] ${news.gradient || "from-[#2d1b8e] via-[#5c2ef5] to-[#8c57fa]"}`}
          />
        )}
      </div>
      <div className="flex flex-col justify-center gap-3 p-4 lg:gap-5 lg:p-[60px]">
        <h2 className="whitespace-pre-line text-lg font-black leading-snug text-ink lg:text-[38px]">
          {news.title}
        </h2>
        {news.summary ? (
          <p className="line-clamp-2 text-sm font-medium leading-relaxed text-ink-muted lg:text-base">
            {news.summary}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {tags.length > 0 ? (
            <p className="text-xs font-semibold text-brand lg:text-sm">
              {tags.map((tag) => `#${tag}`).join(" ")}
            </p>
          ) : null}
          {news.date ? (
            <span className="text-xs font-semibold text-ink-muted lg:text-sm">
              {news.date}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
