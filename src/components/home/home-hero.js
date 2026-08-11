"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function HomeHero({ slides }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[activeIndex];

  return (
    <section className="px-5 py-6 lg:px-24">
      <div className="grid min-h-[440px] overflow-hidden rounded-[32px] bg-surface-soft lg:grid-cols-[1fr_560px]">
        <div className="flex flex-col justify-center gap-6 p-8 sm:p-14 lg:p-[60px]">
          <h1 className="text-3xl font-black leading-tight text-ink sm:text-5xl">
            {activeSlide.title}
            <br />
            <span className="text-brand">{activeSlide.accent}</span>{" "}
            {activeSlide.suffix}
          </h1>
          <p className="max-w-xl text-sm leading-7 text-ink-muted sm:text-base">
            {activeSlide.description}
          </p>
          <div>
            <Link
              href={activeSlide.href}
              className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-black text-white transition hover:bg-brand-dark"
            >
              {activeSlide.ctaLabel}
            </Link>
          </div>
          <div className="flex gap-2" aria-label="hero slide controls">
            {slides.map((slide, index) => (
              <button
                key={slide.visualTitle}
                type="button"
                aria-label={`${index + 1}번째 배너 보기`}
                onClick={() => setActiveIndex(index)}
                className={`h-2 rounded-full transition ${
                  activeIndex === index
                    ? "w-5 bg-brand"
                    : "w-2 bg-[#d9d5e8] hover:bg-brand/50"
                }`}
              />
            ))}
          </div>
        </div>
        <div
          className={`relative flex min-h-[220px] flex-col items-center justify-center bg-linear-to-r ${activeSlide.gradient} px-8 text-center text-white`}
        >
          <p className="text-4xl font-black tracking-tight">
            {activeSlide.visualTitle}
          </p>
          <p className="mt-2 text-xs text-white/80">{activeSlide.visualNote}</p>
        </div>
      </div>
    </section>
  );
}
