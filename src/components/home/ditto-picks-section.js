"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CourseCard } from "@/components/home/course-card";
import { RecommendedCourseOrbit } from "@/components/home/recommended-course-orbit";
import { getSystemCourses } from "@/lib/api/courses";
import {
  HOME_SYSTEM_COURSE_LIMIT,
  limitHomeSystemCourses,
} from "@/lib/courses/home-course-limit";
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
      return undefined;
    }
    getSystemCourses({ page: 0, size: HOME_SYSTEM_COURSE_LIMIT })
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
                : [t("defaultTagHyundai"), t("defaultTagDitto")];

            const engTitle = c.englishTitle || (c.name ? c.name.toUpperCase() : `TOP ${i + 1} COURSE`);

            return {
              courseId: c.courseId ?? c.id,
              rank: `TOP ${i + 1}`,
              englishTitle: engTitle,
              title: c.name || c.title || t("defaultRecommendedTitle"),
              description: c.description || t("defaultRecommendedDescription"),
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
  }, [initialCourses, t]);

  const displayCourses = limitHomeSystemCourses(
    initialCourses.length > 0 ? initialCourses : systemCourses,
  );

  return (
    <section
      id="picks"
      className="home-snap-panel scroll-mt-16 bg-surface-soft px-5 py-8 lg:flex lg:scroll-mt-0 lg:px-0 lg:py-0"
    >
      <div className="home-content-boundary lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:justify-center lg:py-[clamp(28px,5dvh,56px)]">
        <div className="lg:text-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-brand lg:hidden">
              DITTO PICKS
            </p>
            <h2 className="mt-2 break-keep text-[26px] font-black leading-tight text-ink lg:mt-0 lg:break-normal lg:text-5xl lg:leading-[1.18]">
              {t("picksTitle")}
            </h2>
            <p className="mt-2 text-sm font-medium leading-6 text-ink-muted lg:text-lg lg:font-semibold lg:leading-8">
              {t("picksDescription")}
            </p>
          </div>
        </div>

        <div className="home-section-stage mt-6">
          <div className="grid grid-cols-3 gap-2.5 lg:hidden">
            {displayCourses.length > 0 ? (
              displayCourses.slice(0, 3).map((course) => (
                <CourseCard key={course.rank} course={course} />
              ))
            ) : (
              <div className="col-span-3 rounded-2xl border border-dashed border-line bg-white p-8 text-center text-sm font-medium text-ink-muted">
                {t("emptyRecommended")}
              </div>
            )}
          </div>
          {displayCourses.length > 0 ? (
            <Link
              href="/courses"
              className="mt-4 flex items-center justify-center gap-1 rounded-full border border-brand/25 bg-white py-3 text-sm font-black text-brand shadow-2xs transition active:scale-[0.98] lg:hidden"
            >
              {t("picksViewAll")}
              <span aria-hidden="true">→</span>
            </Link>
          ) : null}
          {displayCourses.length > 0 ? (
            <div className="hidden lg:block">
              <RecommendedCourseOrbit courses={displayCourses} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
