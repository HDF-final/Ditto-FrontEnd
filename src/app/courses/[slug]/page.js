import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import {
  fetchCourseDetailServer,
  fetchRawSystemCoursesServer,
} from "@/lib/api/courses.server";
import { recommendedCourses } from "@/lib/fixtures/recommended-courses";
import { CommunityCourseDetailMap } from "@/components/community/community-course-detail-map";
import { CommunityStopList } from "@/components/community/community-stop-list";
import { CourseDetailActions } from "./course-detail-actions";

export const dynamic = "force-dynamic";

const DEFAULT_COURSE_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=900&fit=crop";

function normalizeCourse(rawCourse, slug) {
  if (!rawCourse) return null;

  const courseId = rawCourse.courseId || rawCourse.id || slug;
  const title = rawCourse.name || rawCourse.title || "기본 추천 코스";
  const description =
    rawCourse.description ||
    "DITTO AI 보니가 엄선한 더현대 서울 대표 추천 코스입니다.";
  const note =
    rawCourse.note ||
    rawCourse.description ||
    "더현대 서울에서 가장 인기 있는 대표 스팟들을 초행자도 이동하기 편한 최적 실내 동선으로 연결한 추천 코스입니다.";

  const rawPlaces = Array.isArray(rawCourse.places)
    ? rawCourse.places
    : Array.isArray(rawCourse.stops)
      ? rawCourse.stops
      : [];

  const stops = rawPlaces.map((p, idx) => ({
    placeId: p.placeId,
    floor: p.floorCode || p.floor || `${idx + 1}F`,
    name: p.name || p.placeName || `스팟 #${idx + 1}`,
    description: p.description || p.desc || "더현대 서울 내 추천 방문 스팟",
    category: p.category,
    image: p.imageUrl || p.image || p.placeImg,
    navigationKey: p.navigationKey,
    x: p.xCoordinate,
    y: p.yCoordinate,
  }));

  const image =
    rawCourse.representativeImageUrl ||
    rawCourse.image ||
    DEFAULT_COURSE_IMAGE;

  const gradient =
    rawCourse.gradient || "from-[#2d1b8e] via-[#5c2ef5] to-[#8c57fa]";

  return {
    courseId,
    title,
    description,
    note,
    image,
    gradient,
    label: rawCourse.label || "THE HYUNDAI SEOUL",
    stops,
    createdAt: rawCourse.createdAt || "2026.03.02",
  };
}

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

  if (!course) {
    notFound();
  }

  return (
    <main className="min-w-0 overflow-x-hidden bg-white">
      {/* 1. 상단 브레드크럼 섹션 */}
      <section className="bg-surface-soft px-4 py-4 sm:px-14 sm:py-6 lg:px-52 lg:py-8 xl:px-60 2xl:px-72">
        <div className="mx-auto flex max-w-7xl min-w-0 flex-wrap items-center justify-between gap-3 text-xs font-bold text-ink-muted">
          <div className="flex min-w-0 items-center gap-2">
            <Link href="/" className="shrink-0 transition hover:text-brand">
              홈
            </Link>
            <span className="shrink-0">›</span>
            <Link href="/courses" className="shrink-0 transition hover:text-brand">
              기본 코스 추천
            </Link>
            <span className="shrink-0">›</span>
            <span className="min-w-0 truncate text-ink">{course.title}</span>
          </div>
          <Link
            href="/courses"
            className="text-xs font-black text-brand transition hover:text-brand-dark"
          >
            목록
          </Link>
        </div>
      </section>

      {/* 2. 히어로 정보 섹션 (좌측 대표 이미지 + 우측 Boni 작성자 정보 및 타이틀) */}
      <section className="px-4 pb-8 pt-5 sm:px-14 sm:pb-10 sm:pt-6 lg:px-52 lg:pb-16 lg:pt-[40px] xl:px-60 2xl:px-72">
        <div className="mx-auto grid max-w-7xl min-w-0 gap-6 sm:gap-8 lg:grid-cols-[0.78fr_1.32fr] lg:items-center lg:gap-12">
          {/* 좌측: 코스 대표 비주얼 카드 */}
          <div className="relative flex aspect-[4/3] max-h-[380px] w-full flex-col justify-between overflow-hidden rounded-[28px] bg-slate-950 shadow-[0_14px_36px_rgba(30,15,70,0.25)] lg:aspect-[3/4]">
            <div className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={course.image}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 via-black/30 to-transparent" />

            <div className="pointer-events-none relative z-10 p-6">
              <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-black text-white backdrop-blur-xs">
                {course.label}
              </span>
            </div>

            <div className="relative z-10 p-6">
              <span className="inline-block rounded-lg bg-brand px-2.5 py-1 text-[11px] font-black text-white">
                DITTO PICKS
              </span>
              <p className="mt-2 line-clamp-2 text-lg font-black text-white drop-shadow-md sm:text-xl">
                {course.title}
              </p>
            </div>
          </div>

          {/* 우측: Boni 프로필 및 코스 안내 */}
          <div>
            <div className="flex items-center gap-3.5">
              <div className="flex size-13 shrink-0 items-center justify-center overflow-hidden rounded-full bg-violet-50 shadow-sm ring-2 ring-brand/20">
                <Image
                  src="/assets/ai-course/boni-profile.png"
                  alt="Boni"
                  width={52}
                  height={52}
                  className="size-13 object-cover"
                  unoptimized
                />
              </div>
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

            <h2 className="mt-5 break-keep text-[22px] font-black leading-tight text-ink sm:mt-6 sm:text-[26px] lg:text-[38px]">
              {course.title}
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">
              {course.description}
            </p>

            {/* 액션 버튼: 코스 저장 & 공유하기만 노출 */}
            <CourseDetailActions course={course} />
          </div>
        </div>
      </section>

      {/* 3. 코스 장소 목록 & 3D 실내 맵 동선 */}
      <section className="px-4 py-5 sm:px-14 sm:py-6 lg:px-52 lg:py-8 xl:px-60 2xl:px-72">
        <div className="mx-auto grid max-w-7xl min-w-0 gap-4 sm:gap-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
          <CommunityStopList stops={course.stops} courseId={course.courseId} />
          <CommunityCourseDetailMap stops={course.stops} />
        </div>
      </section>

      {/* 4. BONI NOTE 섹션 (보니가 추천하는 이유) */}
      <section className="bg-surface-soft px-4 py-8 sm:px-14 lg:px-52 lg:py-16 xl:px-60 2xl:px-72">
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
              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-violet-50 shadow-xs ring-2 ring-brand/20">
                <Image
                  src="/assets/ai-course/boni-profile.png"
                  alt="Boni"
                  width={48}
                  height={48}
                  className="size-12 object-cover"
                  unoptimized
                />
              </div>
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

            <div className="mt-6 grid items-stretch gap-7 lg:grid-cols-[0.86fr_1fr]">
              <div className="relative min-h-[220px] w-full overflow-hidden rounded-[20px] bg-slate-950 shadow-md sm:min-h-[320px] md:min-h-[380px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={course.image}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex h-full min-h-[200px] flex-col justify-start rounded-[20px] bg-surface-soft p-5 text-sm font-medium leading-7 text-ink sm:min-h-[320px] sm:rounded-[24px] sm:p-7 sm:text-base md:min-h-[380px]">
                <p className="whitespace-pre-line leading-relaxed text-ink">
                  {course.note}
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* 5. 하단 전체 목록 버튼 */}
      <section className="bg-surface-soft px-4 pb-10 sm:px-14 lg:px-52 lg:pb-16 xl:px-60 2xl:px-72">
        <div className="mx-auto flex max-w-7xl justify-center">
          <Link
            href="/courses"
            className="cursor-pointer rounded-full border border-brand bg-white px-8 py-3 text-sm font-black text-brand shadow-xs transition hover:bg-brand hover:text-white"
          >
            코스 목록 전체보기 →
          </Link>
        </div>
      </section>
    </main>
  );
}
