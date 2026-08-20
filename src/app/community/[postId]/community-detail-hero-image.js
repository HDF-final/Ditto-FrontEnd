"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { useCommunityPostImagesStore } from "@/stores/use-community-post-images-store";
import { useIsMounted } from "@/hooks/use-is-mounted";

export function CommunityDetailHeroImage({
  postId,
  courseId,
  fallbackImage,
  alt = "코스 대표 사진",
  className = "h-full w-full object-cover",
  showControls = true,
}) {
  const mounted = useIsMounted();
  const getPostImages = useCommunityPostImagesStore((state) => state.getPostImages);

  const customImages = mounted
    ? getPostImages(postId).length > 0
      ? getPostImages(postId)
      : courseId
        ? getPostImages(courseId)
        : []
    : [];

  const images =
    customImages.length > 0
      ? customImages
      : [
          fallbackImage ||
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=900&fit=crop",
        ];

  const [currentIndex, setCurrentIndex] = useState(0);

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
      <img
        key={currentIndex}
        src={currentSrc}
        alt={`${alt} ${currentIndex + 1}`}
        className={`transition-opacity duration-300 ${className}`}
      />

      {showControls && images.length > 1 && (
        <>
          {/* 이전 사진 버튼 */}
          <button
            type="button"
            onClick={prevImage}
            aria-label="이전 사진 보기"
            className="absolute left-3 top-1/2 z-20 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition hover:bg-black/90 hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
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

          {/* 다음 사진 버튼 */}
          <button
            type="button"
            onClick={nextImage}
            aria-label="다음 사진 보기"
            className="absolute right-3 top-1/2 z-20 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition hover:bg-black/90 hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
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

          {/* 하단 점 인디케이터 */}
          <div className="absolute bottom-3 inset-x-0 z-20 flex justify-center gap-1.5 pointer-events-none">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`size-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? "w-4 bg-white" : "bg-white/45"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
