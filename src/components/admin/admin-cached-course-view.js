"use client";

import Link from "next/link";
import { useMemo } from "react";
import { getCachedAdminCourses } from "@/lib/api/admin-courses";
import { useAdminTrendArtifact } from "@/hooks/use-admin-trend-artifact";
import {
  ArtifactError,
  ArtifactLoading,
  CardHero,
  formatAdminDate,
  ttlLabel,
} from "./admin-artifact-ui";

// 승인이 끝난 코스, 즉 **지금 손님에게 나가고 있는 것**을 늘어놓는다. 승인 대기 화면과
// 짝이다 — 저쪽은 아직 사람이 안 본 초안이고 이쪽은 사람이 확정해 캐시에 올라간 것이다.
// 승인이 초안을 지우므로 한 인물이 양쪽에 동시에 뜨는 일은 없다.
//
// **누를 것이 없는 화면이다.** 고치거나 내리는 창구가 아직 없어서, 카드를 눌리게 해 두면
// 관리자가 열어 보고 아무것도 못 하는 자리를 만나게 된다. 지금 무엇이 나가고 언제까지
// 나가는지를 한눈에 보는 것까지가 이 화면의 몫이다.
//
// 목록 창구가 대표 사진을 같이 준다. 그래서 초안 화면과 달리 카드를 그리려고 인물마다
// 상세를 미리 받는 장치가 없다 — 요청 하나로 끝난다.

const ASPECT_LABEL = {
  BRAND: "브랜드",
  FOOD: "음식",
  HOBBY: "취미",
};

function CourseCard({ course }) {
  const warnings = Number(course.warnings) || 0;
  const aliases = Array.isArray(course.aliases) ? course.aliases : [];

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-[#e1e4ed] bg-white p-4 shadow-[0_10px_35px_rgba(31,36,66,0.05)]">
      <CardHero hero={course.hero} name={course.celebrity} />

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <strong className="block truncate text-[17px] font-bold text-[#171b30]">
            {course.celebrity}
          </strong>
          <span className="mt-0.5 block text-[11px] text-[#9aa0b0]">
            {ASPECT_LABEL[course.aspect] || course.aspect} 코스
          </span>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#e9f9f0] px-2.5 py-1 text-[11px] font-bold text-[#12804b]">
          <span className="size-1.5 rounded-full bg-[#20ad6a]" />
          서비스 중
        </span>
      </div>

      <p className="mt-3 text-sm font-semibold text-[#4c5164]">{course.shape || "코스 없음"}</p>

      {course.reply ? (
        // 손님이 실제로 받는 첫 문장이다. 관리자가 카드만 보고도 어떤 말투로 나가는지
        // 알 수 있어야 해서 두 줄까지 보여 준다.
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#8a90a3]">{course.reply}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-[#f2f3f7] px-2.5 py-1 text-[11px] font-bold text-[#6d7387]">
          자리 {course.places ?? 0}
        </span>
        {warnings > 0 ? (
          <span className="rounded-full bg-[#fff4dc] px-2.5 py-1 text-[11px] font-bold text-[#a96700]">
            경고 {warnings}
          </span>
        ) : null}
        {/* 조사 재료가 같이 살아 있어야 "카리나와 윈터" 같은 질문에서 이 인물 몫을
            다시 안 판다. 있는 것이 정상이라, 없을 때만 알린다. */}
        {course.research === false ? (
          <span className="rounded-full bg-[#fff1f2] px-2.5 py-1 text-[11px] font-bold text-[#b3384f]">
            조사 재료 없음
          </span>
        ) : null}
      </div>

      {/* 사전 매칭에 걸리는 표기다. 이게 비면 코스가 올라가 있어도 손님 문장에서
          인물을 못 알아봐 즉답이 안 나간다 — 카드에서 바로 보이는 편이 낫다. */}
      <p className="mt-3 truncate text-[11px] text-[#9aa0b0]" title={aliases.join(" · ")}>
        {aliases.length ? `표기 ${aliases.join(" · ")}` : "표기 없음 — 즉답이 안 나갑니다"}
      </p>

      <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-[11px] text-[#9aa0b0]">
        <span>{formatAdminDate(course.approved_at)} 승인</span>
        <span className="font-bold text-[#6d7387]">{ttlLabel(course.ttl)}</span>
      </div>
    </article>
  );
}

function CacheStrip({ count, fetchedAt, onReload }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e2e5ef] bg-white px-5 py-4 shadow-[0_8px_30px_rgba(25,30,60,0.04)]">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
            count > 0 ? "bg-[#e9f9f0] text-[#12804b]" : "bg-[#f2f3f7] text-[#6d7387]"
          }`}
        >
          <span className={`size-1.5 rounded-full ${count > 0 ? "bg-[#20ad6a]" : "bg-[#b4b9c8]"}`} />
          서비스 중 {count}건
        </span>
        {/* 하루짜리라는 것이 이 화면의 전제다. 아침에 목록이 비어 있는 것은 장애가
            아니라 그날 승인 전이라는 뜻이다. */}
        <span className="font-semibold text-[#687087]">오늘 자정(KST)에 전부 만료</span>
        <span className="h-3 w-px bg-[#dfe2eb]" />
        <span className="text-[#8a90a3]">{formatAdminDate(fetchedAt)} 기준</span>
      </div>
      <button
        type="button"
        onClick={onReload}
        className="inline-flex items-center gap-2 rounded-xl border border-[#dfe2ec] bg-white px-4 py-2 text-xs font-bold text-[#4d536a] transition hover:border-[#c8bdfd] hover:text-brand"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 11a8.1 8.1 0 1 0 2 5.3" />
          <path d="M20 4v7h-7" />
        </svg>
        새로고침
      </button>
    </div>
  );
}

export function AdminCachedCourseView() {
  const { data, error, loading, reload } = useAdminTrendArtifact(getCachedAdminCourses);

  const courses = useMemo(() => {
    const rows = data?.payload?.courses;
    return Array.isArray(rows) ? rows : [];
  }, [data]);

  if (loading) return <ArtifactLoading />;
  if (error) return <ArtifactError error={error} onRetry={reload} />;

  return (
    <section>
      <CacheStrip count={courses.length} fetchedAt={data?.fetchedAt} onReload={reload} />

      {courses.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {courses.map((course) => (
            <CourseCard key={`${course.celebrity}:${course.aspect}`} course={course} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#e5e7ef] bg-white p-16 text-center">
          <p className="text-sm font-bold text-[#4c5164]">지금 서비스 중인 코스가 없습니다.</p>
          <p className="mt-1.5 text-xs text-[#9095a6]">
            승인한 코스는 다음 자정에 만료됩니다. 오늘 것을 올리려면 초안을 승인하세요.
          </p>
          <Link
            href="/admin/courses"
            className="mt-5 inline-flex rounded-xl bg-[#231f35] px-5 py-2.5 text-xs font-bold text-white"
          >
            승인 대기 코스로 가기
          </Link>
        </div>
      )}
    </section>
  );
}
