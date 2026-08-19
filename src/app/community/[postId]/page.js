import Link from "next/link";
import { notFound } from "next/navigation";

import { fetchPublicCourseDetailServer } from "@/lib/api/community.server";
import { CommunityChatButton } from "./community-chat-button";
import { CommunityShareButton } from "./community-share-button";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { postId } = await params;
  const course = await fetchPublicCourseDetailServer(postId);

  if (!course) {
    return { title: "커뮤니티 코스" };
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

function StopList({ stops = [] }) {
  return (
    <section className="rounded-[28px] bg-surface-soft p-6 lg:p-7">
      <h2 className="text-lg font-black text-ink">코스 장소</h2>
      <div className="mt-4 flex flex-col gap-3">
        {stops.map((stop, index) => (
          <div
            key={`stop-${stop.placeId || stop.name || index}-${index}`}
            className="flex items-center gap-4 rounded-[16px] bg-white px-4 py-3"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-ink">
                {stop.floor ? `${stop.floor} ` : ""}{stop.name}
              </p>
              {stop.description ? (
                <p className="mt-1 text-xs font-medium text-ink-muted">
                  {stop.description}
                </p>
              ) : null}
            </div>
            <Link
              href="/courses"
              className="text-sm font-black text-brand transition hover:text-brand-dark"
            >
              보기
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function AuthorNote({ course }) {
  return (
    <section className="bg-surface-soft px-10 sm:px-14 py-16 lg:px-52 xl:px-60 2xl:px-72">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black text-brand">COURSE NOTE</p>
            <h2 className="mt-3 text-[32px] font-black text-ink">
              작성자가 남긴 기록
            </h2>
            <p className="mt-2 text-sm font-medium text-ink-muted">
              이 코스를 만든 {course.name || "여행자"}가 직접 쓴 글이에요.
            </p>
          </div>
          <Link
            href="/community"
            className="text-sm font-black text-brand transition hover:text-brand-dark"
          >
            이 사람의 다른 코스 →
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
                    <p className="text-lg font-black text-ink">{course.name || "여행자"}</p>
                    <span className="font-black text-ink">·</span>
                    <span className="text-sm font-black text-ink">{course.country || "KR"}</span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-ink-muted">
                    {course.createdAt ? new Date(course.createdAt).toLocaleDateString("ko-KR") : "2026.03.02"} 작성
                  </p>
                </div>
              </div>
              <GradientBlock
                gradient={course.gradient || "from-[#2d1b8e] to-[#8c57fa]"}
                className="mt-6 flex h-[164px] items-center justify-center rounded-[18px] text-sm font-black text-white"
              >
                사진
              </GradientBlock>
            </div>

            <div className="rounded-[24px] bg-surface-soft p-7 text-base font-medium leading-7 text-ink">
              <p>{course.note || course.description}</p>
              <p className="mt-5">
                1층 워터폴 가든은 입구에서 바로 보여요. 사람이 몰리기 전인 오전
                11시쯤이 가장 한산합니다. 사진은 물이 떨어지는 쪽을 등지고
                찍으면 조명이 예쁘게 들어와요.
              </p>
              <p className="mt-5">
                마지막은 B2 크리에이티브 그라운드예요. 선물 살 만한 게 많아서
                일부러 마지막에 넣었어요.
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
  const { postId } = await params;
  const course = await fetchPublicCourseDetailServer(postId);

  if (!course) {
    notFound();
  }

  return (
    <main className="bg-background">
      <section className="px-10 sm:px-14 pb-16 pt-[72px] lg:px-52 xl:px-60 2xl:px-72">
        <div className="mx-auto max-w-7xl grid gap-12 lg:grid-cols-[0.78fr_1.32fr] lg:items-center">
          <div className="relative flex aspect-[4/3] lg:aspect-[3/4] max-h-[380px] w-full flex-col justify-between overflow-hidden rounded-[28px] bg-slate-950 shadow-[0_14px_36px_rgba(30,15,70,0.25)]">
            <img
              src={course.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=900&fit=crop"}
              alt={course.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/95 via-black/55 to-transparent pointer-events-none" />

            <div className="relative z-10 p-6">
              <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-black text-white backdrop-blur-xs border border-white/10">
                {course.label || "THE HYUNDAI SEOUL"}
              </span>
            </div>

            <div className="relative z-10 p-6 flex flex-col gap-1">
              <h1 className="text-2xl font-black leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {course.title}
              </h1>
              <p className="text-xs font-medium text-white/85 line-clamp-1 drop-shadow-sm">
                {course.description}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-4">
              <span className="flex size-7 items-center justify-center rounded-full bg-brand text-xs font-black text-white">
                1
              </span>
              <span className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-xs font-black text-brand">
                {course.country || "KR"}
              </span>
              <div>
                <p className="text-sm font-black text-ink">{course.name || "여행자"}</p>
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
            <div className="mt-5 flex flex-wrap gap-3">
              <ActionButton>코스 저장</ActionButton>
              <CommunityShareButton />
              <CommunityChatButton course={course} />
            </div>
          </div>
        </div>
      </section>

      <section className="px-10 sm:px-14 py-8 lg:px-52 xl:px-60 2xl:px-72">
        <div className="mx-auto max-w-7xl grid gap-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
          <StopList stops={course.stops} />
          <div className="relative min-h-[260px] overflow-hidden rounded-[28px] bg-slate-950 shadow-md">
            <img
              src={course.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=900&fit=crop"}
              alt="코스 대표 사진"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <span className="absolute bottom-4 left-5 text-xs font-bold text-white/90 drop-shadow-sm">
              코스 대표 사진 · {course.stops?.[0]?.name || "더현대 서울"}
            </span>
          </div>
        </div>
      </section>

      <AuthorNote course={course} />

      <section className="bg-surface-soft px-10 sm:px-14 pb-16 lg:px-52 xl:px-60 2xl:px-72">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black text-brand">REVIEWS</p>
              <h2 className="mt-3 text-[30px] font-black text-ink">
                이 코스 다녀온 사람들
              </h2>
            </div>
            <Link
              href="/community/share"
              className="text-sm font-black text-brand transition hover:text-brand-dark"
            >
              후기 쓰기 →
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
              코스 목록 전체보기 →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
