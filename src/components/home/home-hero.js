"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

function ArrowRightIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}

const HERO_VIDEO_SRC = "/assets/home/ditto-main-banner.mp4";

function SlideIndicators({
  slides,
  activeIndex,
  onSelect,
  compact = false,
  light = false,
}) {
  return (
    <div className="flex items-center gap-2" aria-label="배너 슬라이드 선택">
      {slides.map((slide, index) => (
        <button
          key={slide.titleLine}
          type="button"
          aria-label={`${index + 1}번째 배너 보기`}
          aria-current={activeIndex === index}
          onClick={() => onSelect(index)}
          className={`rounded-full transition-all ${
            compact ? "h-1.5" : "h-2.5"
          } ${
            activeIndex === index
              ? compact
                ? light
                  ? "w-5 bg-white"
                  : "w-5 bg-brand"
                : light
                  ? "w-7 bg-white"
                  : "w-7 bg-brand"
              : compact
                ? light
                  ? "w-1.5 bg-white/45 hover:bg-white/75"
                  : "w-1.5 bg-line-strong hover:bg-brand/50"
                : light
                  ? "w-2.5 bg-white/45 hover:bg-white/75"
                  : "w-2.5 bg-line-strong hover:bg-brand/50"
          }`}
        />
      ))}
    </div>
  );
}

export function HomeHero({ slides }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartXRef = useRef(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const goToNext = () =>
    setActiveIndex((current) => (current + 1) % slides.length);
  const goToPrev = () =>
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);

  const handleTouchStart = (event) => {
    touchStartXRef.current = event.touches[0].clientX;
  };
  const handleTouchEnd = (event) => {
    if (touchStartXRef.current === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartXRef.current;
    const SWIPE_THRESHOLD = 40;
    if (deltaX <= -SWIPE_THRESHOLD) goToNext();
    else if (deltaX >= SWIPE_THRESHOLD) goToPrev();
    touchStartXRef.current = null;
  };

  const activeSlide = slides[activeIndex];
  const heroMinHeight = "clamp(480px, 44vw, 640px)";

  return (
    <>
      <section className="px-5 pb-2 pt-5 lg:hidden">
        <div
          className="relative touch-pan-y select-none overflow-hidden rounded-[24px] bg-ink"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={HERO_VIDEO_SRC}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/55 via-black/35 to-black/70" />
          <div className="relative flex min-h-[420px] flex-col justify-end p-5">
            <p className="text-[11px] font-black tracking-wide text-white/85">
              {activeSlide.eyebrow}
            </p>
            <h1 className="mt-2.5 text-[26px] font-black leading-[1.35] text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)]">
              <span className="block">{activeSlide.titleLine}</span>
              <span className="mt-1 block">
                <span className="text-white">{activeSlide.accent}</span>
                {activeSlide.suffix}
              </span>
            </h1>
            <p className="mt-3 whitespace-pre-line text-[13px] font-semibold leading-6 text-white/88">
              {activeSlide.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Link
                href={activeSlide.primaryCta.href}
                className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-black text-ink shadow-control"
              >
                {activeSlide.primaryCta.label}
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href={activeSlide.secondaryCta.href}
                className="inline-flex items-center gap-1 rounded-full border border-white/55 bg-white/10 px-4 py-2 text-xs font-black text-white backdrop-blur-sm"
              >
                {activeSlide.secondaryCta.label}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="mt-5">
              <SlideIndicators
                slides={slides}
                activeIndex={activeIndex}
                onSelect={setActiveIndex}
                compact
                light
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative hidden w-full overflow-hidden lg:block">
        <div className="relative" style={{ minHeight: heroMinHeight }}>
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={HERO_VIDEO_SRC}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/78 via-black/44 to-black/12" />
          <div className="absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-black/20" />

          <div
            className="relative mx-auto flex w-full max-w-7xl flex-col justify-center gap-5 px-8 sm:px-14 lg:px-16"
            style={{ minHeight: heroMinHeight }}
          >
            <p className="text-sm font-black tracking-wide text-white/82">
              {activeSlide.eyebrow}
            </p>
            <h1 className="text-3xl font-black leading-snug text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.45)] sm:text-4xl lg:text-5xl">
              <span className="block">{activeSlide.titleLine}</span>
              <span className="block whitespace-nowrap">
                <span className="text-white">{activeSlide.accent}</span>
                {activeSlide.suffix}
              </span>
            </h1>
            <p className="max-w-xl whitespace-pre-line text-sm font-semibold leading-7 text-white/84 sm:text-base">
              {activeSlide.description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={activeSlide.primaryCta.href}
                className="group inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-6 py-3 text-sm font-black text-ink shadow-control transition hover:bg-white/90"
              >
                {activeSlide.primaryCta.label}
                <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href={activeSlide.secondaryCta.href}
                className="group inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/55 bg-white/10 px-6 py-3 text-sm font-black text-white backdrop-blur-sm transition hover:bg-white/18"
              >
                {activeSlide.secondaryCta.label}
                <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            </div>
            <SlideIndicators
              slides={slides}
              activeIndex={activeIndex}
              onSelect={setActiveIndex}
              light
            />
          </div>
        </div>
      </section>
    </>
  );
}
