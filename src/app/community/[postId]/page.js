import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { fetchPublicCourseDetailServer } from "@/lib/api/community.server";
import { CommunityDetailActions } from "./community-detail-actions";
import { CommunityDetailHeroImage } from "./community-detail-hero-image";
import { CommunityCourseDetailMap } from "@/components/community/community-course-detail-map";
import { CommunityStopList } from "@/components/community/community-stop-list";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { postId } = await params;
  const course = await fetchPublicCourseDetailServer(postId);

  if (!course) {
    const t = await getTranslations("community");
    return { title: t.has("communityCourse") ? t("communityCourse") : "커뮤니티 코스" };
  }

  return { title: course.title };
}

function AuthorNote({ course, t, locale }) {
  const travelerText = t && t.has("traveler") ? t("traveler") : "여행자";
  const authorRecordText = t && t.has("authorRecord") ? t("authorRecord") : "작성자가 남긴 기록";
  const authorRecordDescText = t && t.has("authorRecordDescription")
    ? t("authorRecordDescription", { name: course.name || travelerText })
    : `이 코스를 만든 ${course.name || travelerText}님이 직접 쓴 글이에요.`;
  const otherCoursesText = t && t.has("otherCourses") ? t("otherCourses") : "다른 커뮤니티 코스 둘러보기 →";
  const authoredOnText = t && t.has("authoredOn")
    ? t("authoredOn", { date: course.createdAt ? new Date(course.createdAt).toLocaleDateString(locale) : "2026.03.02" })
    : `${course.createdAt ? new Date(course.createdAt).toLocaleDateString(locale) : "2026.03.02"} 작성`;

  return (
    <section className="bg-surface-soft px-10 sm:px-14 py-16 lg:px-52 xl:px-60 2xl:px-72">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black text-brand">COURSE NOTE</p>
            <h2 className="mt-3 text-[32px] font-black text-ink">
              {authorRecordText}
            </h2>
            <p className="mt-2 text-sm font-medium text-ink-muted">
              {authorRecordDescText}
            </p>
          </div>
          <Link
            href="/community"
            className="text-sm font-black text-brand transition hover:text-brand-dark"
          >
            {otherCoursesText}
          </Link>
        </div>

        <article className="mt-8 rounded-[28px] bg-white p-8 shadow-[0_8px_20px_rgba(43,28,89,0.06)]">
          {/* 1. 상단 작성자 프로필 */}
          <div className="flex items-center gap-4 border-b border-line/60 pb-6">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-xs font-black text-white shadow-xs ring-2 ring-brand/10">
              {(course.name || travelerText).slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-black text-ink">{course.name || travelerText}</p>
                <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-black text-brand">
                  {course.country || "KR"}
                </span>
              </div>
              <p className="mt-0.5 text-xs font-medium text-ink-muted">
                {authoredOnText}
              </p>
            </div>
          </div>

          {/* 2. 하단 사진 및 본문 내용 (일렬로 나란히 정렬) */}
          <div className="mt-6 grid gap-7 lg:grid-cols-[0.86fr_1fr] items-stretch">
            {/* 좌측: 첨부된 사진 (세로로 길게 확장) */}
            <div className="relative min-h-[320px] md:min-h-[380px] w-full overflow-hidden rounded-[20px] bg-slate-950 shadow-md">
              <CommunityDetailHeroImage
                postId={course.postId}
                courseId={course.courseId}
                fallbackImage={course.image}
                alt="작성자 첨부 사진"
                className="h-full w-full object-cover"
              />
            </div>

            {/* 우측: 작성자 본문 내용 (좌측 사진과 상하 라인 일치) */}
            <div className="rounded-[24px] bg-surface-soft p-7 text-base font-medium leading-7 text-ink flex flex-col justify-start h-full min-h-[320px] md:min-h-[380px]">
              <p className="whitespace-pre-line leading-relaxed text-ink">
                {course.note || course.description || "작성자가 남긴 후기가 없습니다."}
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default async function CommunityCourseDetailPage({ params }) {
  const t = await getTranslations("community");
  const locale = await getLocale();
  const { postId } = await params;
  const course = await fetchPublicCourseDetailServer(postId);

  if (!course) {
    notFound();
  }

  const travelerText = t.has("traveler") ? t("traveler") : "여행자";
  const breadcrumbHomeText = t.has("breadcrumbHome") ? t("breadcrumbHome") : "홈";
  const breadcrumbCommunityText = t.has("breadcrumbCommunity") ? t("breadcrumbCommunity") : "커뮤니티";
  const listText = t.has("list") ? t("list") : "목록";
  const viewAllCoursesText = t.has("viewAllCourses") ? t("viewAllCourses") : "코스 목록 전체보기 →";

  return (
    <main className="bg-white">
      <section className="bg-surface-soft px-10 sm:px-14 py-8 lg:px-52 xl:px-60 2xl:px-72">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-xs font-bold text-ink-muted">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-brand">
              {breadcrumbHomeText}
            </Link>
            <span>›</span>
            <Link href="/community" className="hover:text-brand">
              {breadcrumbCommunityText}
            </Link>
            <span>›</span>
            <span className="text-ink">{course.title}</span>
          </div>
          <Link
            href="/community"
            className="text-xs font-black text-brand transition hover:text-brand-dark"
          >
            {listText}
          </Link>
        </div>
      </section>

      <section className="px-10 sm:px-14 pb-16 pt-[40px] lg:px-52 xl:px-60 2xl:px-72">
        <div className="mx-auto max-w-7xl grid gap-12 lg:grid-cols-[0.78fr_1.32fr] lg:items-center">
          <div className="relative flex aspect-[4/3] lg:aspect-[3/4] max-h-[380px] w-full flex-col justify-between overflow-hidden rounded-[28px] bg-slate-950 shadow-[0_14px_36px_rgba(30,15,70,0.25)]">
            <div className="absolute inset-0">
              <CommunityDetailHeroImage
                postId={course.postId || postId}
                courseId={course.courseId}
                fallbackImage={course.image}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />

            <div className="relative z-10 p-6 pointer-events-none">
              <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-black text-white backdrop-blur-xs border border-white/10">
                {course.label || "THE HYUNDAI SEOUL"}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3.5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-xs font-black text-white shadow-xs ring-2 ring-brand/10">
                {(course.name || travelerText).slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-ink">
                    {course.name || travelerText}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-black text-brand">
                    {course.country || "KR"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs font-medium text-ink-muted">
                  DITTO {travelerText} · {course.createdAt ? new Date(course.createdAt).toLocaleDateString(locale) : "2026.03.02"}
                </p>
              </div>
            </div>
            <h2 className="mt-6 text-[38px] font-black leading-tight text-ink">
              {course.title}
            </h2>
            <CommunityDetailActions course={course} />
          </div>
        </div>
      </section>

      <section className="px-10 sm:px-14 py-8 lg:px-52 xl:px-60 2xl:px-72">
        <div className="mx-auto max-w-7xl grid gap-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
          <CommunityStopList stops={course.stops} courseId={course.courseId} />
          <CommunityCourseDetailMap stops={course.stops} />
        </div>
      </section>

      <AuthorNote course={course} t={t} locale={locale} />

      <section className="bg-surface-soft px-10 sm:px-14 pb-16 lg:px-52 xl:px-60 2xl:px-72">
        <div className="mx-auto max-w-7xl flex justify-center">
          <Link
            href="/community"
            className="rounded-full border border-brand bg-white px-8 py-3 text-sm font-black text-brand shadow-xs transition hover:bg-brand hover:text-white cursor-pointer"
          >
            {viewAllCoursesText}
          </Link>
        </div>
      </section>
    </main>
  );
}
