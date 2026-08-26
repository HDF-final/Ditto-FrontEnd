"use client";

import { useEffect, useState } from "react";
import { RecommendedCourseTicket } from "@/components/courses/recommended-course-ticket";
import { CourseCard } from "@/components/home/course-card";
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
              courseId: c.courseId ?? c.id,
              rank: `TOP ${i + 1}`,
              englishTitle: engTitle,
              title: c.name || c.title || "기본 추천 코스",
              description: c.description || "DITTO가 엄선한 추천 코스입니다.",
              tags: rawTags,
              places: Array.isArray(c.places) ? c.places : [],
              href: c.slug
                ? `/courses/${c.slug}`
                : c.courseId
                  ? `/courses/${c.courseId}`
                  : `/courses`,
              image:
                c.image ||
                c.imageUrl ||
                c.thumbnailUrl ||
                c.coverImageUrl,
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
      className="scroll-mt-16 bg-surface-soft px-5 py-8 lg:scroll-mt-24 lg:px-52 lg:py-18 xl:px-60 2xl:px-72"
    >
      <div>
        <div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-brand">
              DITTO PICKS
            </p>
            <h2 className="mt-2 text-[26px] font-black leading-tight text-ink lg:text-[40px]">
              {t("picksTitle")}
            </h2>
            <p className="mt-2 text-sm font-medium leading-6 text-ink-muted lg:text-base">
              {t("picksDescription")}
            </p>
          </div>
        </div>

        <div className="mt-6 lg:mt-3">
          <div className="grid gap-5 lg:hidden">
            {displayCourses.length > 0 ? (
              displayCourses.slice(0, 3).map((course) => (
                <CourseCard key={course.rank} course={course} />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-sm font-medium text-ink-muted lg:col-span-3">
                등록된 기본 추천 코스가 없습니다.
              </div>
            )}
          </div>
          {displayCourses.length > 0 ? (
            <div className="hidden gap-6 lg:grid lg:grid-cols-3">
              {displayCourses.slice(0, 3).map((course) => (
                <RecommendedCourseTicket
                  key={`${course.href}-${course.rank}`}
                  course={course}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
