import Link from "next/link";
import { RecommendedCourseTicket } from "@/components/courses/recommended-course-ticket";
import { DEFAULT_COMMUNITY_COURSE_IMAGES } from "@/lib/community/default-course-images";
import { cssUrl } from "@/lib/courses/css-url";

const IMAGE_LAYER_CLASS =
  "absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105";
const READABILITY_GRADIENT_CLASS =
  "absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/55";

function getCourseImage(course) {
  const rankNumber = parseInt(String(course.rank || "").replace(/\D/g, ""), 10);
  const index = Number.isNaN(rankNumber) ? 0 : Math.max(0, rankNumber - 1);
  return course.image || DEFAULT_COMMUNITY_COURSE_IMAGES[index % DEFAULT_COMMUNITY_COURSE_IMAGES.length];
}

export function CourseCard({ course }) {
  const image = getCourseImage(course);

  return (
    <>
      {/* 모바일: DITTO PICKS 3열 그리드에 들어가는 컴팩트 카드 (1/3 폭). */}
      <Link
        href={course.href}
        className="group flex min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_6px_16px_rgba(43,28,89,0.08)] transition-transform duration-200 active:scale-[0.98] lg:hidden"
      >
        <div
          className={`relative aspect-square shrink-0 overflow-hidden bg-linear-to-br ${course.gradient}`}
        >
          <div
            className={IMAGE_LAYER_CLASS}
            style={{ backgroundImage: cssUrl(image) }}
          />
          <div className={READABILITY_GRADIENT_CLASS} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-2.5">
          <h3 className="line-clamp-2 break-keep text-[12px] font-black leading-snug text-ink group-hover:text-brand">
            {course.title}
          </h3>
          <p className="mt-1 truncate text-[9px] font-semibold leading-snug text-ink-muted">
            {course.tags.map((tag) => `#${tag}`).join(" ")}
          </p>
        </div>
      </Link>

      <RecommendedCourseTicket course={{ ...course, image }} className="hidden lg:block" />
    </>
  );
}
