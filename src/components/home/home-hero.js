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
    trackStyle: heroTrackStyle,
    handlers: heroHandlers,
  } = useDragCarousel({ length: slides.length, auto: true, interval: 5000 });
  const mobileSlide = slides[heroIndex];

  const activeSlide = slides[activeIndex];
  const heroMinHeight = "clamp(480px, 44vw, 640px)";

  return (
    <>
      <section className="px-5 pb-2 pt-5 lg:hidden">
        <p className="text-[11px] font-black tracking-wide text-brand">
          {mobileSlide.eyebrow}
        </p>
        <h1 className="mt-2.5 text-[24px] font-black leading-[1.5] text-ink">
          <span className="block">{mobileSlide.titleLine}</span>
          <span className="mt-1.5 block">
            <span className="text-brand">{mobileSlide.accent}</span>
            {mobileSlide.suffix}
          </span>
        </h1>

        <div
          ref={heroViewportRef}
          className={`relative mt-4 select-none overflow-hidden rounded-[22px] ${
            heroDragging ? "cursor-grabbing" : ""
          }`}
          {...heroHandlers}
        >
          <div className="flex" style={heroTrackStyle}>
            {slides.map((slide) => (
              <div
                key={slide.titleLine}
                className="relative min-w-full shrink-0 basis-full overflow-hidden rounded-[22px]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url("${slide.image}")` }}
                  role="img"
                  aria-label={slide.alt}
                />
                <div className="absolute inset-0 bg-linear-to-br from-[#2d1b8e]/92 via-[#5c2ef5]/78 to-[#8c57fa]/70" />
                <div className="relative flex min-h-[168px] flex-col justify-between p-5">
                  <p className="text-[28px] font-black tracking-tight text-white">
                    DITTO
                  </p>
                  <div>
                    <p className="text-[13px] font-semibold leading-6 text-white/90">
                      {slide.description.split("\n")[0]}
                    </p>
                    <Link
                      href={slide.primaryCta.href}
                      className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-black text-brand"
                    >
                      {slide.primaryCta.label}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <SlideIndicators
            slides={slides}
            activeIndex={heroIndex}
            onSelect={setHeroIndex}
            compact
          />
        </div>
      </section>

      <section className="relative hidden w-full overflow-hidden lg:block">
        <div className="relative" style={{ minHeight: heroMinHeight }}>
          <div className="absolute inset-0 bg-linear-to-br from-[#1b1826] via-[#282338] to-[#372f4b]" />

          {/* 오른쪽에 크게 깔되 가장자리는 배경에 스며들도록 마스크 페이드 */}
          <div className="absolute inset-y-0 right-0 w-[60%]">
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={HERO_VIDEO_SRC}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, #000 40%)",
                maskImage:
                  "linear-gradient(to right, transparent 0%, #000 40%)",
              }}
            />
          </div>

          {/* 텍스트 가독성용 좌측 어둠 */}
          <div className="absolute inset-0 bg-linear-to-r from-[#1b1826]/88 via-[#1b1826]/38 to-transparent" />

          <div
            className="relative flex w-full max-w-2xl flex-col justify-center gap-7 px-6 sm:px-12 lg:px-32"
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
