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

// 히어로 CTA 버튼 (모바일=sm, 데스크톱=md / solid=흰버튼, outline=글래스)
function HeroCta({ href, label, tone = "solid", size = "md" }) {
  const sizeStyles =
    size === "sm"
      ? "min-h-8 gap-1.5 px-4 text-[11px]"
      : "gap-2 px-6 py-3 text-sm";
  const toneStyles =
    tone === "solid"
      ? "bg-white text-ink shadow-control hover:bg-white/90"
      : "border border-white/50 bg-white/10 text-white backdrop-blur-md hover:bg-white/18";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  return (
    <Link
      href={href}
      className={`group inline-flex items-center justify-center whitespace-nowrap rounded-full font-black transition ${sizeStyles} ${toneStyles}`}
    >
      {label}
      <ArrowRightIcon className={`${iconSize} transition group-hover:translate-x-0.5`} />
    </Link>
  );
}

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
        className={`relative min-h-[340px] select-none overflow-hidden bg-[#100b24] px-5 pb-6 pt-6 text-white lg:hidden ${
          heroDragging ? "cursor-grabbing" : ""
        }`}
        {...heroHandlers}
      >
        <video
          className="absolute inset-0 h-full w-full object-cover object-center"
          src={HERO_VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/66 via-black/18 to-black/76" />
        <div className="absolute inset-0 bg-linear-to-r from-[#170f34]/68 via-black/22 to-transparent" />

        <div className="relative flex min-h-[320px] flex-col justify-end">
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
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <HeroCta
                href={mobileSlide.primaryCta.href}
                label={mobileSlide.primaryCta.label}
                tone="solid"
                size="sm"
              />
              <HeroCta
                href={mobileSlide.secondaryCta.href}
                label={mobileSlide.secondaryCta.label}
                tone="outline"
                size="sm"
              />
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
              <HeroCta
                href={activeSlide.primaryCta.href}
                label={activeSlide.primaryCta.label}
                tone="solid"
              />
              <HeroCta
                href={activeSlide.secondaryCta.href}
                label={activeSlide.secondaryCta.label}
                tone="outline"
              />
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
