"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function NewsFeed({ tabs = [], items = [] }) {
  const t = useTranslations("news");
  const [activeTab, setActiveTab] = useState("all");

  const visibleItems =
    activeTab === "all"
      ? items
      : items.filter((item) => {
          if (item.category === activeTab) return true;
          const tags = item.tags || item.keywords || [];
          return tags.some(
            (t) =>
              t.toLowerCase() === activeTab.toLowerCase() ||
              t.toLowerCase().includes(activeTab.toLowerCase()),
          );
        });

  return (
    <section className="bg-surface-soft px-10 sm:px-14 py-[60px] lg:px-52 xl:px-60 2xl:px-72">
      {tabs.length > 0 ? (
        <div className="mb-6 flex gap-[22px] border-b border-line">
          {tabs.map((tab) => (
            <button
              key={tab.id || tab.value}
              type="button"
              onClick={() => setActiveTab(tab.id || tab.value)}
              className={[
                "border-b-2 pb-3.5 text-base font-black transition",
                activeTab === (tab.id || tab.value)
                  ? "border-brand text-brand"
                  : "border-transparent text-ink-muted hover:text-ink",
              ].join(" ")}
            >
              {t(`tabs.${tab.id || tab.value}`)}
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((item) => {
          const slug = item.slug || String(item.newsFeedId);
          return (
            <Link
              key={slug}
              href={`/news/${slug}`}
              className="flex flex-col gap-4 rounded-[28px] border border-line bg-white p-7 shadow-card transition hover:-translate-y-1 hover:border-line-strong"
            >
              <h3 className="line-clamp-2 text-xl font-black leading-snug text-ink">
                {item.title}
              </h3>
              <div className="relative min-h-[190px] overflow-hidden rounded-[20px]">
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
                <p className="line-clamp-2 text-sm leading-6 text-ink-muted">
                  {item.summary}
                </p>
              ) : null}
              <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                <span className="rounded-full bg-brand-soft px-4 py-2 text-xs font-black text-brand">
                  {item.label || item.category || t("categoryFallback")}
                </span>
                {item.date ? (
                  <span className="text-xs font-semibold text-ink-muted">
                    {item.date}
                  </span>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
