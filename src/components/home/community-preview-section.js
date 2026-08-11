import Link from "next/link";

import { communityCourses } from "@/lib/fixtures/home";
import { SectionHeading } from "@/components/home/section-heading";

function Metric({ label, value }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true">{label}</span>
      {value}
    </span>
  );
}

export function CommunityPreviewSection() {
  return (
    <section
      id="community"
      className="scroll-mt-[94px] bg-linear-to-br from-[#2d1b8e] via-[#4a2fa8] to-[#6d28d9] px-5 py-16 lg:px-24"
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
            className="rounded-3xl bg-white p-5 shadow-[0_8px_20px_rgba(43,28,89,0.1)]"
          >
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-accent text-xs font-black text-white">
                {course.rank}
              </span>
              <span className="text-sm font-black text-brand">{course.flag}</span>
              <div>
                <p className="text-sm font-black text-ink">{course.name}</p>
                <p className="text-[10px] font-semibold text-accent">
                  {course.hash}
                </p>
              </div>
            </div>
            <h3 className="mt-4 text-base font-black text-ink">
              {course.title}
            </h3>
            <ul className="mt-3 space-y-2">
              {course.spots.map((spot) => (
                <li key={spot} className="flex items-center gap-2 text-sm text-ink">
                  <span className="size-[7px] rounded-full bg-accent" />
                  {spot}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-4 text-xs text-ink-muted">
              <Metric label="♡" value={course.likes} />
              <Metric label="↗" value={course.comments} />
              <Metric label="▱" value={course.saves} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                href="/community"
                className="rounded-full border border-line bg-white py-2 text-center text-xs font-black text-accent"
              >
                코스 보기
              </Link>
              <Link
                href="/ai-course"
                className="rounded-full bg-accent py-2 text-center text-xs font-black text-white"
              >
                내 코스로 복사
              </Link>
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
