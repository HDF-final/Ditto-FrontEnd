"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Modal } from "@/components/common/modal";
import {
  getCachedAdminCourse,
  getCachedAdminCourses,
  revokeAdminCourse,
} from "@/lib/api/admin-courses";
import { useAdminTrendArtifact } from "@/hooks/use-admin-trend-artifact";
import {
  ArtifactError,
  ArtifactLoading,
  CardHero,
  formatAdminDate,
  ttlLabel,
} from "./admin-artifact-ui";
import { AdminCourseEditor } from "./admin-course-editor";

// 승인이 끝난 코스, 즉 **지금 손님에게 나가고 있는 것**을 늘어놓는다. 승인 대기 화면과
// 짝이다 — 저쪽은 아직 사람이 안 본 초안이고 이쪽은 사람이 확정해 캐시에 올라간 것이다.
// 승인이 초안을 지우므로 한 인물이 양쪽에 동시에 뜨는 일은 없다.
//
// 할 수 있는 것이 둘이다.
//
//   고치기   되짚기 창구가 캐시를 **초안과 같은 칸**으로 돌려주므로 승인 대기 화면과
//            같은 편집기를 그대로 연다. 다시 올리면 덮어쓴다 — 승인이 멱등이다.
//   내리기   코스(전 축)·조사 재료·표기를 통째로 뺀다. 되돌리는 창구는 없다.
//
// 목록 창구가 대표 사진을 같이 주므로 카드를 그리려고 상세를 미리 받지 않는다 —
// 요청 하나로 끝나고, 전문은 **열 때만** 받는다(하나가 세션 상태까지 들고 있어 수백 KB).

const ASPECT_LABEL = {
  BRAND: "브랜드",
  FOOD: "음식",
  HOBBY: "취미",
};

function CourseCard({ course, onOpen, revoking, onRevoke, onCancelRevoke }) {
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
        // 손님이 실제로 받는 첫 문장이다. 카드만 보고도 어떤 말투로 나가는지 알 수 있어야 한다.
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
        {/* 조사 재료가 같이 살아 있어야 "카리나와 윈터" 같은 질문에서 이 인물 몫을 다시
            안 판다. 있는 것이 정상이라, 없을 때만 알린다. */}
        {course.research === false ? (
          <span className="rounded-full bg-[#fff1f2] px-2.5 py-1 text-[11px] font-bold text-[#b3384f]">
            조사 재료 없음
          </span>
        ) : null}
      </div>

      {/* 사전 매칭에 걸리는 표기다. 이게 비면 코스가 올라가 있어도 손님 문장에서 인물을
          못 알아봐 즉답이 안 나간다 — 카드에서 바로 보이는 편이 낫다. */}
      <p className="mt-3 truncate text-[11px] text-[#9aa0b0]" title={aliases.join(" · ")}>
        {aliases.length ? `표기 ${aliases.join(" · ")}` : "표기 없음 — 즉답이 안 나갑니다"}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-[#9aa0b0]">
        <span>{formatAdminDate(course.approved_at)} 승인</span>
        <span className="font-bold text-[#6d7387]">{ttlLabel(course.ttl)}</span>
      </div>

      <div className="mt-auto flex items-center gap-2 pt-4">
        <button
          type="button"
          onClick={onOpen}
          className="flex-1 rounded-xl border border-[#dfe2ec] bg-white px-3 py-2 text-xs font-bold text-[#4d536a] transition hover:border-brand hover:text-brand"
        >
          열어서 고치기
        </button>
        {/* **두 번 눌러야 나간다.** 되돌리는 창구가 없는 동작이고, 카드가 격자로 붙어
            있어 옆 인물을 누르기 쉬운 자리다. */}
        <button
          type="button"
          onClick={onRevoke}
          disabled={revoking === "sending"}
          className={`rounded-xl px-3 py-2 text-xs font-bold transition disabled:opacity-40 ${
            revoking === "confirm"
              ? "bg-[#c0392b] text-white"
              : "border border-[#f0d6d9] bg-white text-[#b3384f] hover:border-[#c0392b]"
          }`}
          title="코스·조사 재료·표기를 통째로 뺍니다. 되돌릴 수 없습니다"
        >
          {revoking === "sending"
            ? "내리는 중…"
            : revoking === "confirm"
              ? "정말 내립니다 — 한 번 더"
              : "내리기"}
        </button>
        {revoking === "confirm" ? (
          <button
            type="button"
            onClick={onCancelRevoke}
            className="rounded-xl border border-[#dfe2ec] bg-white px-3 py-2 text-xs font-bold text-[#4d536a]"
          >
            취소
          </button>
        ) : null}
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

  // 연 코스의 전문. 카드마다 미리 받지 않고 **열 때만** 받는다.
  const [opened, setOpened] = useState(null);
  const [detail, setDetail] = useState({ data: null, error: null });
  // 내리기는 카드마다 idle → confirm → sending 으로 간다. 한 번에 하나만 진행한다.
  const [revoking, setRevoking] = useState({ key: null, phase: "idle" });
  const [notice, setNotice] = useState("");

  const courses = useMemo(() => {
    const rows = data?.payload?.courses;
    return Array.isArray(rows) ? rows : [];
  }, [data]);

  const reloadAll = useCallback(() => {
    setRevoking({ key: null, phase: "idle" });
    reload();
  }, [reload]);

  const open = useCallback(async (course) => {
    setOpened(course);
    setDetail({ data: null, error: null });
    setNotice("");
    try {
      setDetail({ data: await getCachedAdminCourse(course.celebrity, course.aspect), error: null });
    } catch (nextError) {
      setDetail({ data: null, error: nextError });
    }
  }, []);

  const close = useCallback(() => {
    setOpened(null);
    setDetail({ data: null, error: null });
  }, []);

  // 다시 올리면 카드가 사라지지 않는다 — 덮어쓴 것이라 그대로 남는다. 그래서 성공
  // 신호가 승인 대기 화면과 다르다. 승인 시각이 방금으로 바뀐 것이 그 신호다.
  const afterApprove = useCallback(
    (celebrity, result) => {
      close();
      reloadAll();
      const warnings = result?.warnings;
      setNotice(
        Array.isArray(warnings) && warnings.length
          ? `${celebrity} 다시 올렸습니다 — 확인할 것: ${warnings.join(" · ")}`
          : `${celebrity} 코스를 덮어썼습니다. 승인 시각이 방금으로 바뀝니다.`,
      );
    },
    [close, reloadAll],
  );

  const revoke = useCallback(
    async (course) => {
      const key = `${course.celebrity}:${course.aspect}`;
      if (revoking.key !== key || revoking.phase !== "confirm") {
        setRevoking({ key, phase: "confirm" });
        setNotice("");
        return;
      }
      setRevoking({ key, phase: "sending" });
      try {
        const result = await revokeAdminCourse(course.celebrity);
        setNotice(
          `${course.celebrity} 코스를 내렸습니다 — 키 ${result?.keys ?? 0}개 · 표기 ${result?.aliases ?? 0}개를 뺐습니다.`,
        );
        reloadAll();
      } catch (nextError) {
        setRevoking({ key: null, phase: "idle" });
        setNotice(
          `${nextError.message || "내리지 못했습니다."} — 새로고침해 이 인물이 남아 있는지 확인하세요.`,
        );
      }
    },
    [revoking, reloadAll],
  );

  if (loading) return <ArtifactLoading />;
  if (error) return <ArtifactError error={error} onRetry={reloadAll} />;

  return (
    <section>
      <CacheStrip count={courses.length} fetchedAt={data?.fetchedAt} onReload={reloadAll} />

      {notice ? (
        <p className="mb-4 rounded-2xl border border-[#e1e4ed] bg-white px-5 py-3 text-xs font-semibold text-[#4d536a]">
          {notice}
        </p>
      ) : null}

      {courses.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {courses.map((course) => {
            const key = `${course.celebrity}:${course.aspect}`;
            return (
              <CourseCard
                key={key}
                course={course}
                onOpen={() => open(course)}
                revoking={revoking.key === key ? revoking.phase : "idle"}
                onRevoke={() => revoke(course)}
                onCancelRevoke={() => setRevoking({ key: null, phase: "idle" })}
              />
            );
          })}
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

      {/* 승인 대기 화면과 같은 편집기를 그대로 연다. 되짚기 창구가 초안과 같은 칸으로
          돌려주므로 편집기가 어느 쪽인지 몰라도 된다 — `live` 가 문구만 바꾼다. */}
      <Modal
        open={Boolean(opened)}
        onClose={close}
        labelledBy="admin-course-editor-title"
        panelClassName="h-[92dvh] w-[92vw] max-w-[1680px] overflow-hidden rounded-[24px] border border-[#e1e4ed] bg-white shadow-[0_30px_90px_rgba(20,24,50,0.28)]"
      >
        {detail.error ? (
          <div className="flex h-full flex-col justify-center p-8">
            <ArtifactError error={detail.error} onRetry={() => open(opened)} />
            <button
              type="button"
              onClick={close}
              className="mx-auto mt-4 rounded-xl border border-[#dfe2ec] bg-white px-6 py-2 text-xs font-bold text-[#4d536a]"
            >
              닫기
            </button>
          </div>
        ) : detail.data ? (
          <AdminCourseEditor
            key={`${detail.data.celebrity}:${opened?.aspect}`}
            detail={detail.data}
            live
            onClose={close}
            onApproved={afterApprove}
          />
        ) : (
          <div className="flex h-full items-center justify-center gap-3 text-sm font-semibold text-[#596078]">
            <span className="size-5 animate-spin rounded-full border-2 border-[#d9ddef] border-t-brand" />
            코스를 불러오는 중
          </div>
        )}
      </Modal>
    </section>
  );
}
