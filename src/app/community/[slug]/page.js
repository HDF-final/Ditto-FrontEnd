import Link from "next/link";
import { notFound } from "next/navigation";

import {
  communityCourses,
  getCommunityCourse,
} from "@/lib/fixtures/community-courses";

export function generateStaticParams() {
  return communityCourses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const course = getCommunityCourse(slug);

  if (!course) {
    return { title: "커뮤니티 코스" };
  }

  return { title: course.title };
}

const reviewCards = [
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

function StopList({ stops }) {
  return (
    <section className="rounded-[28px] bg-surface-soft p-6 lg:p-7">
      <h2 className="text-lg font-black text-ink">코스 장소</h2>
      <div className="mt-4 flex flex-col gap-3">
        {stops.map((stop, index) => (
          <div
            key={`${stop.floor}-${stop.name}`}
            className="flex items-center gap-4 rounded-[16px] bg-white px-4 py-3"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-ink">
                {stop.floor} {stop.name}
              </p>
              <p className="mt-1 text-xs font-medium text-ink-muted">
                {stop.description}
              </p>
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
    <section className="px-5 py-16 lg:px-24">
      <div className="mx-auto max-w-[1030px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black text-brand">COURSE NOTE</p>
            <h2 className="mt-3 text-[30px] font-black text-ink">
              작성자가 남긴 기록
            </h2>
            <p className="mt-2 text-sm font-medium text-ink-muted">
              이 코스를 만든 {course.name}가 직접 쓴 글이에요.
            </p>
          </div>
          <Link
            href="/community"
            className="text-sm font-black text-brand transition hover:text-brand-dark"
          >
            이 사람의 다른 코스 →
          </Link>
        </div>

        <article className="mt-6 rounded-[28px] border border-line bg-white px-6 py-8 lg:px-14 lg:py-12">
          <div className="flex items-center gap-4">
            <span className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-sm font-black text-brand">
              {course.country}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-black text-ink">{course.name}</p>
                <span className="rounded-full bg-brand-soft px-3 py-1 text-[10px] font-black text-brand">
                  JAPAN
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-ink-muted">
                2026.03.02 작성 · 세 번 다녀옴
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-5 text-[15px] font-medium leading-7 text-ink">
            <p>{course.note}</p>
            <p>
              1층 워터폴 가든은 입구에서 바로 보여요. 사람이 몰리기 전인 오전
              11시쯤이 가장 한산합니다. 사진은 물이 떨어지는 쪽을 등지고 찍으면
              조명이 예쁘게 들어와요.
            </p>
            <p>
              5층 사운즈 포레스트는 중간에 쉬어가는 구간으로 넣었어요. 실내인데
              나무가 많아서 밖에 있는 기분이 들어요.
            </p>
            <p>
              마지막은 B2 크리에이티브 그라운드예요. 선물 살 만한 게 많아서
              일부러 마지막에 넣었습니다.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <GradientBlock
              gradient={course.gradient}
              className="h-[142px] rounded-[16px]"
            />
            <GradientBlock
              gradient="from-[#4a2fa8] to-[#9b5cf6]"
              className="h-[142px] rounded-[16px]"
            />
            <GradientBlock
              gradient={course.gradient}
              className="h-[142px] rounded-[16px]"
            />
          </div>

          <div className="mt-7 h-px bg-line" />
          <div className="mt-5 flex flex-wrap gap-7 text-sm font-medium text-ink-muted">
            <span>♡ 좋아요 128</span>
            <span>▱ 저장 96</span>
            <span>↗ 공유</span>
          </div>
        </article>
      </div>
    </section>
  );
}

function ReviewCard({ review }) {
  return (
    <article className="rounded-[20px] bg-white p-6 shadow-[0_10px_28px_rgba(43,28,89,0.12)]">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-black text-ink">{review.name}</p>
            <span className="rounded-full bg-brand-soft px-3 py-1 text-[10px] font-black text-brand">
              {review.country}
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-ink-muted">
            1개월 전 방문 · 첫 방문
          </p>
        </div>
      </div>
      <p className="mt-6 min-h-[70px] text-sm font-medium leading-6 text-ink">
        {review.text}
      </p>
      <div className="mt-5 flex gap-3">
        <GradientBlock
          gradient="from-[#2d1b8e] to-[#8c57fa]"
          className="size-[66px] rounded-[12px]"
        />
        <GradientBlock
          gradient="from-[#5c2ef5] to-[#8c57fa]"
          className="size-[66px] rounded-[12px]"
        />
      </div>
      <p className="mt-4 text-xs font-black text-brand">{review.tag}</p>
      <div className="mt-5 flex gap-6 text-xs font-medium text-ink-muted">
        <span>도움돼요 {review.likes}</span>
        <span>답글 {review.replies}</span>
      </div>
    </article>
  );
}

export default async function CommunityCourseDetailPage({ params }) {
  const { slug } = await params;
  const course = getCommunityCourse(slug);

  if (!course) {
    notFound();
  }

  return (
    <main className="bg-background">
      <section className="px-5 pb-16 pt-[72px] lg:px-24">
        <div className="grid gap-12 lg:grid-cols-[0.78fr_1.32fr] lg:items-center">
          <GradientBlock
            gradient={course.gradient}
            className="flex h-[230px] flex-col justify-between rounded-[28px] p-7 text-white lg:h-[250px]"
          >
            <span className="text-xs font-black">{course.label}</span>
            <h1 className="max-w-[260px] text-[30px] font-black leading-tight">
              {course.title}
            </h1>
          </GradientBlock>

          <div>
            <div className="flex items-center gap-4">
              <span className="flex size-7 items-center justify-center rounded-full bg-brand text-xs font-black text-white">
                1
              </span>
              <span className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-xs font-black text-brand">
                {course.country}
              </span>
              <div>
                <p className="text-sm font-black text-ink">{course.name}</p>
                <p className="mt-1 text-[11px] font-black text-brand">
                  {course.hash}
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
              <ActionButton variant="outline">공유하기</ActionButton>
              <ActionButton>대화 참여</ActionButton>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-8 lg:px-24">
        <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
          <StopList stops={course.stops} />
          <GradientBlock
            gradient="from-[#2d1b8e] to-[#9b5cf6]"
            className="flex min-h-[245px] items-center justify-center rounded-[28px] text-sm font-medium text-white/70"
          >
            코스 대표 사진
          </GradientBlock>
        </div>
      </section>

      <AuthorNote course={course} />

      <section className="bg-surface-soft px-5 py-16 lg:px-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black text-brand">REVIEWS</p>
            <h2 className="mt-3 text-[30px] font-black text-ink">
              이 코스 다녀온 사람들
            </h2>
            <p className="mt-2 text-sm font-medium text-ink-muted">
              실제로 따라간 분들이 남긴 후기예요.
            </p>
          </div>
          <Link
            href="/community/share"
            className="text-sm font-black text-brand transition hover:text-brand-dark"
          >
            후기 쓰기 →
          </Link>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {reviewCards.map((review) => (
            <ReviewCard key={review.name} review={review} />
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link
            href="/community"
            className="rounded-full border border-brand px-8 py-3 text-sm font-black text-brand transition hover:bg-brand hover:text-white"
          >
            후기 128개 모두 보기 →
          </Link>
        </div>
      </section>
    </main>
  );
}
