import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import {
  fetchCourseDetailServer,
  fetchRawSystemCoursesServer,
} from "@/lib/api/courses.server";
import { normalizeCourse } from "@/lib/courses/normalize-course";
import { recommendedCourses } from "@/lib/fixtures/recommended-courses";
import { getCourseStopMeta } from "@/lib/utils/course-detail";
import { CourseDetailStats } from "@/components/community/course-detail-stats";
import { CommunityCourseDetailMap } from "@/components/community/community-course-detail-map";
import { CommunityStopList } from "@/components/community/community-stop-list";
import { BoniAvatar } from "@/components/courses/boni-avatar";
import { HomeSnapScroller } from "@/components/home/home-snap-scroller";
import { SiteFooter } from "@/components/layout/site-footer";
import { CourseDetailActions } from "./course-detail-actions";

export const dynamic = "force-dynamic";

async function getCourseData(slug) {
  // 1. 숫자 ID일 경우 백엔드 상세 API 우선 조회
  const numericId = parseInt(slug, 10);
  if (!Number.isNaN(numericId)) {
    const dbCourse = await fetchCourseDetailServer(numericId).catch(() => null);
    if (dbCourse) {
      return normalizeCourse(dbCourse, slug);
    }
  }

  // 2. 전체 시스템 코스 목록에서 일치하는 코스 탐색
  const rawCourses = await fetchRawSystemCoursesServer({ size: 30 }).catch(
    () => [],
  );
  const foundRaw = rawCourses.find(
    (c) =>
      String(c.courseId) === String(slug) ||
      c.slug === slug ||
      (c.name && c.name.toLowerCase() === decodeURIComponent(slug).toLowerCase()),
  );
  if (foundRaw) {
    return normalizeCourse(foundRaw, slug);
  }

  // 3. 픽스처 추천 코스에서 탐색
  const foundFixture = recommendedCourses.find(
    (c) =>
      c.slug === slug ||
      String(c.rank) === String(slug) ||
      (c.title && c.title.toLowerCase() === decodeURIComponent(slug).toLowerCase()),
  );
  if (foundFixture) {
    return normalizeCourse(foundFixture, slug);
  }

  return null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const course = await getCourseData(slug);

  if (!course) {
    return { title: "기본 코스 추천 | DITTO" };
  }

  return { title: `${course.title} | DITTO` };
}

export default async function RecommendedCourseDetailPage({ params }) {
  const { slug } = await params;
  const course = await getCourseData(slug);
  const t = await getTranslations("courses");

  if (!course) {
    notFound();
  }

  const stopMeta = getCourseStopMeta(course.stops);
  const statsLabels = {
    spotLabel: t.has("spotStat") ? t("spotStat") : "스팟",
    floorLabelTitle: t.has("floorStat") ? t("floorStat") : "층",
  };

  const boniProfile = (
    <div className="flex items-center gap-3.5">
      <BoniAvatar />
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-ink">Boni</span>
          <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-black text-brand">
            AI MATE
          </span>
        </div>
        <p className="mt-0.5 text-xs font-medium text-ink-muted">
          DITTO AI Shopping Mate · 추천 코스
        </p>
      </div>
    </div>
  );

  return (
    <HomeSnapScroller>
      {/* ── 덩어리 1: 브레드크럼(위 고정) + 히어로(남은 공간 중앙) ── */}
      <div className="home-snap-panel min-w-0 overflow-x-hidden bg-white lg:flex lg:flex-col">
      {/* 1. 상단 브레드크럼 섹션 — 헤더 바로 아래 붙임 */}
      <section className="shrink-0 bg-surface-soft px-3 py-4 sm:px-14 sm:py-6 lg:px-52 lg:py-8 xl:px-60 2xl:px-72">
        <div className="mx-auto flex w-full max-w-7xl min-w-0 items-center justify-between gap-4">
          <nav className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden whitespace-nowrap text-xs font-bold text-ink-muted lg:text-sm">
            <Link href="/" className="shrink-0 transition hover:text-brand">
              홈
            </Link>
            <span className="shrink-0" aria-hidden="true">›</span>
            <Link href="/courses" className="shrink-0 transition hover:text-brand">
              기본 코스 추천
            </Link>
            <span className="shrink-0" aria-hidden="true">›</span>
            <span className="min-w-0 truncate text-ink">{course.title}</span>
          </nav>
          <Link
            href="/courses"
            className="shrink-0 whitespace-nowrap text-xs font-black text-brand transition hover:text-brand-dark lg:text-sm"
          >
            목록
          </Link>
        </div>
      </section>

      <div className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:justify-center">
      {/* 2. 히어로: 모바일 / 웹 분리 */}
      <section className="px-3 pb-8 pt-5 sm:px-14 sm:pb-10 sm:pt-6 lg:px-52 lg:pb-8 lg:pt-8 xl:px-60 2xl:px-72">
        <div className="mx-auto max-w-7xl min-w-0 lg:hidden">
          <div className="relative flex aspect-[4/3] w-full flex-col justify-between overflow-hidden rounded-[24px] bg-slate-950 shadow-[0_12px_30px_rgba(30,15,70,0.22)]">
            <div className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={course.image}
                alt={course.title}
                className="h-full w-full object-cover object-top"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 via-black/30 to-transparent" />

            <div className="relative z-10 flex justify-end p-5">
              <span className="inline-block rounded-lg bg-brand px-2.5 py-1 text-[11px] font-black text-white">
                DITTO PICKS
              </span>
            </div>

            <div className="relative z-10 p-5">
              <h1 className="break-keep text-[22px] font-black leading-tight text-white drop-shadow-md">
                {course.title}
              </h1>
            </div>
          </div>

          <div className="mt-4">
            {boniProfile}
            <CourseDetailStats
              spotCount={stopMeta.spotCount}
              floorLabel={stopMeta.floorLabel}
              {...statsLabels}
            />
            <CourseDetailActions course={course} />
          </div>
        </div>

        <div className="mx-auto hidden max-w-7xl min-w-0 lg:grid lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.1fr)] lg:items-stretch lg:gap-8">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[28px] bg-slate-950 shadow-[0_14px_36px_rgba(30,15,70,0.25)]">
            <div className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={course.image}
                alt={course.title}
                className="h-full w-full object-cover object-top"
              />
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent" />

            <div className="relative z-10 flex items-start justify-end p-6">
              <span className="inline-block rounded-lg bg-brand px-2.5 py-1 text-[11px] font-black text-white">
                DITTO PICKS
              </span>
            </div>
          </div>

          <div className="flex min-w-0 flex-col lg:justify-center">
            {boniProfile}

            <h2 className="mt-5 break-keep text-[22px] font-black leading-tight text-ink sm:mt-6 sm:text-[26px] lg:text-[38px]">
              {course.title}
            </h2>

            <CourseDetailStats
              spotCount={stopMeta.spotCount}
              floorLabel={stopMeta.floorLabel}
              {...statsLabels}
            />

            <CourseDetailActions course={course} />
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

      {/* ── 덩어리 3: BONI NOTE + 하단 버튼 + 푸터 (한 덩어리) ── */}
      <div className="home-snap-panel bg-surface-soft lg:flex lg:flex-col">
      <div className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:justify-center">
      {/* 4. BONI NOTE 섹션 (보니가 추천하는 이유) */}
      <section className="bg-surface-soft px-3 py-8 sm:px-14 lg:px-52 lg:py-10 xl:px-60 2xl:px-72">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black text-brand">BONI NOTE</p>
              <h2 className="mt-3 text-[24px] font-black text-ink lg:text-[32px]">
                보니가 추천하는 이유
              </h2>
              <p className="mt-2 text-sm font-medium text-ink-muted">
                이 코스를 기획한 Boni가 직접 추천하는 가이드예요.
              </p>
            </div>
            <Link
              href="/courses"
              className="text-sm font-black text-brand transition hover:text-brand-dark"
            >
              다른 추천 코스 둘러보기 →
            </Link>
          </div>

          <article className="mt-6 min-w-0 rounded-[24px] bg-white p-4 shadow-[0_8px_20px_rgba(43,28,89,0.06)] sm:mt-8 sm:rounded-[28px] sm:p-5 lg:p-8">
            <div className="flex items-center gap-4 border-b border-line/60 pb-6">
              <BoniAvatar size="note" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-black text-ink">Boni</p>
                  <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-black text-brand">
                    AI MATE
                  </span>
                </div>
                <p className="mt-0.5 text-xs font-medium text-ink-muted">
                  초행자 · 핫플레이스 · 최적 실내 동선 기준
                </p>
              </div>
            </div>

            <div className="relative mt-6 flex items-start gap-4 rounded-[20px] bg-surface-soft p-5 text-sm font-medium leading-7 text-ink sm:mt-7 sm:gap-5 sm:rounded-[24px] sm:p-7 sm:text-base">
              {/* 보니의 한마디를 인용처럼 — 짧은 노트도 비어 보이지 않게 */}
              <svg
                aria-hidden="true"
                viewBox="0 0 40 40"
                fill="currentColor"
                className="mt-0.5 size-8 shrink-0 text-brand sm:size-9"
                style={{ opacity: 0.3 }}
              >
                <path d="M17 8c-5.5 0-10 4.5-10 10v14h13V18h-6c0-3.3 1.7-5 5-5V8Zm16 0c-5.5 0-10 4.5-10 10v14h13V18h-6c0-3.3 1.7-5 5-5V8Z" />
              </svg>
              <p className="relative min-w-0 whitespace-pre-line leading-relaxed text-ink">
                {course.note}
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* 5. 하단 전체 목록 버튼 */}
      <section className="bg-surface-soft px-3 pb-10 sm:px-14 lg:px-52 lg:pb-10 xl:px-60 2xl:px-72">
        <div className="mx-auto flex max-w-7xl justify-center">
          <Link
            href="/courses"
            className="cursor-pointer rounded-full border border-brand bg-white px-8 py-3 text-sm font-black text-brand shadow-xs transition hover:bg-brand hover:text-white"
          >
            코스 목록 전체보기 →
          </Link>
        </div>
      </section>
      </div>
      <SiteFooter embedded />
      </div>
    </HomeSnapScroller>
  );
}
