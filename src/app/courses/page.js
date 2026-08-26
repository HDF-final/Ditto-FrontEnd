import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { CourseCountryFilter } from "@/components/courses/course-country-filter";
import { RecommendedCourseTicket } from "@/components/courses/recommended-course-ticket";
import { DEFAULT_COMMUNITY_COURSE_IMAGES } from "@/lib/community/default-course-images";
import { fetchRawSystemCoursesServer } from "@/lib/api/courses.server";

export async function generateMetadata() {
  const t = await getTranslations("courses");
  return { title: t("listTitle") };
}

const GRADIENTS = [
  "from-[#4b2dd8] via-[#6d3df4] to-[#8d5cf7]",
  "from-[#24146f] via-[#3c20b8] to-[#5c2ef5]",
  "from-[#5c2ef5] via-[#8447ef] to-[#b16cef]",
  "from-[#35218f] via-[#5840d8] to-[#795ff0]",
];
const MOBILE_COURSES_PER_PAGE = 2;
const DESKTOP_COURSES_PER_PAGE = 4;

function getCourseImage(course, index) {
  return (
    course.image ||
    DEFAULT_COMMUNITY_COURSE_IMAGES[index % DEFAULT_COMMUNITY_COURSE_IMAGES.length]
  );
}

function CoursePagination({ currentPage, totalPages, className = "" }) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="코스 목록 페이지"
      className={`mt-10 items-center justify-center gap-2 ${className}`}
    >
      <Link
        href={`/courses?page=${Math.max(1, currentPage - 1)}`}
        aria-disabled={currentPage === 1}
        className={`inline-flex size-10 items-center justify-center rounded-full border text-sm font-black transition ${
          currentPage === 1
            ? "pointer-events-none border-[#ded7f7] bg-white/55 text-[#b9b2ca]"
            : "border-[#ded7f7] bg-white text-ink hover:border-brand hover:text-brand"
        }`}
      >
        ‹
      </Link>
      {Array.from({ length: totalPages }, (_, index) => {
        const page = index + 1;
        const active = page === currentPage;
        return (
          <Link
            key={page}
            href={`/courses?page=${page}`}
            aria-current={active ? "page" : undefined}
            className={`inline-flex size-10 items-center justify-center rounded-full border text-sm font-black transition ${
              active
                ? "border-brand bg-brand text-white shadow-[0_10px_22px_rgba(92,46,245,0.24)]"
                : "border-[#ded7f7] bg-white text-ink hover:border-brand hover:text-brand"
            }`}
          >
            {page}
          </Link>
        );
      })}
      <Link
        href={`/courses?page=${Math.min(totalPages, currentPage + 1)}`}
        aria-disabled={currentPage === totalPages}
        className={`inline-flex size-10 items-center justify-center rounded-full border text-sm font-black transition ${
          currentPage === totalPages
            ? "pointer-events-none border-[#ded7f7] bg-white/55 text-[#b9b2ca]"
            : "border-[#ded7f7] bg-white text-ink hover:border-brand hover:text-brand"
        }`}
      >
        ›
      </Link>
    </nav>
  );
}

export default async function CoursesPage({ searchParams }) {
  const t = await getTranslations("courses");
  const params = searchParams ? await searchParams : {};
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const systemCourses = (await fetchRawSystemCoursesServer({ size: 20 }).catch(() => []))
    .filter((course) => {
      const type = String(course.creationType || course.courseType || course.type || "").toUpperCase();
      return type === "SYSTEM";
    });
  const courseCards = systemCourses.map((course, index) => {
    const courseId = course.courseId ?? course.id;
    const places = Array.isArray(course.places) ? course.places : [];
    const href = courseId
      ? `/courses/${courseId}`
      : course.slug
        ? `/courses/${course.slug}`
        : "/courses";

    return {
      courseId,
      rank: `TOP ${index + 1}`,
      title: course.name || course.title || "기본 추천 코스",
      description: course.description || "DITTO 공식 추천 코스입니다.",
      places,
      href,
      customizeHref: courseId ? `/ai-course?courseId=${courseId}` : "/ai-course",
      image: course.image || course.imageUrl || course.thumbnailUrl || course.coverImageUrl,
      gradient: course.gradient || GRADIENTS[index % GRADIENTS.length],
    };
  });
  const mobileTotalPages = Math.max(
    1,
    Math.ceil(courseCards.length / MOBILE_COURSES_PER_PAGE),
  );
  const desktopTotalPages = Math.max(
    1,
    Math.ceil(courseCards.length / DESKTOP_COURSES_PER_PAGE),
  );
  const currentMobilePage = Number.isNaN(requestedPage)
    ? 1
    : Math.min(Math.max(requestedPage, 1), mobileTotalPages);
  const currentDesktopPage = Number.isNaN(requestedPage)
    ? 1
    : Math.min(Math.max(requestedPage, 1), desktopTotalPages);
  const mobilePageStart =
    (currentMobilePage - 1) * MOBILE_COURSES_PER_PAGE;
  const desktopPageStart =
    (currentDesktopPage - 1) * DESKTOP_COURSES_PER_PAGE;
  const mobileCourseCards = courseCards.slice(
    mobilePageStart,
    mobilePageStart + MOBILE_COURSES_PER_PAGE,
  );
  const desktopCourseCards = courseCards.slice(
    desktopPageStart,
    desktopPageStart + DESKTOP_COURSES_PER_PAGE,
  );

  return (
    <main className="min-h-screen bg-surface-soft px-5 py-8 sm:px-8 sm:py-12 lg:px-0 lg:py-0">
      <section className="lg:min-h-[354px] lg:bg-white lg:px-52 lg:pb-16 lg:pt-[94px] xl:px-60 2xl:px-72">
        <div className="mx-auto max-w-[1180px] lg:max-w-none">
          {/* 헤더 섹션 */}
          <div className="mb-8 flex flex-col gap-5 sm:mb-10 lg:mb-0 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <div className="min-w-0 lg:w-full lg:max-w-[786px]">
              <p className="text-xs font-black uppercase tracking-[0.26em] text-brand lg:text-sm lg:normal-case lg:!tracking-normal">
                DITTO PICKS
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-ink sm:text-4xl lg:mt-6 lg:text-[42px] lg:leading-none lg:!tracking-normal">
                {t("listTitle")}
              </h1>
              <p className="mt-3 max-w-[620px] text-sm font-medium leading-relaxed text-ink-muted sm:text-base lg:mt-5 lg:max-w-none lg:text-base lg:leading-7">
                {t("listDescription")}
              </p>
              <CourseCountryFilter />
            </div>
            <div
              className="hidden h-14 w-[171px] shrink-0 lg:block"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      <section className="lg:bg-surface-soft lg:px-52 lg:py-14 xl:px-60 2xl:px-72">
        <div className="mx-auto max-w-[1180px] lg:max-w-none">
          {/* Mobile/PWA keeps the existing cards and two-item pagination. */}
          {courseCards.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:hidden">
                {mobileCourseCards.map((course, index) => (
                  <article
                    key={`${course.href}-mobile-${index}`}
                    className="group flex min-h-[560px] min-w-0 flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_8px_24px_rgba(43,28,89,0.06)] transition hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(43,28,89,0.12)] sm:rounded-[28px]"
                  >
                  <Link
                    href={course.href}
                    className={`relative flex min-h-[170px] shrink-0 flex-col justify-between overflow-hidden bg-linear-to-br p-6 text-white sm:min-h-[195px] sm:p-7 ${course.gradient}`}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{
                        backgroundImage: `url(${getCourseImage(course, mobilePageStart + index)})`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/55" />
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="inline-flex min-w-[62px] items-center justify-center whitespace-nowrap rounded-full bg-white/22 px-3 py-1.5 text-xs font-black tracking-wide backdrop-blur-md">
                        {course.rank}
                      </span>
                    </div>
                    <div className="relative z-10">
                      <p className="text-[11px] font-black tracking-[0.28em] text-white/70">
                        기본 추천 코스
                      </p>
                      <h2 className="mt-3 line-clamp-2 break-keep text-xl font-black tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] sm:text-2xl">
                        {course.title}
                      </h2>
                    </div>
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col p-6 sm:p-7">
                    <p className="break-keep text-sm font-medium leading-relaxed text-ink-muted">
                      {course.description}
                    </p>

                    {course.places.length > 0 ? (
                      <div className="mt-6 rounded-[18px] bg-surface-soft p-4 sm:p-5">
                        <p className="mb-3 text-sm font-black text-ink">
                          {t("coursePlaces")} ({course.places.length})
                        </p>
                        <ul className="flex max-h-[108px] flex-col gap-3 overflow-y-auto pr-1">
                          {course.places.map((place, placeIndex) => (
                            <li
                              key={place.placeId || `${place.floorCode}-${place.name}-${placeIndex}`}
                              className="flex min-w-0 items-center gap-3 text-sm"
                            >
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">
                                {placeIndex + 1}
                              </span>
                              <span className="shrink-0 rounded-full bg-white px-2.5 py-1 font-black text-brand">
                                {place.floorCode || place.floor || "1F"}
                              </span>
                              <span className="truncate font-bold text-ink">
                                {place.name}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <div className="mt-auto flex flex-col gap-3 pt-7 sm:flex-row">
                      <Link
                        href={course.href}
                        className="inline-flex flex-1 items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(92,46,245,0.18)] transition hover:bg-[#4a22d4]"
                      >
                        코스 상세 보기 →
                      </Link>
                      <Link
                        href={course.customizeHref}
                        className="inline-flex items-center justify-center rounded-full border border-[#ded7f7] bg-white px-5 py-3 text-sm font-black text-ink transition hover:border-brand hover:text-brand sm:min-w-[116px]"
                      >
                        커스텀하기
                      </Link>
                    </div>
                  </div>
                  </article>
                ))}
              </div>

              <div className="hidden gap-6 lg:grid lg:grid-cols-4">
                {desktopCourseCards.map((course, index) => (
                  <RecommendedCourseTicket
                    key={`${course.href}-desktop-${index}`}
                    course={course}
                  />
                ))}
              </div>

              <CoursePagination
                currentPage={currentMobilePage}
                totalPages={mobileTotalPages}
                className="flex lg:hidden"
              />
              <CoursePagination
                currentPage={currentDesktopPage}
                totalPages={desktopTotalPages}
                className="hidden lg:flex"
              />
            </>
          ) : (
            <div className="rounded-[26px] border border-dashed border-[#ded7f7] bg-white px-6 py-20 text-center">
              <p className="text-lg font-black text-ink">
                표시할 기본 코스가 없어요
              </p>
              <p className="mt-2 text-sm font-medium text-ink-muted">
                기본 코스가 등록되면 이곳에 표시됩니다.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
