"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

const ITEMS_PER_PAGE = 6;

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}

export function NewsFeed({ items = [] }) {
  const t = useTranslations("news");
  const [currentPage, setCurrentPage] = useState(1);
  const sectionRef = useRef(null);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedItems = useMemo(() => {
    const startIdx = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return items.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [items, safeCurrentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 300, behavior: "smooth" });
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      id="news-feed-section"
      className="bg-surface-soft px-5 py-6 lg:px-52 lg:py-[60px] xl:px-60 2xl:px-72"
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-6">
        {paginatedItems.map((item) => {
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

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-1.5 sm:gap-2 lg:mt-12">
          {/* 이전 버튼 */}
          <button
            type="button"
            onClick={() => handlePageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
            className={`flex size-8 sm:size-9 items-center justify-center rounded-xl font-bold transition text-xs sm:text-sm ${
              safeCurrentPage === 1
                ? "cursor-not-allowed border border-line bg-white/50 text-ink-muted/40"
                : "cursor-pointer border border-line bg-white text-ink shadow-xs hover:border-brand hover:text-brand"
            }`}
            aria-label={t("previousPage")}
          >
            ‹
          </button>

          {/* 페이지 번호 버튼들 */}
          {getPageNumbers(safeCurrentPage, totalPages).map((pageNum, idx) => {
            if (pageNum === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex size-8 sm:size-9 items-center justify-center text-xs font-bold text-ink-muted"
                >
                  ...
                </span>
              );
            }

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => handlePageChange(pageNum)}
                className={`flex size-8 sm:size-9 cursor-pointer items-center justify-center rounded-xl text-xs font-black transition ${
                  safeCurrentPage === pageNum
                    ? "bg-brand text-white shadow-md"
                    : "border border-line bg-white text-ink-muted shadow-xs hover:border-brand hover:text-brand"
                }`}
                aria-current={safeCurrentPage === pageNum ? "page" : undefined}
              >
                {pageNum}
              </button>
            );
          })}

          {/* 다음 버튼 */}
          <button
            type="button"
            onClick={() => handlePageChange(safeCurrentPage + 1)}
            disabled={safeCurrentPage === totalPages}
            className={`flex size-8 sm:size-9 items-center justify-center rounded-xl font-bold transition text-xs sm:text-sm ${
              safeCurrentPage === totalPages
                ? "cursor-not-allowed border border-line bg-white/50 text-ink-muted/40"
                : "cursor-pointer border border-line bg-white text-ink shadow-xs hover:border-brand hover:text-brand"
            }`}
            aria-label={t("nextPage")}
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}
