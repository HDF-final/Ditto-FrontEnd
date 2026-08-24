"use client";

import { useMemo, useState } from "react";
import { NewsFeaturedCard } from "@/components/news/news-featured-card";
import { NewsFeed } from "@/components/news/news-feed";

const MOBILE_FIRST_PAGE_COUNT = 3;

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-surface-soft px-5 pb-8 lg:hidden">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex size-9 items-center justify-center rounded-xl font-bold transition ${
          currentPage === 1
            ? "cursor-not-allowed border border-line bg-white/50 text-ink-muted/40"
            : "cursor-pointer border border-line bg-white text-ink shadow-xs hover:border-line-strong"
        }`}
        aria-label="이전 페이지"
      >
        ‹
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
        <button
          key={pageNum}
          type="button"
          onClick={() => onPageChange(pageNum)}
          className={`flex size-9 cursor-pointer items-center justify-center rounded-xl text-xs font-black transition ${
            currentPage === pageNum
              ? "bg-brand text-white shadow-md"
              : "border border-line bg-white text-ink-muted shadow-xs hover:border-line-strong"
          }`}
          aria-current={currentPage === pageNum ? "page" : undefined}
        >
          {pageNum}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex size-9 items-center justify-center rounded-xl font-bold transition ${
          currentPage === totalPages
            ? "cursor-not-allowed border border-line bg-white/50 text-ink-muted/40"
            : "cursor-pointer border border-line bg-white text-ink shadow-xs hover:border-line-strong"
        }`}
        aria-label="다음 페이지"
      >
        ›
      </button>
    </div>
  );
}

export function NewsListView({ feeds = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const items = Array.isArray(feeds) ? feeds : [];

  const desktopFeatured = items[0] || null;
  const desktopFeedItems = items.length > 1 ? items.slice(1) : [];

  const totalPages = items.length > MOBILE_FIRST_PAGE_COUNT ? 2 : 1;
  const isFirstPage = currentPage === 1;
  const mobileFeatured = isFirstPage ? items[0] || null : null;
  const mobileFeedItems = useMemo(() => {
    if (isFirstPage) {
      return items.slice(1, MOBILE_FIRST_PAGE_COUNT);
    }
    return items.slice(MOBILE_FIRST_PAGE_COUNT);
  }, [isFirstPage, items]);

  const handlePageChange = (page) => {
    const next = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <section className="bg-white px-5 py-6 lg:px-52 lg:py-[60px] xl:px-60 2xl:px-72">
        <div className="mb-4 lg:mb-6">
          <p className="text-[11px] font-black uppercase tracking-[0.04em] text-brand lg:text-xs">
            DITTO NEWSLETTER
          </p>
          <h1 className="mt-1 text-[22px] font-black tracking-tight text-ink lg:text-[28px]">
            뉴스피드
          </h1>
          <p className="mt-1 text-[13px] text-ink-muted lg:text-sm">
            K-컬처와 브랜드, 그리고 우리 사회에 선한 변화를 만드는 소식.
          </p>
        </div>
        <div className="lg:hidden">
          {mobileFeatured ? <NewsFeaturedCard news={mobileFeatured} /> : null}
        </div>
        <div className="hidden lg:block">
          {desktopFeatured ? <NewsFeaturedCard news={desktopFeatured} /> : null}
        </div>
      </section>

      <div className="lg:hidden">
        {mobileFeedItems.length > 0 ? <NewsFeed items={mobileFeedItems} /> : null}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
      <div className="hidden lg:block">
        <NewsFeed items={desktopFeedItems} />
      </div>
    </>
  );
}
