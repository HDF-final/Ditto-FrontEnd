"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { communityCourses } from "@/lib/fixtures/home";
import { SectionHeading } from "@/components/home/section-heading";

function getFlagEmoji(countryCode) {
  if (!countryCode) return "🇰🇷";
  const code = countryCode.toUpperCase();
  if (code === "JP") return "🇯🇵";
  if (code === "CN") return "🇨🇳";
  if (code === "US") return "🇺🇸";
  if (code === "KR") return "🇰🇷";
  return "🌐";
}

function CommunityCourseCard({ course }) {
  return (
    <Link
      href={`/community/${course.slug || course.rank}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-[26px] aspect-[3/4] w-full bg-slate-950 shadow-[0_14px_36px_rgba(30,15,70,0.3)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_44px_rgba(30,15,70,0.45)]"
    >
      {/* Full Background Image */}
      <img
        src={course.image}
        alt={course.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Top Gradient for text legibility */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/80 via-black/35 to-transparent pointer-events-none" />

      {/* Bottom Gradient for title and metrics legibility */}
      <div className="absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-black/95 via-black/55 to-transparent pointer-events-none" />

      {/* Top Header Overlay (Transparent background) */}
      <div className="relative z-10 p-5 flex items-start justify-between">
        <div className="flex items-center gap-2.5 bg-black/30 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
          {/* Rank Badge */}
          <span className="flex size-7 items-center justify-center rounded-lg bg-[#5c2ef5] text-xs font-black text-white shadow-sm">
            {course.rank}
          </span>
          {/* Flag */}
          <span className="text-base leading-none">{getFlagEmoji(course.flag || course.country)}</span>
          {/* Name & Tag */}
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-bold text-white drop-shadow-sm">{course.name}</span>
            <span className="text-[11px] font-semibold text-violet-200 drop-shadow-sm">{course.hash}</span>
          </div>
        </div>

        {/* Top Right Card Icon (Transparent) */}
        <div className="flex size-8 items-center justify-center rounded-xl bg-black/30 backdrop-blur-xs text-white/90 border border-white/10">
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </div>
      </div>

      {/* Bottom Content Area (Transparent overlay on image) */}
      <div className="relative z-10 p-5 pt-0 flex flex-col gap-3">
        {/* Title & Description */}
        <div className="flex flex-col gap-1.5">
          <h3 className="text-2xl font-black text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] line-clamp-2">
            {course.title}
          </h3>
          {course.description && (
            <p className="text-xs font-medium text-white/90 line-clamp-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {course.description}
            </p>
          )}
        </div>

        {/* Bottom Transparent Stats */}
        <div className="flex items-center justify-end gap-4 pt-1 text-xs font-bold text-white/95">
          <span className="inline-flex items-center gap-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] hover:text-white transition-colors">
            <svg className="size-4 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {course.likes}
          </span>
          <span className="inline-flex items-center gap-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] hover:text-white transition-colors">
            <svg className="size-4 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {course.comments}
          </span>
          <span className="inline-flex items-center gap-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] hover:text-white transition-colors">
            <svg className="size-4 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            {course.saves}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function CommunityPreviewSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Group 9 courses into chunks of 3 (Slide 0: 1~3, Slide 1: 4~6, Slide 2: 7~9)
  const itemsPerSlide = 3;
  const totalSlides = Math.ceil(communityCourses.length / itemsPerSlide);

  const slides = [];
  for (let i = 0; i < communityCourses.length; i += itemsPerSlide) {
    slides.push(communityCourses.slice(i, i + itemsPerSlide));
  }

  // 2초마다 자동 슬라이드 전환
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 2000);

    return () => clearInterval(timer);
  }, [isPaused, totalSlides]);

  return (
    <section
      id="community"
      className="scroll-mt-[94px] bg-linear-to-br from-[#2d1b8e] via-[#4a2fa8] to-[#6d28d9] px-10 sm:px-14 py-16 lg:px-52 xl:px-60 2xl:px-72"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <SectionHeading
        eyebrow="TRAVELER COMMUNITY"
        title="지금 인기 있는 커스텀 코스"
        description="다른 여행자들이 직접 만들고 공유한 코스를 확인해보세요."
        href="/community"
        linkLabel="커뮤니티 둘러보기"
        inverse
      />

      {/* Slider Viewport */}
      <div className="relative overflow-hidden w-full pt-2 pb-4">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slideItems, slideIdx) => (
            <div
              key={slideIdx}
              className="w-full shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-1"
            >
              {slideItems.map((course) => (
                <CommunityCourseCard key={course.rank} course={course} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Indicator Dots */}
      <div className="mt-8 flex justify-center items-center gap-2.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentSlide === idx
                ? "w-7 bg-white shadow-sm"
                : "w-2.5 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`${idx + 1}번째 코스 목록 보기`}
            aria-current={currentSlide === idx}
          />
        ))}
      </div>
    </section>
  );
}
