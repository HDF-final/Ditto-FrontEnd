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

// 히어로 배너 동영상은 CloudFront(course-resource/home/*)에서 나갑니다.
// 지도 자산(navigation-dataset.js)과 같은 CDN 규칙: 값을 안 주면 CDN 기본값,
// `NEXT_PUBLIC_CDN_BASE=` 빈 값이면 public/ 로 떨어집니다("" 과 미지정을 구분).
// 다른 버킷·배포로 옮길 때만 값을 주세요(Dockerfile 에 같은 이름의 ARG 가 있습니다).
const CDN_BASE_DEFAULT = "https://d1bxld598du04o.cloudfront.net/course-resource";
const CDN_BASE_OVERRIDE = process.env.NEXT_PUBLIC_CDN_BASE;
const CDN_BASE = (
  typeof CDN_BASE_OVERRIDE === "string" ? CDN_BASE_OVERRIDE : CDN_BASE_DEFAULT
)
  .trim()
  .replace(/\/+$/, "");

const HERO_VIDEO_SRC = CDN_BASE
  ? `${CDN_BASE}/home/ditto-main-banner.mp4`
  : "/assets/home/ditto-main-banner.mp4";

// 히어로 CTA 버튼 (모바일=sm, 데스크톱=md / solid=흰버튼, outline=글래스)
function HeroCta({ href, label, tone = "solid", size = "md" }) {
  const sizeStyles =
    size === "sm"
      ? "min-h-8 gap-1.5 px-4 text-[11px]"
      : "min-h-[52px] gap-2.5 px-7 py-3.5 text-base";
  const toneStyles =
    tone === "solid"
      ? "bg-white text-ink shadow-control hover:bg-white/90"
      : "border border-white/50 bg-white/10 text-white backdrop-blur-md hover:bg-white/18";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-[18px] w-[18px]";

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
            compact ? "h-1.5" : "h-3"
          } ${
            activeIndex === index
              ? compact
                ? light
                  ? "w-5 bg-white"
                  : "w-5 bg-brand"
                : light
                  ? "w-9 bg-white"
                  : "w-9 bg-brand"
              : compact
                ? light
                  ? "w-1.5 bg-white/45 hover:bg-white/75"
                  : "w-1.5 bg-line-strong hover:bg-brand/50"
                : light
                  ? "w-3 bg-white/45 hover:bg-white/75"
                  : "w-3 bg-line-strong hover:bg-brand/50"
          }`}
        />
      ))}
    </div>
  );
}

export function HomeHero({ slides }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const [copyPhase, setCopyPhase] = useState("idle");

  // 데스크톱 히어로용 자동 넘김
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6500);

    return () => window.clearTimeout(timer);
  }, [activeIndex, slides.length]);

  // 데스크톱 문구는 먼저 흐려진 뒤 교체하고 다시 선명하게 보여줍니다.
  useEffect(() => {
    if (activeIndex === displayedIndex) {
      const settleTimer = window.setTimeout(() => {
        setCopyPhase("idle");
      }, 420);

      return () => window.clearTimeout(settleTimer);
    }

    const leaveTimer = window.setTimeout(() => {
      setCopyPhase("leaving");
    }, 0);
    const swapTimer = window.setTimeout(() => {
      setDisplayedIndex(activeIndex);
      setCopyPhase("entering");
    }, 180);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(swapTimer);
    };
  }, [activeIndex, displayedIndex]);

  // 모바일 히어로: 손가락 따라오는 드래그 + 스냅
  const {
    index: heroIndex,
    setIndex: setHeroIndex,
    dragging: heroDragging,
    viewportRef: heroViewportRef,
    handlers: heroHandlers,
  } = useDragCarousel({ length: slides.length, auto: true, interval: 5000 });
  const mobileSlide = slides[heroIndex];

  const activeSlide = slides[displayedIndex];
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

      <section className="home-snap-panel relative hidden w-full overflow-hidden lg:block">
        <div className="relative h-full min-h-[480px]">
          <div className="absolute inset-0 bg-linear-to-br from-[#1b1826] via-[#282338] to-[#372f4b]" />

          {/* 오른쪽에 크게 깔되 가장자리는 배경에 스며들도록 마스크 페이드 */}
          <div className="absolute inset-y-0 right-0 w-[58%]">
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
                  "linear-gradient(to right, transparent 0%, #000 54%)",
                maskImage:
                  "linear-gradient(to right, transparent 0%, #000 54%)",
              }}
            />
          </div>

          {/* 텍스트 가독성용 좌측 어둠 */}
          <div className="absolute inset-0 bg-linear-to-r from-[#1b1826]/88 via-[#1b1826]/38 to-transparent" />

          <div className="home-content-boundary relative flex h-full items-center">
            <div className="flex w-full max-w-4xl flex-col gap-8">
              <div
                key={displayedIndex}
                className={`home-hero-copy flex flex-col gap-8 ${
                  copyPhase === "leaving"
                    ? "is-leaving"
                    : copyPhase === "entering"
                      ? "is-entering"
                      : ""
                }`}
              >
                <p className="text-base font-black tracking-wide text-white/82">
                  {activeSlide.eyebrow}
                </p>
                <h1 className="text-3xl font-black leading-[1.18] text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.45)] sm:text-4xl lg:text-[clamp(3.5rem,4.2vw,4.75rem)]">
                  <span className="block">{activeSlide.titleLine}</span>
                  <span className="block whitespace-nowrap">
                    <span className="text-white">{activeSlide.accent}</span>
                    {activeSlide.suffix}
                  </span>
                </h1>
                <p className="max-w-2xl whitespace-pre-line text-sm font-semibold leading-8 text-white/84 sm:text-base lg:text-lg">
                  {activeSlide.description}
                </p>
                <div className="flex flex-wrap gap-4">
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
              </div>
              <SlideIndicators
                slides={slides}
                activeIndex={activeIndex}
                onSelect={setActiveIndex}
                light
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
