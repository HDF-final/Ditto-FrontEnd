import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { fetchRawSystemCoursesServer } from "@/lib/api/courses.server";

export async function generateMetadata() {
  const t = await getTranslations("courses");
  return { title: t("listTitle") };
}

const GRADIENTS = [
  "from-[#2d1b8e] to-[#8c57fa]",
  "from-[#5c2ef5] to-[#8c57fa]",
  "from-[#6d28d9] to-[#c084fc]",
  "from-[#4a2fa8] to-[#7c5cf0]",
];

export default async function CoursesPage() {
  const t = await getTranslations("courses");
  const systemCourses = await fetchRawSystemCoursesServer({ size: 20 }).catch(() => []);

  return (
    <main className="bg-surface-soft min-h-screen px-5 py-8 sm:px-8 sm:py-12 lg:px-52 xl:px-60 2xl:px-72">
      <div className="mx-auto max-w-[1020px]">
        {/* 헤더 섹션 */}
        <div className="mb-8 sm:mb-12">
          <p className="text-xs font-black uppercase tracking-widest text-brand">
            DITTO PICKS · SYSTEM COURSES
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-ink sm:text-3xl lg:text-4xl">
            {t("listTitle")}
          </h1>
          <p className="mt-2 text-sm text-ink-muted sm:text-base">
            {t("listDescription")}
          </p>
        </div>

        {/* 기본 코스 (SYSTEM) 목록 그리드 */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
          {systemCourses.map((course, index) => {
            const places = Array.isArray(course.places) ? course.places : [];
            const gradient = course.gradient || GRADIENTS[index % GRADIENTS.length];
            const courseHref = course.courseId
              ? `/courses/${course.courseId}`
              : course.slug
                ? `/courses/${course.slug}`
                : `/courses`;

            return (
              <article
                key={course.courseId || course.slug || index}
                className="flex flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_8px_24px_rgba(43,28,89,0.06)] transition hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(43,28,89,0.12)] sm:rounded-[28px]"
              >
                {/* 상단 그라데이션 헤더 */}
                <div
                  className={`flex min-h-[140px] flex-col justify-between bg-linear-to-br p-6 text-white sm:min-h-[160px] sm:p-7 ${gradient}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-white/20 text-xs font-black">
                      TOP {index + 1}
                    </span>
                    <span className="rounded-full bg-black/20 px-3 py-1 text-[11px] font-bold backdrop-blur-xs">
                      {course.creationType || "SYSTEM"}
                    </span>
                  </div>
                  <div>
                    <h2 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">
                      {course.name || course.title}
                    </h2>
                  </div>
                </div>

                {/* 본문 정보 */}
                <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
                  <div>
                    <p className="text-sm leading-relaxed text-ink-muted">
                      {course.description || "DITTO 공식 추천 코스입니다."}
                    </p>

                    {/* 코스 주요 스팟 미리보기 */}
                    {places.length > 0 ? (
                      <div className="mt-5 rounded-2xl bg-surface-soft p-4">
                        <p className="text-xs font-black text-ink mb-2.5">
                          {t("coursePlaces")} ({places.length})
                        </p>
                        <ul className="flex flex-col gap-2">
                          {places.map((place, sIdx) => (
                            <li key={place.placeId || `${place.floorCode}-${place.name}`} className="flex items-center gap-2 text-xs">
                              <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-black text-white">
                                {sIdx + 1}
                              </span>
                              <span className="font-bold text-brand shrink-0">{place.floorCode || place.floor || "1F"}</span>
                              <span className="font-medium text-ink truncate">{place.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>

                  {/* 액션 버튼 */}
                  <div className="mt-6 flex items-center gap-3 pt-2">
                    <Link
                      href={courseHref}
                      className="flex-1 rounded-full bg-brand py-3 text-center text-xs font-black text-white shadow-xs transition hover:bg-brand-dark cursor-pointer sm:text-sm"
                    >
                      코스 상세 보기 →
                    </Link>
                    <Link
                      href={`/ai-course?courseId=${course.courseId}`}
                      className="rounded-full border border-line bg-white px-4 py-3 text-center text-xs font-bold text-ink transition hover:border-brand hover:text-brand cursor-pointer sm:text-sm"
                    >
                      커스텀하기
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
