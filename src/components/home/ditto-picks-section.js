"use client";

import { useEffect, useState } from "react";
import { realtimeKeywords } from "@/lib/fixtures/home";
import { COUNTRIES } from "@/lib/fixtures/countries";
import { CourseCard } from "@/components/home/course-card";
import { CountryFlag } from "@/components/common/country-flag";
import { SectionHeading } from "@/components/home/section-heading";
import { getSystemCourses } from "@/lib/api/courses";
import { useTranslations } from "next-intl";

const GRADIENTS = [
  "from-[#5c2ef5] to-[#8c57fa]",
  "from-[#2d1b8e] to-[#5c2ef5]",
  "from-[#6d28d9] to-[#c084fc]",
  "from-[#4a2fa8] to-[#7c5cf0]",
];

export function DittoPicksSection({ initialCourses = [] }) {
  const t = useTranslations("home");
  const [selectedCountry, setSelectedCountry] = useState("KR");
  const [systemCourses, setSystemCourses] = useState(initialCourses);

  useEffect(() => {
    let active = true;
    if (initialCourses.length > 0) {
      return;
    }
    getSystemCourses({ page: 0, size: 6 })
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data)
            ? data
            : [];
        if (list.length > 0) {
          const mapped = list.map((c, i) => {
            const rawTags = Array.isArray(c.places) && c.places.length > 0
              ? c.places.map((p) => p.name.replace(/^#/, "")).slice(0, 2)
              : Array.isArray(c.tags)
                ? c.tags.map((t) => t.replace(/^#/, "")).slice(0, 2)
                : ["더현대", "DITTO"];

            const engTitle = c.englishTitle || (c.name ? c.name.toUpperCase() : `TOP ${i + 1} COURSE`);

            return {
              rank: `TOP ${i + 1}`,
              englishTitle: engTitle,
              title: c.name || c.title || "기본 추천 코스",
              tags: rawTags,
              href: c.slug
                ? `/courses/${c.slug}`
                : c.courseId
                  ? `/ai-course?courseId=${c.courseId}`
                  : `/courses`,
              gradient: c.gradient || GRADIENTS[i % GRADIENTS.length],
            };
          });

          if (mapped.length > 0) {
            setSystemCourses(mapped);
          }
        }
      })
      .catch((err) => {
        console.warn("[DittoPicksSection] Failed to load system courses:", err?.message);
      });

    return () => {
      active = false;
    };
  }, [initialCourses]);

  const displayCourses = systemCourses.length > 0 ? systemCourses : initialCourses;

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
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1.2fr_1fr_1fr_1fr] lg:items-stretch lg:gap-5">
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
        <aside className="order-4 hidden flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_8px_20px_rgba(43,28,89,0.08)] lg:order-1 lg:flex lg:h-full lg:min-h-0 lg:rounded-[32px]">
          <div className="flex min-h-[100px] flex-col justify-end bg-linear-to-br from-[#2d1b8e] via-[#4a2fa8] to-[#6d28d9] px-5 py-4 text-white sm:min-h-[112px] sm:px-6 sm:py-5 lg:px-6">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-200 lg:text-xs">
              REALTIME TREND
            </p>
            <h3 className="mt-1 text-lg font-black tracking-tight break-keep whitespace-nowrap sm:text-xl lg:text-[21px] xl:text-[24px] lg:leading-7 xl:leading-8">
              {t("keywordTitle")}
            </h3>
          </div>
          <ol className="flex flex-1 flex-col justify-center gap-1.5 px-5 py-4 sm:px-6 sm:py-5 lg:px-5 xl:px-6">
            {realtimeKeywords.map((keyword, index) => (
              <li
                key={keyword}
                className="flex min-h-9 flex-1 items-center gap-3.5 sm:gap-4 lg:gap-4"
              >
                <span
                  className={`w-8 shrink-0 text-left text-xl font-black tabular-nums tracking-tight sm:w-9 sm:text-2xl lg:w-9 lg:text-2xl xl:w-11 xl:text-3xl ${
                    index < 3 ? "text-brand" : "text-[#aaa4bc]"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="truncate text-base font-black text-ink sm:text-lg lg:text-lg xl:text-xl">
                  {keyword}
                </span>
              </li>
            ))}
          </ol>
        </aside>

        {/* TOP 1, 2, 3 코스 카드 (모바일 3개 한 줄, 데스크톱 3열) */}
        <div className="order-2 grid grid-cols-3 gap-2.5 lg:order-2 lg:col-span-3 lg:grid-cols-3 lg:gap-5">
          {displayCourses.length > 0 ? (
            displayCourses.slice(0, 3).map((course) => (
              <CourseCard key={course.rank} course={course} />
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-line p-8 text-center text-sm font-medium text-ink-muted">
              등록된 기본 추천 코스가 없습니다.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
