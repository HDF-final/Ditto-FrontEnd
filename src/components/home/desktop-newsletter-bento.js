"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

function NewsBentoCard({ news, expanded, onEnter }) {
  const category =
    news.label ||
    news.category ||
    (news.keywords?.[0] ? `${news.keywords[0]}` : null);
  const slug = news.slug || "";
  const href = slug ? `/news/${slug}` : "/news";

  return (
    <Link
      href={href}
      onMouseEnter={onEnter}
      className={`group relative flex min-h-0 overflow-hidden rounded-[26px] border border-line/80 bg-white shadow-[0_14px_34px_rgba(43,28,89,0.08)] transition-[flex,box-shadow,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_22px_44px_rgba(43,28,89,0.14)] ${
        expanded ? "flex-[1.75_1_0%]" : "flex-[0.8_1_0%]"
      }`}
    >
      <div
        className={`relative shrink-0 overflow-hidden bg-surface-muted transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          expanded ? "w-[52%]" : "w-[36%]"
        }`}
      >
        {news.representativeImageUrl ? (
          <Image
            src={news.representativeImageUrl}
            alt={news.title}
            fill
            unoptimized
            className="object-cover transition duration-700 group-hover:scale-[1.035]"
          />
        ) : (
          <div
            className={`h-full w-full bg-linear-to-br ${news.gradient || "from-[#2d1b8e] to-[#5c2ef5]"}`}
          />
        )}
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-transparent to-black/10" />
        {category ? (
          <span className="absolute left-4 top-4 rounded-full bg-white/94 px-3.5 py-1.5 text-[11px] font-black text-brand shadow-sm backdrop-blur-sm">
            {category}
          </span>
        ) : null}
      </div>

      <div
        className={`flex min-w-0 flex-1 flex-col justify-start overflow-hidden transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          expanded ? "p-[clamp(20px,2.6vw,36px)]" : "p-[clamp(16px,2vw,26px)]"
        }`}
      >
        <h3
          className={`shrink-0 font-black leading-snug tracking-[-0.025em] text-ink transition-[font-size] duration-500 ${
            expanded ? "line-clamp-2 text-[clamp(20px,1.7vw,28px)]" : "line-clamp-2 text-[clamp(16px,1.25vw,20px)]"
          }`}
        >
          {news.title}
        </h3>
        <div
          className={`grid shrink-0 transition-[grid-template-rows,opacity,margin] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            expanded
              ? "mt-4 grid-rows-[1fr] opacity-100"
              : "mt-0 grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            {news.summary ? (
              <p className="line-clamp-3 text-sm font-medium leading-6 text-ink-muted">
                {news.summary}
              </p>
            ) : null}
          </div>
        </div>
        {news.date ? (
          <p
            className={`shrink-0 font-semibold text-ink-muted transition-[margin,font-size] duration-500 ${
              expanded ? "mt-5 text-xs" : "mt-2 text-[11px]"
            }`}
          >
            {news.date}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function NewsBentoColumn({ items, defaultExpanded }) {
  const [expandedIndex, setExpandedIndex] = useState(defaultExpanded);

  return (
    <div
      className="flex min-h-0 flex-col gap-5"
      onMouseLeave={() => setExpandedIndex(defaultExpanded)}
    >
      {items.map(({ news, sourceIndex }, columnIndex) => (
        <NewsBentoCard
          key={`${news.slug || news.title}-${sourceIndex}`}
          news={news}
          expanded={items.length === 1 || expandedIndex === columnIndex}
          onEnter={() => setExpandedIndex(columnIndex)}
        />
      ))}
    </div>
  );
}

export function DesktopNewsletterBento({ items = [] }) {
  if (items.length === 0) return null;

  const leftItems = items.slice(0, 2).map((news, sourceIndex) => ({
    news,
    sourceIndex,
  }));
  const rightItems = items.slice(2, 4).map((news, index) => ({
    news,
    sourceIndex: index + 2,
  }));

  return (
    <div className="mx-auto hidden h-[clamp(310px,43dvh,470px)] min-h-0 w-[88%] max-w-[1160px] grid-cols-2 gap-5 lg:grid">
      <NewsBentoColumn items={leftItems} defaultExpanded={0} />
      {rightItems.length > 0 ? (
        <NewsBentoColumn
          items={rightItems}
          defaultExpanded={rightItems.length > 1 ? 1 : 0}
        />
      ) : null}
    </div>
  );
}
