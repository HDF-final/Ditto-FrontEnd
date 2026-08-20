import { categoryChips, pickCourses } from "@/lib/fixtures/home";
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
      <div className="grid grid-cols-2 gap-3 lg:gap-5 xl:grid-cols-4">
        {pickCourses.map((course) => (
          <CourseCard key={course.rank} course={course} />
        ))}
      </div>
      <div className="mt-7 hidden justify-center gap-2 lg:flex" aria-hidden="true">
        <span className="h-2 w-5 rounded-full bg-brand" />
        <span className="h-2 w-2 rounded-full bg-[#d9d5e8]" />
        <span className="h-2 w-2 rounded-full bg-[#d9d5e8]" />
      </div>
    </section>
  );
}
