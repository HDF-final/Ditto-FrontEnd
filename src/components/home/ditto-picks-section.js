import { categoryChips, pickCourses } from "@/lib/fixtures/home";
import { CourseCard } from "@/components/home/course-card";
import { SectionHeading } from "@/components/home/section-heading";
import { getTranslations } from "next-intl/server";

export async function DittoPicksSection() {
  const t = await getTranslations("home");

  return (
    <section id="picks" className="scroll-mt-24 bg-surface-soft px-10 sm:px-14 py-16 lg:px-52 xl:px-60 2xl:px-72">
      <SectionHeading
        eyebrow="DITTO PICKS"
        title={t("picksTitle")}
        description={t("picksDescription")}
      />
      <div className="mb-6 flex flex-wrap gap-2">
        {categoryChips.map((chip, index) => (
          <button
            key={chip}
            type="button"
            className={`rounded-full px-5 py-2 text-xs font-black ${
              index === 0
                ? "bg-brand text-white"
                : "bg-brand-soft text-brand hover:bg-white"
            }`}
          >
            {index === 0 ? t("all") : chip}
          </button>
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {pickCourses.map((course) => (
          <CourseCard key={course.rank} course={course} />
        ))}
      </div>
      <div className="mt-7 flex justify-center gap-2" aria-hidden="true">
        <span className="h-2 w-5 rounded-full bg-brand" />
        <span className="h-2 w-2 rounded-full bg-[#d9d5e8]" />
        <span className="h-2 w-2 rounded-full bg-[#d9d5e8]" />
      </div>
    </section>
  );
}
