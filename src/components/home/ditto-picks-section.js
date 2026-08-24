"use client";

import { useState } from "react";
import { pickCourses, realtimeKeywords } from "@/lib/fixtures/home";
import { COUNTRIES } from "@/lib/fixtures/countries";
import { CourseCard } from "@/components/home/course-card";
import { CountryFlag } from "@/components/common/country-flag";
import { SectionHeading } from "@/components/home/section-heading";
import { useTranslations } from "next-intl";

export function DittoPicksSection() {
  const t = useTranslations("home");
  const [selectedCountry, setSelectedCountry] = useState("KR");

  return (
    <section
      id="picks"
      className="scroll-mt-16 bg-surface-soft px-5 py-5 lg:scroll-mt-24 lg:px-52 lg:py-16 xl:px-60 2xl:px-72"
    >
      <SectionHeading
        eyebrow="DITTO PICKS"
        title={t("picksTitle")}
        description={t("picksDescription")}
      />
      <div
        className="mb-3 flex gap-2 lg:mb-6 lg:gap-3"
        role="group"
        aria-label="Country ranking"
      >
        {COUNTRIES.map((country) => {
          const selected = country.code === selectedCountry;

          return (
            <button
              key={country.code}
              type="button"
              aria-label={`${country.name} (${country.code})`}
              aria-pressed={selected}
              title={country.name}
              onClick={() => setSelectedCountry(country.code)}
              className={`grid size-9 shrink-0 place-items-center rounded-full transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 lg:size-12 ${
                selected
                  ? "bg-brand shadow-[0_8px_18px_rgba(92,46,245,0.24)]"
                  : "bg-white hover:bg-brand-soft"
              }`}
            >
              <CountryFlag
                code={country.code}
                emoji={country.flag}
                className="h-[14px] w-[20px] shadow-[0_0_0_1px_rgba(15,10,30,0.16)] lg:h-[18px] lg:w-[26px]"
              />
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-4 lg:items-stretch lg:gap-5">
        {/* 모바일: 가로 칩 트렌드 */}
        <div className="order-1 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand/70" />
              <span className="relative inline-flex size-1.5 rounded-full bg-brand" />
            </span>
            <p className="text-[11px] font-black tracking-tight text-ink">
              {t("keywordTitle")}
            </p>
          </div>
          <div className="mt-3.5 flex flex-wrap gap-2.5">
            {realtimeKeywords.slice(0, 3).map((keyword, index) => (
              <span
                key={keyword}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-line bg-white px-3 py-2 text-ink shadow-[0_4px_12px_rgba(43,28,89,0.06)]"
              >
                <span className="text-[10px] font-black tabular-nums text-brand">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="truncate text-[12px] font-black">
                  {keyword}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* 데스크톱: 사이드 랭킹 카드 */}
        <aside className="order-4 hidden h-full min-h-0 flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_8px_20px_rgba(43,28,89,0.08)] lg:flex">
          <div className="flex min-h-[112px] flex-col justify-end bg-linear-to-br from-[#2d1b8e] via-[#4a2fa8] to-[#6d28d9] px-7 py-5 text-white">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-200">
              REALTIME TREND
            </p>
            <h3 className="mt-1 text-[22px] font-black leading-7 tracking-tight">
              {t("keywordTitle")}
            </h3>
          </div>
          <ol className="flex flex-1 flex-col justify-center px-7 py-4">
            {realtimeKeywords.map((keyword, index) => (
              <li key={keyword} className="flex min-h-8 flex-1 items-center gap-5">
                <span
                  className={`w-10 shrink-0 text-left text-2xl font-black tabular-nums tracking-tight ${
                    index < 3 ? "text-brand" : "text-[#aaa4bc]"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="truncate text-base font-black text-ink">
                  {keyword}
                </span>
              </li>
            ))}
          </ol>
        </aside>

        {/* TOP 1, 2, 3 코스 카드 */}
        <div className="order-2 grid grid-cols-3 gap-2.5 lg:order-1 lg:col-span-3 lg:grid-cols-3 lg:gap-5">
          {pickCourses.slice(0, 3).map((course) => (
            <CourseCard key={course.rank} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}
