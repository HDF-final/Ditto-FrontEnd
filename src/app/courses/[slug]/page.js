import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import {
  getRecommendedCourse,
  recommendedCourses,
} from "@/lib/fixtures/recommended-courses";

export function generateStaticParams() {
  return recommendedCourses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const course = getRecommendedCourse(slug);

  if (!course) {
    return { title: "추천 코스" };
  }

  return { title: course.title };
}

const reviews = [
  {
    name: "Yuki_T",
    text: "친구가 처음 서울 왔을 때 이 순서 그대로 돌았어요.",
    tag: "#1F워터폴가든",
  },
  {
    name: "Chen_Li",
    text: "5층 정원에서 쉬는 구간이 있어서 좋았어요.",
    tag: "#5F사운즈포레스트",
  },
  {
    name: "Emma_R",
    text: "B2 편집숍이 생각보다 볼 게 많아서 시간을 더 잡았어요.",
    tag: "#B2크리에이티브그라운드",
  },
];

function GradientPanel({ gradient, className = "", children }) {
  return (
    <div className={`bg-linear-to-br ${gradient} ${className}`}>{children}</div>
  );
}

function PillButton({ children, variant = "primary" }) {
  return (
    <button
      type="button"
      className={`inline-flex h-12 min-w-[142px] items-center justify-center rounded-full px-8 text-sm font-black transition ${
        variant === "outline"
          ? "border border-line bg-white text-brand hover:border-brand"
          : "bg-brand text-white hover:bg-brand-dark"
      }`}
    >
      {children}
    </button>
  );
}

function StopSection({ course }) {
  return (
    <section className="rounded-[28px] bg-surface-soft p-7">
      <h2 className="text-2xl font-black text-ink">코스 장소</h2>
      <div className="mt-5 flex flex-col gap-4">
        {course.stops.map((stop, index) => (
          <div
            key={`${stop.floor}-${stop.name}`}
            className="flex items-center gap-4 rounded-[18px] bg-white px-5 py-4"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-black text-white">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-base font-black text-ink">
                {stop.floor} {stop.name}
              </p>
              <p className="mt-1 text-sm font-medium text-ink-muted">
                {stop.description}
              </p>
            </div>
            <Link href="/courses" className="text-sm font-black text-brand">
              보기
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecommendationNote({ course }) {
  return (
    <section className="bg-surface-soft px-6 sm:px-8 py-16 lg:px-28 xl:px-32">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black text-brand">BONI NOTE</p>
          <h2 className="mt-3 text-[32px] font-black text-ink">
            보니가 추천하는 이유
          </h2>
        </div>
        <Link href="/courses" className="text-sm font-black text-brand">
          추천 기준 보기 →
        </Link>
      </div>

      <article className="mt-8 rounded-[28px] bg-white p-8 shadow-[0_8px_20px_rgba(43,28,89,0.06)]">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <div className="flex items-center gap-4">
              <Image
                src="/assets/common/boni-chat.svg"
                alt="Boni"
                width={52}
                height={52}
                className="size-12 rounded-full"
              />
              <div>
                <h3 className="text-xl font-black text-ink">Boni 추천 코멘트</h3>
                <p className="mt-1 text-sm font-medium text-ink-muted">
                  초행자 · 사진 포인트 · 실내 동선 기준
                </p>
              </div>
            </div>
            <div className="mt-8 rounded-[24px] bg-surface-soft p-7 text-base font-medium leading-7 text-ink">
              {course.note}
            </div>
          </div>

          <div className="rounded-[24px] bg-surface-soft p-7">
            <h3 className="text-xl font-black text-ink">추천 기준</h3>
            <div className="mt-6 flex flex-col gap-5">
              {course.criteria.map((criterion, index) => (
                <div key={criterion.title} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-base font-black text-ink">
                      {criterion.title}
                    </p>
                    <p className="mt-1 text-sm font-medium text-ink-muted">
                      {criterion.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}

function ReviewCards() {
  return (
    <section className="bg-surface-soft px-6 sm:px-8 pb-16 lg:px-28 xl:px-32">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black text-brand">REVIEWS</p>
          <h2 className="mt-3 text-[30px] font-black text-ink">
            이 코스 다녀온 사람들
          </h2>
        </div>
        <Link href="/community/share" className="text-sm font-black text-brand">
          후기 쓰기 →
        </Link>
      </div>
      <div className="mt-7 grid gap-5 lg:grid-cols-3">
        {reviews.map((review) => (
          <article key={review.name} className="rounded-[20px] bg-white p-6">
            <h3 className="text-lg font-black text-ink">{review.name}</h3>
            <p className="mt-5 text-sm font-medium leading-6 text-ink">
              {review.text}
            </p>
            <p className="mt-8 text-sm font-black text-brand">{review.tag}</p>
          </article>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Link
          href="/community"
          className="rounded-full border border-brand px-8 py-3 text-sm font-black text-brand"
        >
          후기 128개 모두 보기 →
        </Link>
      </div>
    </section>
  );
}

export default async function RecommendedCourseDetailPage({ params }) {
  const { slug } = await params;
  const course = getRecommendedCourse(slug);

  if (!course) {
    notFound();
  }

  return (
    <main className="bg-background">
      <section className="bg-white px-6 sm:px-8 pb-20 pt-[72px] lg:px-28 xl:px-32">
        <div className="grid gap-12 lg:grid-cols-[0.78fr_1.32fr] lg:items-center">
          <GradientPanel
            gradient={course.gradient}
            className="flex h-[270px] flex-col justify-between rounded-[28px] p-9 text-white"
          >
            <span className="text-xs font-black">{course.label}</span>
            <h1 className="max-w-[300px] text-[36px] font-black leading-tight">
              {course.title}
            </h1>
          </GradientPanel>
          <div>
            <div className="flex items-center gap-4">
              <span className="flex size-9 items-center justify-center rounded-full bg-brand text-sm font-black text-white">
                {course.rank}
              </span>
              <Image
                src="/assets/common/boni-chat.svg"
                alt="Boni"
                width={52}
                height={52}
                className="size-12 rounded-full"
              />
              <div>
                <p className="text-xl font-black text-ink">{course.author}</p>
                <p className="text-sm font-black text-brand">{course.hash}</p>
              </div>
            </div>
            <h2 className="mt-7 text-[44px] font-black leading-tight text-ink">
              {course.title}
            </h2>
            <p className="mt-5 max-w-3xl text-lg font-medium leading-7 text-ink-muted">
              {course.description}
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <PillButton>코스 저장</PillButton>
              <PillButton variant="outline">공유하기</PillButton>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 sm:px-8 pb-16 lg:px-28 xl:px-32">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1fr]">
          <StopSection course={course} />
          <GradientPanel
            gradient="from-[#2d1b8e] to-[#9b5cf6]"
            className="flex min-h-[300px] items-center justify-center rounded-[28px] text-base font-black text-white/75"
          >
            코스 대표 사진
          </GradientPanel>
        </div>
      </section>

      <RecommendationNote course={course} />
      <ReviewCards />
    </main>
  );
}
