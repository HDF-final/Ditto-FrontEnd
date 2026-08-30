"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const ITEMS_PER_PAGE = 2;

function chunkItems(items, size) {
  const pages = [];
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }
  return pages;
}

export function MypageCourseCarousel({
  items,
  renderItem,
  accentColor = "#5c2ef5",
  getItemKey,
}) {
  const scrollerRef = useRef(null);
  const activePageRef = useRef(0);
  const [activePage, setActivePage] = useState(0);

  const pages = useMemo(
    () => chunkItems(items, ITEMS_PER_PAGE),
    [items],
  );

  // items 변경 시 첫 페이지로 리셋 (렌더 중 상태 조정)
  const [prevItems, setPrevItems] = useState(items);
  if (items !== prevItems) {
    setPrevItems(items);
    setActivePage(0);
  }

  // 최신 activePage를 ref에 동기화 (리사이즈 정렬용)
  useEffect(() => {
    activePageRef.current = activePage;
  }, [activePage]);

  // items 변경 시 스크롤 위치 리셋
  useEffect(() => {
    const node = scrollerRef.current;
    if (node) {
      node.scrollLeft = 0;
    }
  }, [items]);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return undefined;

    let frame = 0;
    const keepPageAligned = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const width = node.clientWidth;
        if (!width) return;
        const target = activePageRef.current * width;
        if (Math.abs(node.scrollLeft - target) > 1) {
          node.scrollLeft = target;
        }
      });
    };

    const observer = new ResizeObserver(keepPageAligned);
    observer.observe(node);
    window.addEventListener("resize", keepPageAligned);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", keepPageAligned);
    };
  }, []);

  const syncPage = useCallback(() => {
    const node = scrollerRef.current;
    if (!node?.clientWidth) return;
    const nextPage = Math.round(node.scrollLeft / node.clientWidth);
    setActivePage(
      Math.min(Math.max(nextPage, 0), Math.max(pages.length - 1, 0)),
    );
  }, [pages.length]);

  const scrollToPage = useCallback(
    (page) => {
      const node = scrollerRef.current;
      if (!node) return;
      const clamped = Math.min(Math.max(page, 0), Math.max(pages.length - 1, 0));
      node.scrollTo({
        left: clamped * node.clientWidth,
        behavior: "smooth",
      });
      setActivePage(clamped);
    },
    [pages.length],
  );

  if (items.length === 0) return null;

  return (
    <div className="w-full min-w-0">
      <div className="overflow-hidden py-1.5">
        <div
          ref={scrollerRef}
          onScroll={syncPage}
          className="hide-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        >
          {pages.map((pageItems, pageIndex) => (
            <div
              key={`course-page-${pageIndex}`}
              // 좌우 패딩을 카드 간격(gap)의 절반씩 줘, 페이지 경계에서 맞닿는
              // 카드(예: 2번↔다음 페이지 3번) 사이 간격을 페이지 안쪽 간격과 똑같이 맞춘다.
              // 패딩은 border-box 안쪽이라 페이지 폭은 100% 그대로여서 스냅 정렬에 영향 없다.
              className="grid w-full min-w-full max-w-full flex-[0_0_100%] snap-start snap-always grid-cols-2 gap-3 px-1.5 sm:gap-4 sm:px-2"
            >
              {pageItems.map((item) => (
                <div
                  key={getItemKey?.(item) || item.id || item.slug}
                  className="min-w-0"
                >
                  {renderItem(item)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {pages.length > 1 ? (
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => scrollToPage(activePage - 1)}
            disabled={activePage === 0}
            className={`flex size-9 items-center justify-center rounded-xl font-bold transition ${
              activePage === 0
                ? "cursor-not-allowed border border-line bg-white/50 text-ink-muted/40"
                : "cursor-pointer border border-line bg-white text-ink shadow-xs hover:border-line-strong"
            }`}
            aria-label="이전 코스"
          >
            ‹
          </button>

          <div className="flex items-center gap-1.5">
            {pages.map((_, pageIndex) => {
              const isActive = activePage === pageIndex;
              return (
                <button
                  key={`course-dot-${pageIndex}`}
                  type="button"
                  aria-label={`${pageIndex + 1}페이지`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => scrollToPage(pageIndex)}
                  style={{
                    backgroundColor: isActive ? accentColor : undefined,
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    isActive
                      ? "w-5"
                      : "w-1.5 cursor-pointer bg-line hover:bg-line-strong"
                  }`}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollToPage(activePage + 1)}
            disabled={activePage === pages.length - 1}
            className={`flex size-9 items-center justify-center rounded-xl font-bold transition ${
              activePage === pages.length - 1
                ? "cursor-not-allowed border border-line bg-white/50 text-ink-muted/40"
                : "cursor-pointer border border-line bg-white text-ink shadow-xs hover:border-line-strong"
            }`}
            aria-label="다음 코스"
          >
            ›
          </button>
        </div>
      ) : null}
    </div>
  );
}
