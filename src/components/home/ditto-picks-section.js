import Link from "next/link";
import {
  categoryChips,
  pickCourses,
  realtimeKeywords,
} from "@/lib/fixtures/home";
import { CourseCard } from "@/components/home/course-card";
import { SectionHeading } from "@/components/home/section-heading";
import { getTranslations } from "next-intl/server";

export async function DittoPicksSection() {
  const t = await getTranslations("home");

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
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:mb-6 lg:flex-wrap lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
        {categoryChips.map((chip, index) => (
          <button
            key={chip}
            type="button"
            className={`shrink-0 rounded-full px-4 py-1.5 text-[11px] font-black lg:px-5 lg:py-2 lg:text-xs ${
              index === 0
                ? "bg-brand text-white"
                : "bg-brand-soft text-brand hover:bg-white"
            }`}
          >
            {index === 0 ? t("all") : chip}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 items-stretch gap-3 lg:grid-cols-4 lg:gap-5">
        {pickCourses.slice(0, 3).map((course) => (
          <CourseCard key={course.rank} course={course} />
        ))}

        <aside className="col-span-2 flex h-full min-h-[300px] flex-col overflow-hidden rounded-[24px] border border-brand/10 bg-white shadow-[0_8px_20px_rgba(43,28,89,0.08)] lg:col-span-1 lg:min-h-[390px] lg:rounded-[32px]">
          <div className="bg-linear-to-br from-[#2d1b8e] to-[#6d28d9] px-5 py-5 text-white lg:px-6 lg:py-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-200 lg:text-xs">
                  REALTIME TREND
                </p>
                <h3 className="mt-1 text-lg font-black tracking-tight lg:text-[22px]">
                  {t("keywordTitle")}
                </h3>
              </div>
              <Link
                href="/news"
                className="mt-0.5 shrink-0 text-[11px] font-black text-violet-100 transition hover:text-white lg:text-xs"
              >
                {t("viewAll")} <span aria-hidden="true">→</span>
              </Link>
            </div>
            <p className="mt-1.5 text-[11px] leading-4 text-violet-100 lg:text-xs">
              {t("keywordDescription")}
            </p>
          </div>

          <ol className="flex flex-1 flex-col justify-center px-5 py-2 lg:px-6 lg:py-3">
            {realtimeKeywords.map((keyword, index) => (
              <li
                key={keyword}
                className="flex min-h-9 flex-1 items-center gap-3 border-b border-brand/10 last:border-b-0 lg:min-h-10"
              >
                <span
                  className={`w-6 shrink-0 text-center text-sm font-black tabular-nums lg:text-base ${
                    index < 3 ? "text-brand" : "text-ink-muted"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="truncate text-xs font-black text-ink lg:text-sm">
                  {keyword}
                </span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </section>
  );
}
