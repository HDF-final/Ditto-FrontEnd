"use client";

import Link from "next/link";
import Image from "next/image";

import { useDragCarousel } from "@/hooks/use-drag-carousel";

/** 모바일: 뉴스레터 프리뷰를 한 장씩 드래그로 넘기는 슬라이더 */
export function NewsletterPreviewSlider({ items = [] }) {
  const {
    index,
    setIndex,
    dragging,
    viewportRef,
    trackStyle,
    handlers,
  } = useDragCarousel({ length: items.length });

  if (items.length === 0) return null;

  return (
    <div className="lg:hidden">
      <div
        ref={viewportRef}
        className={`w-full overflow-hidden select-none ${
          dragging ? "cursor-grabbing" : ""
        }`}
        {...handlers}
      >
        <div className="flex" style={trackStyle}>
          {items.map((news, idx) => {
            const category =
              news.label ||
              news.category ||
              (news.keywords?.[0] ? `${news.keywords[0]}` : null);
            const slug = news.slug || "";
            const href = slug ? `/news/${slug}` : "/news";

            return (
              <div
                key={`${news.slug || news.title}-${idx}`}
                className="min-w-full shrink-0 basis-full px-0.5"
              >
                <Link
                  href={href}
                  className="group flex flex-col overflow-hidden rounded-[18px] border border-line bg-white shadow-[0_8px_20px_rgba(43,28,89,0.06)]"
                >
                  <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-surface-muted">
                    {news.representativeImageUrl ? (
                      <Image
                        src={news.representativeImageUrl}
                        alt={news.title}
                        fill
                        unoptimized
                        draggable={false}
                        className="object-cover"
                      />
                    ) : (
                      <div
                        className={`h-full w-full bg-linear-to-br ${news.gradient || "from-[#2d1b8e] to-[#5c2ef5]"}`}
                      />
                    )}
                    {category ? (
                      <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2 py-1 text-[10px] font-black text-brand shadow-sm">
                        {category}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between p-3.5">
                    <h3 className="line-clamp-2 text-[14px] font-black leading-snug text-ink">
                      {news.title}
                    </h3>
                    {news.date ? (
                      <p className="mt-2 text-[10px] font-semibold text-ink-muted">
                        {news.date}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
      {items.length > 1 ? (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {items.map((news, idx) => (
            <button
              key={`${news.slug || news.title}-${idx}`}
              type="button"
              onClick={() => setIndex(idx)}
              aria-label={`${idx + 1}번째 뉴스 보기`}
              aria-current={index === idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === idx ? "w-5 bg-brand" : "w-1.5 bg-line-strong"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
