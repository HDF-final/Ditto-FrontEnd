"use client";

import Link from "next/link";

export function MyCoursePrivateCard({ course, onDelete }) {
  const courseId = course.courseId || course.id;
  const href = `/ai-course?courseId=${courseId}`;
  const stops = Array.isArray(course.stops) ? course.stops : [];
  const spotCountText =
    course.spotCount ||
    (stops.length > 0 ? `${stops.length}개 스팟` : "스팟 정보 없음");

  return (
    <Link
      href={href}
      className="group relative flex h-[255px] flex-col justify-between rounded-[24px] border border-line bg-white p-6 shadow-[0_4px_20px_rgba(43,28,89,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_12px_28px_rgba(92,46,245,0.12)] cursor-pointer"
    >
      <div className="flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-black text-brand">
            <span className="size-1.5 rounded-full bg-brand animate-pulse" />
            내 맞춤 코스
          </span>
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-surface-soft px-2.5 py-1 text-xs font-bold text-ink-muted">
              {spotCountText}
            </span>
            {onDelete ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(course);
                }}
                title="코스 삭제"
                className="flex size-6 items-center justify-center rounded-full text-ink-muted/50 transition hover:bg-red-50 hover:text-red-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>

        {/* Course Title */}
        <h3 className="mt-3.5 text-lg font-black text-ink group-hover:text-brand transition-colors line-clamp-1">
          {course.title || "나만의 코스"}
        </h3>

        {/* Course Stops Timeline (2개 높이 고정, 2개 초과 시 스크롤) */}
        <div
          className="mt-3.5 flex flex-col gap-2 max-h-[72px] overflow-y-auto pr-1.5 scrollbar-thin [scrollbar-width:thin] [scrollbar-color:#d4d0ec_transparent]"
          onClick={(e) => {
            // 스크롤 조작 중 불필요한 링크 점프 방지 (스크롤바 클릭 시)
            e.stopPropagation();
          }}
        >
          {stops.length > 0 ? (
            stops.map((stop, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs shrink-0 py-0.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-surface-soft font-black text-ink-muted text-[10px]">
                  {idx + 1}
                </span>
                <span className="shrink-0 rounded-md bg-[#f0ecfc] px-1.5 py-0.5 text-[10px] font-bold text-brand">
                  {stop.floor || "1F"}
                </span>
                <span className="truncate font-semibold text-ink">
                  {stop.name || "장소명"}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-ink-muted py-1">저장된 스팟 목록이 없습니다.</p>
          )}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-4 flex items-center justify-end border-t border-line/70 pt-3.5">
        <div className="inline-flex items-center gap-1 text-xs font-black text-brand group-hover:translate-x-0.5 transition-transform">
          <span>지도에서 보기</span>
          <span>→</span>
        </div>
      </div>
    </Link>
  );
}
