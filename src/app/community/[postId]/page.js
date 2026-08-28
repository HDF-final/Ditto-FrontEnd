import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { fetchPublicCourseDetailServer } from "@/lib/api/community.server";
import { getPersonaById } from "@/lib/fixtures/personas";
import { CommunityDetailActions } from "./community-detail-actions";
import { CommunityDetailHeroImage } from "./community-detail-hero-image";
import {
  CommunityAuthorCountry,
  CommunityAuthorName,
} from "./community-author-meta";
import { CommunityCourseDetailMap } from "@/components/community/community-course-detail-map";
import { CommunityStopList } from "@/components/community/community-stop-list";
import { HomeSnapScroller } from "@/components/home/home-snap-scroller";

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

function AuthorReasonCard({ course }) {
  const noteText =
    course.note || course.description || "작성자가 남긴 후기가 없습니다.";

  return (
    <div className="mt-4 sm:mt-5">
      <div
        data-home-snap-scroll-lock
        className="max-h-[132px] overflow-y-auto rounded-[14px] bg-brand-soft/50 px-4 py-3 overscroll-contain sm:max-h-[156px]"
      >
        <p className="inline-flex items-center rounded-full bg-white/85 px-3 py-1 text-sm font-black text-brand shadow-[0_6px_16px_rgba(92,46,245,0.12)] ring-1 ring-brand/10 sm:text-base">
          작성자가 남긴 이유
        </p>
        <div className="mt-2 flex items-start gap-3">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="mt-1 size-4 shrink-0 text-brand/45"
          >
            <path d="M9.6 5.6c-3.3.9-5.5 3.8-5.5 7.5v5.3h6.7v-6.7H7.5c.2-1.8 1.3-3 3.2-3.6L9.6 5.6Zm9.4 0c-3.3.9-5.5 3.8-5.5 7.5v5.3h6.7v-6.7h-3.3c.2-1.8 1.3-3 3.2-3.6L19 5.6Z" />
          </svg>
          <p className="min-w-0 whitespace-pre-line break-keep text-xs font-semibold leading-6 text-ink-muted sm:text-sm">
            {noteText}
          </p>
        </div>
      </div>
    </div>
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
      <section className="shrink-0 bg-surface-soft px-3 py-4 sm:px-14 sm:py-6 lg:px-52 lg:py-8 xl:px-60 2xl:px-72">
        <div className="mx-auto flex w-full max-w-7xl min-w-0 items-center justify-between gap-4">
          <nav className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden whitespace-nowrap text-xs font-bold text-ink-muted lg:text-sm">
            <Link href="/" className="shrink-0 hover:text-brand">
              {breadcrumbHomeText}
            </Link>
            <span className="shrink-0" aria-hidden="true">›</span>
            <Link href="/community" className="shrink-0 hover:text-brand">
              {breadcrumbCommunityText}
            </Link>
            <span className="shrink-0" aria-hidden="true">›</span>
            <span className="min-w-0 truncate text-ink">{course.title}</span>
          </nav>
          <Link
            href="/community"
            className="shrink-0 whitespace-nowrap text-xs font-black text-brand transition hover:text-brand-dark lg:text-sm"
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
            <AuthorReasonCard course={course} />
            <CommunityDetailActions course={course} />
          </div>
        </div>

        <div className="mx-auto hidden max-w-4xl min-w-0 lg:grid lg:grid-cols-[minmax(220px,0.88fr)_minmax(0,1.12fr)] lg:items-stretch lg:gap-6">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[28px] bg-slate-950 shadow-[0_14px_36px_rgba(30,15,70,0.25)]">
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
            <h2 className="mt-4 break-keep text-[22px] font-black leading-tight text-ink sm:text-[26px] lg:text-[30px]">
              {course.title}
            </h2>
            <AuthorReasonCard course={course} />
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
        <div className="mx-auto mt-8 flex max-w-7xl justify-center sm:mt-10">
          <Link
            href="/community"
            className="cursor-pointer rounded-full border border-brand bg-white px-8 py-3 text-sm font-black text-brand shadow-xs transition hover:bg-brand hover:text-white sm:px-10 sm:py-3.5 sm:text-base"
          >
            {viewAllCoursesText}
          </Link>
        </div>
      </section>
      </div>
    </HomeSnapScroller>
  );
}
