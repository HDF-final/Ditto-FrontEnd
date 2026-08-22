"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export function NewsImageLightbox({
  src,
  alt = "뉴스 이미지",
  caption = "",
  mode = "button", // "button" | "card"
}) {
  const t = useTranslations("news");
  const [isOpen, setIsOpen] = useState(false);

  const viewLargePhotoLabel =
    typeof t?.has === "function" && t.has("viewLargePhoto")
      ? t("viewLargePhoto")
      : "사진 크게 보기";

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!src) return null;

  return (
    <>
      {/* 1. Button mode (in Hero banner) */}
      {mode === "button" && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control border border-white/80 bg-black/40 backdrop-blur-xs px-6 text-sm font-black text-white transition hover:bg-white/25 cursor-pointer shadow-xs group"
          aria-label={viewLargePhotoLabel}
        >
          <svg
            aria-hidden="true"
            className="size-4.5 transition-transform group-hover:scale-110"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
          <span>{viewLargePhotoLabel}</span>
        </button>
      )}

      {/* 2. Card mode (in Article Body) */}
      {mode === "card" && (
        <figure className="my-2 w-full max-w-2xl mx-auto overflow-hidden">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setIsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsOpen(true);
              }
            }}
            className="relative block w-full aspect-[16/9] min-h-[190px] sm:min-h-[260px] lg:min-h-[300px] max-h-[340px] cursor-zoom-in overflow-hidden rounded-[16px] sm:rounded-[20px] border border-line bg-surface-soft shadow-sm transition-all hover:shadow-md group"
          >
            <Image
              src={src}
              alt={alt}
              fill
              unoptimized
              priority
              className="object-cover object-top sm:object-center transition duration-500 group-hover:scale-[1.03]"
            />
            {/* Hover overlay hint */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/25">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/75 px-4 py-2 text-xs font-black text-white opacity-0 backdrop-blur-xs transition duration-300 group-hover:opacity-100 shadow-md scale-95 group-hover:scale-100">
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
                {viewLargePhotoLabel}
              </span>
            </div>
          </div>
          {caption && (
            <figcaption className="mt-2 text-center text-xs text-ink-muted font-medium break-keep px-1">
              ▲ {caption}
            </figcaption>
          )}
        </figure>
      )}

      {/* 3. Fullscreen Lightbox Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="absolute top-5 right-5 z-20 flex size-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30 hover:scale-105 cursor-pointer shadow-lg"
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

          {/* Modal Content */}
          <div
            className="relative flex flex-col items-center max-h-[90vh] max-w-[92vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-h-[82vh] max-w-[92vw] overflow-hidden rounded-[20px] shadow-2xl ring-1 ring-white/20">
              <img
                src={src}
                alt={alt}
                className="max-h-[82vh] max-w-[92vw] object-contain rounded-[20px]"
              />
            </div>

            {/* Caption & Title */}
            <div className="mt-3.5 flex flex-col items-center text-center max-w-2xl px-4">
              <p className="text-sm font-bold text-white/95 drop-shadow-sm">
                {alt}
              </p>
              {caption && (
                <p className="mt-1 text-xs text-white/70">
                  {caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
