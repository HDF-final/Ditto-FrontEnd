import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { fetchPublicCourseDetailServer } from "@/lib/api/community.server";
import { CommunityDetailActions } from "./community-detail-actions";
import { CommunityDetailHeroImage } from "./community-detail-hero-image";
import { CommunityCourseDetailMap } from "@/components/community/community-course-detail-map";

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

const defaultReviewCards = [
  {
    name: "Yuki_T",
    country: "JAPAN",
    text: "친구가 처음 서울 왔을 때 이 순서 그대로 돌았어요. 사진 순서대로 따라가니까 길 찾느라 헤맬 일이 없더라고요.",
    tag: "#1F워터폴가든 #5F사운즈포레스트",
    likes: 42,
    replies: 3,
  },
  {
    name: "Chen_Li",
    country: "CHINA",
    text: "5층 정원에서 쉬는 구간이 있어서 좋았어요. 다만 주말 오후엔 사람이 많으니 오전에 가는 걸 추천해요.",
    tag: "#5F사운즈포레스트",
    likes: 31,
    replies: 1,
  },
  {
    name: "Emma_R",
    country: "USA",
    text: "B2 편집숍이 생각보다 볼 게 많아서 시간을 더 잡았어요. 2시간보다 3시간 정도가 여유로울 것 같아요.",
    tag: "#B2크리에이티브그라운드",
    likes: 28,
    replies: 2,
  },
];

function ActionButton({ children, variant = "primary" }) {
  const className =
    variant === "outline"
      ? "border border-line bg-white text-brand"
      : "bg-brand text-white";

  return (
    <button
      type="button"
      className={`inline-flex h-12 min-w-[142px] items-center justify-center rounded-full px-8 text-sm font-black transition hover:shadow-control ${className}`}
    >
      {children}
    </button>
  );
}

function GradientBlock({ className = "", children, gradient }) {
  return (
    <div
      className={`bg-linear-to-br ${gradient} ${className}`}
    >
      {children}
    </div>
  );
}

function StopList({ stops = [], courseId, t }) {
  return (
    <section className="flex flex-col justify-between rounded-[28px] bg-surface-soft p-6 lg:p-7">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-ink">
            {t && t.has("coursePlaces") ? t("coursePlaces") : "코스 장소"}
          </h2>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-ink-muted shadow-xs">
            총 {stops.length}개 스팟
          </span>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {stops.map((stop, index) => (
            <div
              key={`stop-${stop.placeId || stop.name || index}-${index}`}
              className="flex items-center gap-4 rounded-[16px] bg-white px-4 py-3 shadow-xs"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-ink">
                  {stop.floor ? `${stop.floor} ` : ""}{stop.name}
                </p>
                {stop.description ? (
                  <p className="mt-1 text-xs font-medium text-ink-muted line-clamp-1">
                    {stop.description}
                  </p>
                ) : null}
              </div>
              <Link
                href={courseId ? `/ai-course?courseId=${courseId}` : "/ai-course"}
                className="text-sm font-black text-brand transition hover:text-brand-dark"
              >
                {t && t.has("view") ? t("view") : "보기"}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
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

        <article className="mt-8 rounded-[28px] bg-white shadow-[0_8px_20px_rgba(43,28,89,0.06)]">
          <div className="grid gap-7 p-8 lg:grid-cols-[0.86fr_1fr]">
            <div>
              <div className="flex items-center gap-4">
                <span className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-sm font-black text-brand">
                  {course.country || "KR"}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-black text-ink">{course.name || travelerText}</p>
                    <span className="font-black text-ink">·</span>
                    <span className="text-sm font-black text-ink">{course.country || "KR"}</span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-ink-muted">
                    {authoredOnText}
                  </p>
                </div>
              </div>

              {/* 첨부된 사진 (다중 사진 캐러셀 지원) */}
              <div className="relative mt-6 h-[190px] w-full overflow-hidden rounded-[18px] bg-slate-950 shadow-md">
                <CommunityDetailHeroImage
                  postId={course.postId}
                  courseId={course.courseId}
                  fallbackImage={course.image}
                  alt="작성자 첨부 사진"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="rounded-[24px] bg-surface-soft p-7 text-base font-medium leading-7 text-ink flex flex-col justify-center">
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

function ReviewCard({ review }) {
  return (
    <article className="rounded-[20px] bg-white p-6 shadow-sm">
      <h3 className="text-lg font-black text-ink">{review.name}</h3>
      <p className="mt-5 min-h-[54px] text-sm font-medium leading-6 text-ink">
        {review.text}
      </p>
      {review.tag ? (
        <p className="mt-8 text-sm font-black text-brand">{review.tag}</p>
      ) : null}
    </article>
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
  const visitorsText = t.has("visitors") ? t("visitors") : "이 코스 다녀온 사람들";
  const writeReviewText = t.has("writeReview") ? t("writeReview") : "후기 쓰기 →";
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
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/95 via-black/55 to-transparent pointer-events-none" />

            <div className="relative z-10 p-6 pointer-events-none">
              <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-black text-white backdrop-blur-xs border border-white/10">
                {course.label || "THE HYUNDAI SEOUL"}
              </span>
            </div>

            <div className="relative z-10 p-6 flex flex-col gap-1 pointer-events-none">
              <h1 className="text-2xl font-black leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {course.title}
              </h1>
              <p className="text-xs font-bold text-white/80">
                {course.hash || "#공개코스"}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-full bg-brand text-xs font-black text-white">
                1
              </span>
              <span className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-xs font-black text-brand">
                {course.country || "KR"}
              </span>
              <div>
                <p className="text-sm font-black text-ink">{course.name || travelerText}</p>
                <p className="mt-1 text-[11px] font-black text-brand">
                  {course.hash || "#공개코스"}
                </p>
              </div>
            </div>
            <h2 className="mt-6 text-[38px] font-black leading-tight text-ink">
              {course.title}
            </h2>
            <p className="mt-4 max-w-3xl text-base font-medium leading-7 text-ink-muted">
              {course.description}
            </p>
            <CommunityDetailActions course={course} />
          </div>
        </div>
      </section>

      <section className="px-10 sm:px-14 py-8 lg:px-52 xl:px-60 2xl:px-72">
        <div className="mx-auto max-w-7xl grid gap-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
          <StopList stops={course.stops} courseId={course.courseId} t={t} />
          <CommunityCourseDetailMap stops={course.stops} />
        </div>
      </section>

      <AuthorNote course={course} t={t} locale={locale} />

      <section className="bg-surface-soft px-10 sm:px-14 pb-16 lg:px-52 xl:px-60 2xl:px-72">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black text-brand">REVIEWS</p>
              <h2 className="mt-3 text-[30px] font-black text-ink">
                {visitorsText}
              </h2>
            </div>
            <Link
              href="/community/share"
              className="text-sm font-black text-brand transition hover:text-brand-dark"
            >
              {writeReviewText}
            </Link>
          </div>
          <div className="mt-7 grid gap-5 lg:grid-cols-3">
            {defaultReviewCards.map((review, idx) => (
              <ReviewCard key={`review-card-${review.name || idx}-${idx}`} review={review} />
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Link
              href="/community"
              className="rounded-full border border-brand px-8 py-3 text-sm font-black text-brand transition hover:bg-brand hover:text-white"
            >
              {viewAllCoursesText}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
