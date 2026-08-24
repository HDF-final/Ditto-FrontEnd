"use client";

import Link from "next/link";
import Image from "next/image";

export function NewsFeed({ items = [] }) {
  return (
    <section className="bg-surface-soft px-5 py-6 lg:px-52 lg:py-[60px] xl:px-60 2xl:px-72">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-6">
        {items.map((item) => {
          const slug = item.slug || String(item.newsFeedId);
          return (
            <Link
              key={slug}
              href={`/news/${slug}`}
              className="flex min-w-0 flex-col gap-2.5 rounded-[18px] border border-line bg-white p-3 shadow-card lg:gap-4 lg:rounded-[28px] lg:p-7 lg:transition lg:hover:-translate-y-1 lg:hover:border-line-strong"
            >
              <h3 className="line-clamp-3 text-[14px] font-black leading-snug text-ink lg:line-clamp-2 lg:text-xl">
                {item.title}
              </h3>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[14px] lg:min-h-[190px] lg:rounded-[20px] lg:aspect-auto">
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
                    className={`h-full w-full bg-linear-to-br ${item.gradient || "from-[#2d1b8e] to-[#5c2ef5]"}`}
                  />
                )}
              </div>
              {item.summary ? (
                <p className="hidden line-clamp-2 text-sm leading-6 text-ink-muted lg:block">
                  {item.summary}
                </p>
              ) : null}
              {item.date ? (
                <div className="mt-auto pt-1.5 lg:pt-2">
                  <span className="text-[10px] font-semibold text-ink-muted lg:text-xs">
                    {item.date}
                  </span>
                </div>
              ) : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
