"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";

export function CommunityDetailHeroImage({
  images: serverImages,
  fallbackImage,
  alt = "코스 대표 사진",
  className = "h-full w-full object-cover",
  showControls = true,
}) {
  const uploaded = Array.isArray(serverImages) ? serverImages.filter(Boolean) : [];

  const images =
    uploaded.length > 0
      ? uploaded
      : [
          fallbackImage ||
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=900&fit=crop",
        ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (!isLightboxOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
        return;
      }
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
        return;
      }
      if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [images.length, isLightboxOpen]);

  const prevImage = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const nextImage = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const currentSrc = images[currentIndex] || images[0];

  return (
    <div className="group/carousel relative h-full w-full overflow-hidden">
      <button
        type="button"
        onClick={() => setIsLightboxOpen(true)}
        aria-label="사진 크게 보기"
        className="block h-full w-full cursor-zoom-in p-0 text-left"
      >
        <img
          key={currentIndex}
          src={currentSrc}
          alt={`${alt} ${currentIndex + 1}`}
          className={`transition-opacity duration-300 ${className}`}
        />
      </button>

      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover/carousel:bg-black/10">
        <span className="inline-flex scale-95 items-center gap-1.5 rounded-full bg-black/70 px-4 py-2 text-xs font-black text-white opacity-0 shadow-md backdrop-blur-xs transition duration-300 group-hover/carousel:scale-100 group-hover/carousel:opacity-100">
          <svg
            aria-hidden="true"
            className="size-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
          크게 보기
        </span>
      </div>

      {/* 하단 소프트 다크 그라데이션 (상단과 대칭을 이루어 인디케이터 가독성 확보) */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none z-10" />

      {showControls && images.length > 1 && (
        <>
          {/* 이전 사진 버튼 (호버 시 노출) */}
          <button
            type="button"
            onClick={prevImage}
            aria-label="이전 사진 보기"
            className="absolute left-3 top-1/2 z-20 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition-all duration-200 hover:bg-black/90 hover:scale-110 active:scale-95 cursor-pointer shadow-lg opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
          >
            <svg
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* 다음 사진 버튼 (호버 시 노출) */}
          <button
            type="button"
            onClick={nextImage}
            aria-label="다음 사진 보기"
            className="absolute right-3 top-1/2 z-20 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition-all duration-200 hover:bg-black/90 hover:scale-110 active:scale-95 cursor-pointer shadow-lg opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
          >
            <svg
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* 사진 번호 배지 */}
          <div className="absolute right-4 top-4 z-20 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-xs border border-white/15 shadow-sm pointer-events-none">
            <span>{currentIndex + 1}</span>
            <span className="text-white/50">/</span>
            <span>{images.length}</span>
          </div>

          {/* 하단 점 인디케이터 (클릭하여 사진 전환) */}
          <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                aria-label={`${idx + 1}번째 사진 보기`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer p-0 border-0 ${
                  currentIndex === idx
                    ? "w-4 bg-white shadow-xs"
                    : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}

      {isLightboxOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} 크게 보기`}
          className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-200 sm:p-8"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(false);
            }}
            className="absolute right-5 top-5 z-20 flex size-11 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-white/30"
            aria-label="닫기"
          >
            <svg
              aria-hidden="true"
              className="size-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={prevImage}
                aria-label="이전 사진 보기"
                className="absolute left-4 top-1/2 z-20 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-white/30 sm:left-7"
              >
                <svg
                  className="size-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={nextImage}
                aria-label="다음 사진 보기"
                className="absolute right-4 top-1/2 z-20 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-white/30 sm:right-7"
              >
                <svg
                  className="size-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          ) : null}

          <div
            className="relative flex max-h-[90vh] max-w-[92vw] flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-h-[82vh] max-w-[92vw] overflow-hidden rounded-[20px] shadow-2xl ring-1 ring-white/20">
              <img
                src={currentSrc}
                alt={`${alt} ${currentIndex + 1}`}
                className="max-h-[82vh] max-w-[92vw] rounded-[20px] object-contain"
              />
            </div>
            <div className="mt-3.5 flex flex-col items-center text-center">
              <p className="text-sm font-bold text-white/95 drop-shadow-sm">
                {alt}
              </p>
              {images.length > 1 ? (
                <p className="mt-1 text-xs font-semibold text-white/70">
                  {currentIndex + 1} / {images.length}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
