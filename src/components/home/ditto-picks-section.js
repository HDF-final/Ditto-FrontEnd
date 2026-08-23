"use client";

import { useState } from "react";
import { pickCourses, realtimeKeywords } from "@/lib/fixtures/home";
import { COUNTRIES } from "@/lib/fixtures/countries";
import { CourseCard } from "@/components/home/course-card";
import { SectionHeading } from "@/components/home/section-heading";
import { useTranslations } from "next-intl";

export function DittoPicksSection() {
  const t = useTranslations("home");
  const [selectedCountry, setSelectedCountry] = useState("KR");

  return (
    <section
      id="picks"
      className="scroll-mt-16 bg-surface-soft px-5 py-8 lg:scroll-mt-24 lg:px-52 lg:py-16 xl:px-60 2xl:px-72"
    >
      <SectionHeading
        eyebrow="DITTO PICKS"
        title={t("picksTitle")}
        description={t("picksDescription")}
      />
      <div
        className="mb-4 flex gap-3 lg:mb-6"
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
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-xl transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 lg:h-12 lg:w-12 lg:text-2xl ${
                selected
                  ? "bg-brand shadow-[0_8px_18px_rgba(92,46,245,0.24)]"
                  : "bg-white hover:bg-brand-soft"
              }`}
            >
              <span aria-hidden="true">{country.flag}</span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-4 lg:items-stretch lg:gap-5">
        {/* 실시간 주목 키워드 (모바일에서는 상단 배치, 데스크톱에서는 4번째 열) */}
        <aside className="order-1 flex flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_8px_20px_rgba(43,28,89,0.08)] lg:order-4 lg:h-full lg:min-h-0 lg:rounded-[32px]">
          <div className="flex min-h-[100px] flex-col justify-end bg-linear-to-br from-[#2d1b8e] via-[#4a2fa8] to-[#6d28d9] px-5 py-4 text-white sm:min-h-[112px] sm:px-6 sm:py-5 lg:px-7">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-200 lg:text-xs">
              REALTIME TREND
            </p>
            <h3 className="mt-1 text-lg font-black tracking-tight sm:text-xl lg:text-[22px] lg:leading-7">
              {t("keywordTitle")}
            </h3>
          </div>

          <ol className="flex flex-1 flex-col justify-center gap-0.5 px-5 py-3.5 sm:px-6 sm:py-4 lg:px-7">
            {realtimeKeywords.map((keyword, index) => (
              <li
                key={keyword}
                className="flex min-h-8 flex-1 items-center gap-3.5 sm:gap-4 lg:gap-5"
              >
                <span
                  className={`w-7 shrink-0 text-left text-base font-black tabular-nums tracking-tight sm:w-8 sm:text-lg lg:w-10 lg:text-2xl ${
                    index < 3 ? "text-brand" : "text-[#aaa4bc]"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="truncate text-sm font-black text-ink lg:text-base">
                  {keyword}
                </span>
              </li>
            ))}
          </ol>
        </aside>

        {/* TOP 1, 2, 3 코스 카드 (모바일에서는 실시간 키워드 아래 가로 스크롤, 데스크톱에서는 1~3열) */}
        <div className="order-2 flex gap-3.5 overflow-x-auto pb-2 -mx-5 px-5 snap-x snap-mandatory hide-scrollbar lg:order-1 lg:col-span-3 lg:grid lg:grid-cols-3 lg:gap-5 lg:mx-0 lg:px-0 lg:pb-0 lg:overflow-visible">
          {pickCourses.slice(0, 3).map((course) => (
            <div key={course.rank} className="w-[72vw] max-w-[260px] shrink-0 snap-start lg:w-auto lg:max-w-none h-full">
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
