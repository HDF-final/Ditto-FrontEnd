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

        <aside className="col-span-2 flex h-full min-h-[400px] flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_8px_20px_rgba(43,28,89,0.08)] lg:col-span-1 lg:min-h-[540px] lg:rounded-[32px]">
          <div className="flex min-h-[150px] flex-col justify-end bg-linear-to-br from-[#2d1b8e] via-[#4a2fa8] to-[#6d28d9] px-6 py-6 text-white lg:min-h-[190px] lg:px-8 lg:py-8">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-200 lg:text-xs">
              REALTIME TREND
            </p>
            <h3 className="mt-2 text-xl font-black tracking-tight lg:text-[28px] lg:leading-9">
              {t("keywordTitle")}
            </h3>
            <p className="mt-2 text-[11px] leading-5 text-violet-100 lg:text-sm lg:leading-6">
              {t("keywordDescription")}
            </p>
          </div>

          <ol className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 lg:gap-2 lg:px-8 lg:py-7">
            {realtimeKeywords.map((keyword, index) => (
              <li
                key={keyword}
                className="flex min-h-10 flex-1 items-center gap-4 lg:min-h-12 lg:gap-5"
              >
                <span
                  className={`w-8 shrink-0 text-left text-lg font-black tabular-nums tracking-tight lg:w-10 lg:text-2xl ${
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
      </div>
    </section>
  );
}
