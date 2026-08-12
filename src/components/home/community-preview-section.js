import Link from "next/link";

import { communityCourses } from "@/lib/fixtures/home";
import { SectionHeading } from "@/components/home/section-heading";

function Metric({ label, value }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <span aria-hidden="true">{label}</span>
      {value}
    </span>
  );
}

export function CommunityPreviewSection() {
  return (
    <section
      id="community"
      className="scroll-mt-[94px] bg-linear-to-br from-[#2d1b8e] via-[#4a2fa8] to-[#6d28d9] px-6 sm:px-8 py-16 lg:px-28 xl:px-32"
    >
      <SectionHeading
        eyebrow="TRAVELER COMMUNITY"
        title="지금 인기 있는 커스텀 코스"
        description="다른 여행자들이 직접 만들고 공유한 코스를 확인해보세요."
        href="/community"
        linkLabel="커뮤니티 둘러보기"
        inverse
      />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {communityCourses.map((course) => (
          <article
            key={course.rank}
            className="overflow-hidden rounded-[32px] bg-white shadow-[0_10px_24px_rgba(43,28,89,0.12)]"
          >
            <div className="h-[210px] bg-linear-to-br from-[#5c2ef5] to-[#8c57fa] px-7 py-8">
              <span className="text-xs font-black text-white">DITTO COURSE</span>
            </div>
            <div className="px-7 pb-8 pt-9">
              <div className="flex items-center gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-base font-black text-white">
                  {course.rank}
                </span>
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-base font-black text-brand">
                  {course.flag}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xl font-black leading-none text-ink">
                    {course.name}
                  </p>
                  <p className="mt-2 truncate text-sm font-black leading-none text-brand">
                    {course.hash}
                  </p>
                </div>
              </div>
              <h3 className="mt-8 min-h-[68px] text-[28px] font-black leading-tight text-ink">
                {course.title}
              </h3>
              <div className="mt-5 h-px bg-line" />
              <div className="mt-5 flex items-center justify-between text-sm font-medium text-ink-muted">
                <Metric label="♥" value={course.likes} />
                <Metric label="☷" value={course.comments} />
                <Metric label="📌" value={course.saves} />
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <Link
                  href="/community"
                  className="rounded-full border border-line bg-white py-3 text-center text-xs font-black text-brand transition hover:border-brand"
                >
                  코스 보기
                </Link>
                <Link
                  href="/ai-course"
                  className="rounded-full bg-brand py-3 text-center text-xs font-black text-white transition hover:bg-brand-dark"
                >
                  내 코스로 복사
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-7 flex justify-center gap-2" aria-hidden="true">
        <span className="h-2 w-5 rounded-full bg-white" />
        <span className="h-2 w-2 rounded-full bg-white/40" />
        <span className="h-2 w-2 rounded-full bg-white/40" />
        <span className="h-2 w-2 rounded-full bg-white/40" />
      </div>
    </section>
  );
}
