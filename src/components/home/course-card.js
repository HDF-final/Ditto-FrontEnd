import Link from "next/link";
import { RecommendedCourseTicket } from "@/components/courses/recommended-course-ticket";
import { DEFAULT_COMMUNITY_COURSE_IMAGES } from "@/lib/community/default-course-images";

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
      <Link
        href={course.href}
        className="group flex min-h-[360px] min-w-0 flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_10px_26px_rgba(43,28,89,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(43,28,89,0.13)] lg:hidden"
      >
        <div
          className={`relative flex h-[170px] shrink-0 flex-col justify-between overflow-hidden bg-linear-to-br p-7 text-white ${course.gradient}`}
        >
          <div
            className={IMAGE_LAYER_CLASS}
            style={{ backgroundImage: `url(${image})` }}
          />
          <div className={READABILITY_GRADIENT_CLASS} />
          <span className="relative z-10 w-fit rounded-full bg-white/25 px-3 py-1.5 text-[10px] font-black tracking-wide text-white/95 backdrop-blur-md">
            {course.rank}
          </span>
          <p className="relative z-10 line-clamp-2 break-keep text-[23px] font-black leading-tight tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
            {course.englishTitle}
          </p>
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-7">
          <h3 className="line-clamp-2 break-keep text-xl font-black leading-snug text-ink group-hover:text-brand">
            {course.title}
          </h3>
          <p className="mt-2 truncate text-sm font-semibold leading-snug text-ink-muted">
            {course.tags.map((tag) => `#${tag}`).join(" ")}
          </p>
        </div>
      </Link>

      <RecommendedCourseTicket course={{ ...course, image }} className="hidden lg:block" />
    </>
  );
}
