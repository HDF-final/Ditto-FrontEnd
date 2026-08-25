"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDragCarousel } from "@/hooks/use-drag-carousel";

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

  // 데스크톱 히어로용 자동 넘김
  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  // 모바일 히어로: 손가락 따라오는 드래그 + 스냅
  const {
    index: heroIndex,
    setIndex: setHeroIndex,
    dragging: heroDragging,
    viewportRef: heroViewportRef,
    handlers: heroHandlers,
  } = useDragCarousel({ length: slides.length, auto: true, interval: 5000 });
  const mobileSlide = slides[heroIndex];

  const activeSlide = slides[activeIndex];
  const heroMinHeight = "clamp(480px, 44vw, 640px)";

  return (
    <>
      <section
        ref={heroViewportRef}
        className={`relative min-h-[410px] select-none overflow-hidden bg-[#100b24] px-5 pb-6 pt-6 text-white lg:hidden ${
          heroDragging ? "cursor-grabbing" : ""
        }`}
        {...heroHandlers}
      >
        <video
          className="absolute inset-0 h-full w-full scale-[1.32] object-cover object-[66%_center]"
          src={HERO_VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/78 via-black/24 to-black/82" />
        <div className="absolute inset-0 bg-linear-to-r from-[#170f34]/82 via-black/28 to-transparent" />

        <div className="relative flex min-h-[350px] flex-col justify-end">
          <div>
            <span className="inline-flex rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[10px] font-black tracking-[0.12em] text-white/86 backdrop-blur-md">
              LIVE K-TREND
            </span>
            <h1 className="mt-3.5 text-[29px] font-black leading-[1.18] text-white drop-shadow-[0_3px_22px_rgba(0,0,0,0.55)]">
              <span className="block">{mobileSlide.titleLine}</span>
              <span className="mt-1 block">
                <span>{mobileSlide.accent}</span>
                {mobileSlide.suffix}
              </span>
            </h1>
            <p className="mt-3 max-w-[290px] text-[13px] font-semibold leading-6 text-white/82">
              {mobileSlide.description}
            </p>
            <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
              <Link
                href={mobileSlide.primaryCta.href}
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-white px-4 text-[12px] font-black text-ink shadow-control"
              >
                {mobileSlide.primaryCta.label}
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
              <Link
                href={mobileSlide.secondaryCta.href}
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-white/45 bg-white/10 px-4 text-[12px] font-black text-white backdrop-blur-md"
                aria-label={mobileSlide.secondaryCta.label}
                title={mobileSlide.secondaryCta.label}
              >
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="relative mt-4">
          <SlideIndicators
            slides={slides}
            activeIndex={heroIndex}
            onSelect={setHeroIndex}
            compact
            light
          />
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
