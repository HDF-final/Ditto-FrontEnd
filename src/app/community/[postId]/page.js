import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { fetchPublicCourseDetailServer } from "@/lib/api/community.server";
import { getPersonaById } from "@/lib/fixtures/personas";
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
    return {
      title: t.has("communityCourse") ? t("communityCourse") : "커뮤니티 코스",
    };
  }

  return { title: course.title };
}

function AuthorNote({ course, t, locale }) {
  const travelerText = t && t.has("traveler") ? t("traveler") : "여행자";
  const authorRecordText =
    t && t.has("authorRecord") ? t("authorRecord") : "작성자가 남긴 기록";
  const authorRecordDescText =
    t && t.has("authorRecordDescription")
      ? t("authorRecordDescription", { name: course.name || travelerText })
      : `이 코스를 만든 ${course.name || travelerText}님이 직접 쓴 글이에요.`;
  const otherCoursesText =
    t && t.has("otherCourses")
      ? t("otherCourses")
      : "다른 커뮤니티 코스 둘러보기 →";
  const authoredOnText =
    t && t.has("authoredOn")
      ? t("authoredOn", {
          date: course.createdAt
            ? new Date(course.createdAt).toLocaleDateString(locale)
            : "2026.03.02",
        })
      : `${course.createdAt ? new Date(course.createdAt).toLocaleDateString(locale) : "2026.03.02"} 작성`;

  const authorPersona = getPersonaById(
    course.persona || course.shoppingType || course.personaId || "sohwak",
    locale,
  );

  return (
    <section className="bg-surface-soft px-5 py-8 sm:px-14 lg:px-52 lg:py-16 xl:px-60 2xl:px-72">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black text-brand">COURSE NOTE</p>
            <h2 className="mt-3 text-[24px] font-black text-ink lg:text-[32px]">
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

        <article className="mt-8 rounded-[28px] bg-white p-5 shadow-[0_8px_20px_rgba(43,28,89,0.06)] lg:p-8">
          <div className="flex items-center gap-4 border-b border-line/60 pb-6">
            <div
              className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full shadow-xs ring-2 ring-black/5"
              style={{
                backgroundColor: authorPersona.theme?.bgColor || "#fff1e6",
              }}
            >
              <Image
                src={authorPersona.imageSrc}
                alt={course.name || travelerText}
                width={40}
                height={40}
                className="size-10 object-contain"
                unoptimized
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-black text-ink">
                  {course.name || travelerText}
                </p>
                <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-black text-brand">
                  {course.country || "KR"}
                </span>
              </div>
              <p className="mt-0.5 text-xs font-medium text-ink-muted">
                {authoredOnText}
              </p>
            </div>
          </div>

          <div className="mt-6 grid items-stretch gap-7 lg:grid-cols-[0.86fr_1fr]">
            <div className="relative min-h-[320px] w-full overflow-hidden rounded-[20px] bg-slate-950 shadow-md md:min-h-[380px]">
              <CommunityDetailHeroImage
                postId={course.postId}
                courseId={course.courseId}
                fallbackImage={course.image}
                alt="작성자 첨부 사진"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex h-full min-h-[320px] flex-col justify-start rounded-[24px] bg-surface-soft p-7 text-base font-medium leading-7 text-ink md:min-h-[380px]">
              <p className="whitespace-pre-line leading-relaxed text-ink">
                {course.note ||
                  course.description ||
                  "작성자가 남긴 후기가 없습니다."}
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
  const breadcrumbCommunityText = t.has("breadcrumbCommunity")
    ? t("breadcrumbCommunity")
    : "커뮤니티";
  const listText = t.has("list") ? t("list") : "목록";
  const viewAllCoursesText = t.has("viewAllCourses")
    ? t("viewAllCourses")
    : "코스 목록 전체보기 →";

  const authorPersona = getPersonaById(
    course.persona || course.shoppingType || course.personaId || "sohwak",
    locale,
  );

  return (
    <main className="bg-white">
      <section className="bg-surface-soft px-5 py-6 sm:px-14 lg:px-52 lg:py-8 xl:px-60 2xl:px-72">
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

      <section className="px-5 pb-10 pt-6 sm:px-14 lg:px-52 lg:pb-16 lg:pt-[40px] xl:px-60 2xl:px-72">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.78fr_1.32fr] lg:items-center lg:gap-12">
          <div className="relative flex aspect-[4/3] max-h-[380px] w-full flex-col justify-between overflow-hidden rounded-[28px] bg-slate-950 shadow-[0_14px_36px_rgba(30,15,70,0.25)] lg:aspect-[3/4]">
            <div className="absolute inset-0">
              <CommunityDetailHeroImage
                postId={course.postId || postId}
                courseId={course.courseId}
                fallbackImage={course.image}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 via-black/30 to-transparent" />

            <div className="pointer-events-none relative z-10 p-6">
              <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-black text-white backdrop-blur-xs">
                {course.label || "THE HYUNDAI SEOUL"}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3.5">
              <div
                className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full shadow-xs ring-2 ring-black/5"
                style={{
                  backgroundColor: authorPersona.theme?.bgColor || "#fff1e6",
                }}
              >
                <Image
                  src={authorPersona.imageSrc}
                  alt={course.name || travelerText}
                  width={40}
                  height={40}
                  className="size-10 object-contain"
                  unoptimized
                />
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
                  DITTO {travelerText} ·{" "}
                  {course.createdAt
                    ? new Date(course.createdAt).toLocaleDateString(locale)
                    : "2026.03.02"}
                </p>
              </div>
            </div>
            <h2 className="mt-6 text-[26px] font-black leading-tight text-ink lg:text-[38px]">
              {course.title}
            </h2>
            <CommunityDetailActions course={course} />
          </div>
        </div>
      </section>

      <section className="px-5 py-6 sm:px-14 lg:px-52 lg:py-8 xl:px-60 2xl:px-72">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
          <CommunityStopList stops={course.stops} courseId={course.courseId} />
          <CommunityCourseDetailMap stops={course.stops} />
        </div>
      </section>

      <AuthorNote course={course} t={t} locale={locale} />

      <section className="bg-surface-soft px-5 pb-10 sm:px-14 lg:px-52 lg:pb-16 xl:px-60 2xl:px-72">
        <div className="mx-auto flex max-w-7xl justify-center">
          <Link
            href="/community"
            className="cursor-pointer rounded-full border border-brand bg-white px-8 py-3 text-sm font-black text-brand shadow-xs transition hover:bg-brand hover:text-white"
          >
            {viewAllCoursesText}
          </Link>
        </div>
      </section>
    </main>
  );
}
