"use client";

import { useState } from "react";

import { ViewCount } from "@/components/news/view-count";

export function NewsFeed({ tabs, items }) {
  const [activeTab, setActiveTab] = useState("all");

  const visibleItems =
    activeTab === "all"
      ? items
      : items.filter((item) => item.category === activeTab);

  return (
    <section className="bg-surface-soft px-5 py-[60px] lg:px-24">
      <div className="mb-6 flex gap-[22px] border-b border-line">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`-mb-px border-b-2 px-0 pb-3.5 text-[15px] font-black transition ${
              activeTab === tab.value
                ? "border-brand text-brand"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visibleItems.map((item) => (
          <article
            key={item.title}
            className="flex flex-col gap-3 rounded-[20px] border border-line bg-white p-5 shadow-[0_8px_20px_rgba(43,28,89,0.06)] transition hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(43,28,89,0.12)]"
          >
            <h3 className="text-base font-black leading-snug text-ink">
              {item.title}
            </h3>
            <p className="text-xs font-semibold text-brand">
              {item.tags.map((tag) => `#${tag}`).join(" ")}
            </p>
            <div
              className={`mt-1 h-[150px] rounded-[14px] bg-linear-to-br ${item.gradient}`}
            />
            <div className="mt-1 flex items-center justify-between gap-3">
              <span className="rounded-full bg-brand-soft px-4 py-2 text-xs font-black text-brand">
                {item.label}
              </span>
              <ViewCount value={item.views} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
