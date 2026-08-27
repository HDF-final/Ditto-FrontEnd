import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { fetchPublicCourseDetailServer } from "@/lib/api/community.server";
import { getPersonaById } from "@/lib/fixtures/personas";
import { getCourseStopMeta } from "@/lib/utils/course-detail";
import { CourseDetailStats } from "@/components/community/course-detail-stats";
import { CommunityDetailActions } from "./community-detail-actions";
import { CommunityDetailHeroImage } from "./community-detail-hero-image";
import {
  CommunityAuthorCountry,
  CommunityAuthorDescription,
  CommunityAuthorName,
  CommunityOtherCoursesLink,
} from "./community-author-meta";
import { CommunityCourseDetailMap } from "@/components/community/community-course-detail-map";
import { CommunityStopList } from "@/components/community/community-stop-list";
import { HomeSnapScroller } from "@/components/home/home-snap-scroller";
import { SiteFooter } from "@/components/layout/site-footer";

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

function AuthorAvatar({ persona, name }) {
  return (
    <div
      className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full shadow-xs ring-2 ring-black/5"
      style={{
        backgroundColor: persona.theme?.bgColor || "#fff1e6",
      }}
    >
      <Image
        src={persona.imageSrc}
        alt={name}
        width={40}
        height={40}
        className="size-10 object-contain"
        unoptimized
      />
    </div>
  );
}

function AuthorNote({ course, t, locale, authorPersona, travelerText }) {
  const authorRecordText =
    t && t.has("authorRecord") ? t("authorRecord") : "작성자가 남긴 기록";
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
  const noteText =
    course.note || course.description || "작성자가 남긴 후기가 없습니다.";

  return (
    <section className="bg-surface-soft px-3 py-8 sm:px-14 lg:px-52 lg:py-5 xl:px-60 2xl:px-72">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black text-brand">COURSE NOTE</p>
            <h2 className="mt-3 text-[24px] font-black text-ink lg:text-[32px]">
              {authorRecordText}
            </h2>
            <p className="mt-2 text-sm font-medium text-ink-muted">
              <CommunityAuthorDescription
                name={course.name}
                travelerText={travelerText}
                postId={course.postId}
                courseId={course.courseId}
              />
            </p>
          </div>
          <CommunityOtherCoursesLink
            postId={course.postId}
            authorId={course.authorId}
            authorName={course.name}
            courseId={course.courseId}
            className="text-sm font-black text-brand transition hover:text-brand-dark"
          >
            {otherCoursesText}
          </CommunityOtherCoursesLink>
        </div>

        <article className="mt-6 min-w-0 rounded-[24px] bg-white p-4 shadow-[0_8px_20px_rgba(43,28,89,0.06)] sm:mt-8 sm:rounded-[28px] sm:p-5 lg:mt-4 lg:p-5">
          <div className="flex items-center gap-4 border-b border-line/60 pb-6">
            <AuthorAvatar
              persona={authorPersona}
              name={course.name || travelerText}
            />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-black text-ink">
                  <CommunityAuthorName
                    name={course.name}
                    travelerText={travelerText}
                    postId={course.postId}
                    courseId={course.courseId}
                  />
                </p>
                <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-black text-brand">
                  <CommunityAuthorCountry
                    country={course.country}
                    postId={course.postId}
                    courseId={course.courseId}
                  />
                </span>
              </div>
              <p className="mt-0.5 text-xs font-medium text-ink-muted">
                {authoredOnText}
              </p>
            </div>
          </div>

          <div className="relative mt-6 flex items-start gap-4 rounded-[20px] bg-surface-soft p-4 text-base font-semibold leading-8 text-ink sm:mt-7 sm:gap-5 sm:rounded-[24px] sm:p-7 sm:text-lg">
            {/* 작성자의 한마디를 인용처럼 — 코스 상세 BONI NOTE와 동일한 스타일 */}
            <svg
              aria-hidden="true"
              viewBox="0 0 40 40"
              fill="currentColor"
              className="mt-1 size-8 shrink-0 text-brand sm:size-9"
              style={{ opacity: 0.3 }}
            >
              <path d="M17 8c-5.5 0-10 4.5-10 10v14h13V18h-6c0-3.3 1.7-5 5-5V8Zm16 0c-5.5 0-10 4.5-10 10v14h13V18h-6c0-3.3 1.7-5 5-5V8Z" />
            </svg>
            <p className="relative min-w-0 whitespace-pre-line break-keep leading-relaxed text-ink">
              {noteText}
            </p>
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
  const stopMeta = getCourseStopMeta(course.stops);
  const statsLabels = {
    spotLabel: t.has("spotStat") ? t("spotStat") : "스팟",
    floorLabelTitle: t.has("floorStat") ? t("floorStat") : "층",
  };

  const authorPersona = getPersonaById(
    course.persona || course.shoppingType || course.personaId || "sohwak",
    locale,
  );

  const authorBlock = (
    <div className="flex items-center gap-3.5">
      <AuthorAvatar
        persona={authorPersona}
        name={course.name || travelerText}
      />
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className="text-base font-black text-ink">
            <CommunityAuthorName
              name={course.name}
              travelerText={travelerText}
              postId={course.postId}
              courseId={course.courseId}
            />
          </span>
          <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-black text-brand">
            <CommunityAuthorCountry
              country={course.country}
              postId={course.postId}
              courseId={course.courseId}
            />
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
  );

  const venueBadge = (
    <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-black text-white backdrop-blur-xs">
      {course.label || "THE HYUNDAI SEOUL"}
    </span>
  );

  return (
    <HomeSnapScroller>
      {/* ── 덩어리 1: 브레드크럼(위 고정) + 히어로(남은 공간 중앙) ── */}
      <div className="home-snap-panel min-w-0 overflow-x-hidden bg-white lg:flex lg:flex-col">
      <section className="bg-surface-soft px-3 py-4 sm:px-14 sm:py-6 lg:px-52 lg:py-5 xl:px-60 2xl:px-72">
        <div className="mx-auto flex max-w-7xl min-w-0 flex-wrap items-center justify-between gap-3 text-xs font-bold text-ink-muted">
          <div className="flex min-w-0 items-center gap-2">
            <Link href="/" className="shrink-0 hover:text-brand">
              {breadcrumbHomeText}
            </Link>
            <span className="shrink-0">›</span>
            <Link href="/community" className="shrink-0 hover:text-brand">
              {breadcrumbCommunityText}
            </Link>
            <span className="shrink-0">›</span>
            <span className="min-w-0 truncate text-ink">{course.title}</span>
          </div>
          <Link
            href="/community"
            className="text-xs font-black text-brand transition hover:text-brand-dark"
          >
            {listText}
          </Link>
        </div>
      </section>

      <div className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:justify-center">
      <section className="px-3 pb-8 pt-5 sm:px-14 sm:pb-10 sm:pt-6 lg:px-52 lg:pb-8 lg:pt-8 xl:px-60 2xl:px-72">
        <div className="mx-auto max-w-7xl min-w-0 lg:hidden">
          <div className="relative flex aspect-[4/3] w-full flex-col justify-between overflow-hidden rounded-[24px] bg-slate-950 shadow-[0_12px_30px_rgba(30,15,70,0.22)]">
            <div className="absolute inset-0">
              <CommunityDetailHeroImage
                images={course.images}
                fallbackImage={course.image}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 via-black/30 to-transparent" />
            <div className="relative z-10 p-5">{venueBadge}</div>
            <div className="relative z-10 p-5">
              <h1 className="break-keep text-[22px] font-black leading-tight text-white drop-shadow-md">
                {course.title}
              </h1>
            </div>
          </div>

          <div className="mt-4">
            {authorBlock}
            <CourseDetailStats
              spotCount={stopMeta.spotCount}
              floorLabel={stopMeta.floorLabel}
              {...statsLabels}
            />
            <CommunityDetailActions course={course} />
          </div>
        </div>

        <div className="mx-auto hidden max-w-7xl min-w-0 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-8">
          <div className="relative min-h-[280px] w-full overflow-hidden rounded-[28px] bg-slate-950 shadow-[0_14px_36px_rgba(30,15,70,0.25)]">
            <div className="absolute inset-0">
              <CommunityDetailHeroImage
                images={course.images}
                fallbackImage={course.image}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent" />
            <div className="relative z-10 p-6">{venueBadge}</div>
          </div>

          <div className="flex min-w-0 flex-col justify-center">
            {authorBlock}
            <h2 className="mt-5 break-keep text-[22px] font-black leading-tight text-ink sm:mt-6 sm:text-[26px] lg:text-[38px]">
              {course.title}
            </h2>
            <CourseDetailStats
              spotCount={stopMeta.spotCount}
              floorLabel={stopMeta.floorLabel}
              {...statsLabels}
            />
            <CommunityDetailActions course={course} />
          </div>
        </div>
      </section>
      </div>

      </div>

      {/* ── 덩어리 2 (중간, 크게): 코스 장소 목록 & 3D 실내 맵 동선 ── */}
      <div className="home-snap-panel min-w-0 overflow-x-hidden bg-white lg:flex lg:flex-col lg:justify-center">
      <section className="px-3 py-5 sm:px-14 sm:py-6 lg:px-52 lg:py-8 xl:px-60 2xl:px-72 lg:w-full">
        <div className="mx-auto grid max-w-7xl min-w-0 gap-4 sm:gap-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
          <CommunityStopList stops={course.stops} courseId={course.courseId} />
          <CommunityCourseDetailMap stops={course.stops} />
        </div>
      </section>
      </div>

      {/* ── 덩어리 3: 작성자 노트 + 하단 버튼 + 푸터 (한 덩어리) ── */}
      <div className="home-snap-panel bg-surface-soft lg:flex lg:flex-col">
      <div className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:justify-center">
      <AuthorNote
        course={course}
        t={t}
        locale={locale}
        authorPersona={authorPersona}
        travelerText={travelerText}
      />

      <section className="bg-surface-soft px-3 pb-10 sm:px-14 lg:px-52 lg:pb-4 xl:px-60 2xl:px-72">
        <div className="mx-auto flex max-w-7xl justify-center">
          <Link
            href="/community"
            className="cursor-pointer rounded-full border border-brand bg-white px-8 py-3 text-sm font-black text-brand shadow-xs transition hover:bg-brand hover:text-white"
          >
            {viewAllCoursesText}
          </Link>
        </div>
      </section>
      </div>
      <SiteFooter embedded />
      </div>
    </HomeSnapScroller>
  );
}
