"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "@/components/common/modal";
import {
  deleteSystemCourse,
  getSystemCourse,
  getSystemCourses,
} from "@/lib/api/admin-system-courses";
import { useAdminTrendArtifact } from "@/hooks/use-admin-trend-artifact";
import {
  ArtifactError,
  ArtifactLoading,
  CardHero,
  COUNTRY_META,
  formatAdminDate,
} from "./admin-artifact-ui";
import { AdminSystemCourseEditor } from "./admin-system-course-editor";

// **기본 추천 코스.** `creation_type = 'SYSTEM'` 이고 메인·코스 추천 리스트에 걸린다.
//
// 캐시된 코스 화면(`/admin/courses/cached`)과 짝이지만 보는 곳이 다르다.
//
//   캐시된 코스   Redis. 오늘 손님 즉답에 나가는 사본이고 **자정에 사라진다**
//   기본 추천 코스 오라클. 한 번 올리면 계속 걸리고 **안 사라진다** — TTL 이 없다
//
// 그래서 여기에는 "남은 시간" 이 없고 대신 만든 날짜와 고친 날짜를 보여 준다.
// 커뮤니티에는 이 코스들이 안 나온다 — 백엔드가 목록에서 뺀다.

// 반영 진행 상태. 승인 버튼을 누르면 캐시 승인만 끝나고 서비스 DB 반영은 뒤에서
// 1~2분간 돈다. 그동안 관리자가 볼 것이 없으면 두 번 누르므로 상태를 그린다.
const STATE_META = {
  queued: { label: "대기 중", tone: "wait" },
  running: { label: "진행 중", tone: "wait" },
  done: { label: "진행 완료", tone: "ok" },
  failed: { label: "실패", tone: "bad" },
};

const TONE_CLASS = {
  ok: "bg-[#e9f9f0] text-[#12804b]",
  wait: "bg-[#fff4dc] text-[#a96700]",
  bad: "bg-[#ffe9eb] text-[#a3323f]",
};

const DOT_CLASS = {
  ok: "bg-[#20ad6a]",
  wait: "bg-[#f1a72b] animate-pulse",
  bad: "bg-[#d4485a]",
};

function StateBadge({ state, step }) {
  const meta = STATE_META[state] || STATE_META.done;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${TONE_CLASS[meta.tone]}`}
      title={step || meta.label}
    >
      <span className={`size-1.5 rounded-full ${DOT_CLASS[meta.tone]}`} />
      {meta.label}
    </span>
  );
}

function CountryChip({ code }) {
  // 나라를 아직 안 정한 코스가 있다. 이 창구가 생기기 전에 올린 것들이고, 빈칸으로
  // 두는 것이 맞다 — 사람이 확인한 적 없는 나라를 붙이면 나중에 나라별로 가를 때 틀린다.
  if (!code) {
    return <span className="rounded-md bg-[#f1f2f7] px-2 py-0.5 text-[11px] font-semibold text-[#9aa0b0]">나라 미지정</span>;
  }
  const meta = COUNTRY_META[code];
  return (
    <span className="rounded-md bg-[#eef0f8] px-2 py-0.5 text-[11px] font-semibold text-[#4a5170]">
      {meta ? `${meta.flag} ${meta.name}` : code}
    </span>
  );
}

function CourseCard({ course, onOpen, deleting, onDelete, onAskDelete, onCancelDelete }) {
  const inFlight = course.state === "queued" || course.state === "running";
  // 반영이 아직 도는 코스는 코스 번호가 없다 — 열 것이 없다.
  const openable = Boolean(course.courseId);

  // **카드 통째가 여는 자리다.** 캐시된 코스 화면과 같게 맞춘 것이고, 카드 안에서
  // 누를 만한 곳이 '수정' 버튼 하나뿐이라 나머지 면적이 죽어 있었다. 내리기만 따로
  // 남기고(되돌릴 수 없는 동작이라 카드를 여는 손짓에 섞이면 안 된다) 전파를 끊는다.
  const open = () => {
    if (openable) onOpen(course);
  };

  return (
    <article
      role={openable ? "button" : undefined}
      tabIndex={openable ? 0 : undefined}
      aria-label={openable ? `${course.name || "이름 없음"} 열어서 고치기` : undefined}
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      }}
      className={`group flex h-full flex-col rounded-2xl border border-[#e1e4ed] bg-white p-4 shadow-[0_10px_35px_rgba(31,36,66,0.05)] transition ${
        openable
          ? "cursor-pointer hover:border-brand hover:shadow-[0_14px_40px_rgba(31,36,66,0.1)]"
          : ""
      }`}
    >
      {/* 대표 사진은 **첫 자리의 매장 사진**이다. 손님 목록 카드가 쓰는 것과 같다. */}
      <CardHero hero={course.heroImageUrl ? { url: course.heroImageUrl } : null} name={course.name} />

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <strong className="block truncate text-[17px] font-bold text-[#171b30]">
            {course.name || "이름 없음"}
          </strong>
          <span className="mt-0.5 block text-[11px] text-[#9aa0b0]">
            {course.celebrity ? `${course.celebrity} 코스` : "코스"}
            {course.courseId ? ` · #${course.courseId}` : ""}
          </span>
        </div>
        <StateBadge state={course.state} step={course.step} />
      </div>

      {course.description ? (
        <p className="mt-3 line-clamp-2 text-[13px] leading-5 text-[#5b6076]">{course.description}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <CountryChip code={course.countryCode} />
        <span className="rounded-md bg-[#eef0f8] px-2 py-0.5 text-[11px] font-semibold text-[#4a5170]">
          자리 {course.placeCount}
        </span>
        <span className="rounded-md bg-[#eef0f8] px-2 py-0.5 text-[11px] font-semibold text-[#4a5170]">
          사진 {course.imageCount}
        </span>
      </div>

      {course.error ? (
        <p className="mt-3 rounded-xl bg-[#fff9f9] px-3 py-2 text-[11px] leading-4 text-[#a3323f]">
          {course.error}
        </p>
      ) : null}

      {/* 만료가 없다. 남은 시간 대신 언제 만들고 언제 고쳤나를 보여 준다. */}
      <dl className="mt-4 space-y-1 text-[11px] text-[#9aa0b0]">
        <div className="flex justify-between gap-2">
          <dt>올린 때</dt>
          <dd className="font-semibold text-[#5b6076]">{formatAdminDate(course.createdAt)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>마지막 수정</dt>
          <dd className="font-semibold text-[#5b6076]">
            {course.updatedAt ? formatAdminDate(course.updatedAt) : "없음"}
          </dd>
        </div>
      </dl>

      <div className="mt-auto flex items-center gap-2 border-t border-[#eef0f5] pt-3">
        <span className="flex-1 text-[11px] font-bold text-[#9aa0b0] group-hover:text-brand">
          {inFlight ? "반영 중… 끝나면 열 수 있습니다" : openable ? "눌러서 지도와 함께 고치기" : "코스 번호가 아직 없습니다"}
        </span>
        {/* **두 번 눌러야 나간다.** 지운 것을 되돌리는 창구가 없다 — 다시 올리려면
            셀럽 편집기에서 다시 승인해야 한다. */}
        {deleting ? (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(course);
              }}
              className="rounded-xl bg-[#d4485a] px-3 py-2 text-xs font-bold text-white"
            >
              정말 내립니다
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onCancelDelete();
              }}
              className="rounded-xl border border-[#dfe2ec] px-3 py-2 text-xs font-bold text-[#5b6076]"
            >
              취소
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onAskDelete(course.courseId);
            }}
            disabled={!openable}
            className="rounded-xl border border-[#dfe2ec] px-3 py-2 text-xs font-bold text-[#a3323f] disabled:cursor-not-allowed disabled:text-[#c9ccd8]"
          >
            내리기
          </button>
        )}
      </div>
    </article>
  );
}

export function AdminSystemCourseView() {
  // 목록 읽기는 트렌드 화면들과 **같은 훅**을 쓴다. 첫 로드에서 setState 를 이펙트
  // 본문에 직접 부르지 않는 짜임이 거기 이미 있다.
  const { data: courses, error: loadError, reload } = useAdminTrendArtifact(getSystemCourses);
  const [actionError, setActionError] = useState(null);
  const [detail, setDetail] = useState(null);
  const [opening, setOpening] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const error = actionError || loadError;

  // 반영은 뒤에서 1~2분간 돈다. 도는 것이 하나라도 있으면 목록을 다시 읽어 관리자가
  // 새로고침을 안 눌러도 "진행 중 → 진행 완료" 가 바뀌게 한다. 다 끝나면 멈춘다 —
  // 가만히 있는 화면이 계속 요청을 보내면 안 된다.
  const inFlight = useMemo(
    () => (courses || []).some((c) => c.state === "queued" || c.state === "running"),
    [courses],
  );

  useEffect(() => {
    if (!inFlight) return undefined;
    const timer = setInterval(reload, 5000);
    return () => clearInterval(timer);
  }, [inFlight, reload]);

  // 카드가 사진과 자리 수만 들고 있어, 전문(자리 목록·게시글 본문)은 **열 때만** 받는다.
  //
  // 받는 중에 닫거나 다른 카드를 누를 수 있다. 그때 먼저 보낸 요청이 뒤늦게 돌아와
  // 팝업을 도로 열지 않도록, 몇 번째 요청인지를 들고 있다가 최신 것만 반영한다.
  const openSeq = useRef(0);

  const open = useCallback(async (course) => {
    const seq = ++openSeq.current;
    setOpening(true);
    setActionError(null);
    try {
      const next = await getSystemCourse(course.courseId);
      if (openSeq.current === seq) setDetail(next);
    } catch (err) {
      if (openSeq.current === seq) setActionError(err);
    } finally {
      if (openSeq.current === seq) setOpening(false);
    }
  }, []);

  // 받는 중에 닫으면 `opening` 이 남아 팝업이 안 닫힌다. 둘을 같이 끄고, 도는 요청을
  // 버린다.
  const close = useCallback(() => {
    openSeq.current += 1;
    setDetail(null);
    setOpening(false);
  }, []);

  const remove = useCallback(async (course) => {
    try {
      await deleteSystemCourse(course.courseId);
      setDeletingId(null);
      await reload();
    } catch (err) {
      setActionError(err);
    }
  }, [reload]);

  if (loadError && !courses) {
    return <ArtifactError error={loadError} onRetry={reload} />;
  }
  if (!courses) {
    return <ArtifactLoading />;
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-[#5b6076]">
          지금 메인과 코스 추천 리스트에 걸려 있는 코스 <b>{courses.length}</b>건.
          만료가 없어 내릴 때까지 계속 걸립니다.
        </p>
        <button
          type="button"
          onClick={reload}
          className="rounded-xl border border-[#dfe2ec] bg-white px-4 py-2 text-xs font-bold text-[#3d4258]"
        >
          새로고침
        </button>
      </div>

      {error ? (
        <p className="mb-4 rounded-xl bg-[#fff9f9] px-4 py-3 text-[12px] text-[#a3323f]">
          {error.message || "요청에 실패했습니다."}
        </p>
      ) : null}

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-[#e5e7ef] bg-white p-10 text-center">
          <h2 className="font-bold text-[#171b30]">아직 걸린 코스가 없습니다</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7a8095]">
            승인 대기 코스에서 <b>기본 추천 코스로 승인</b>을 누르면 여기에 올라옵니다.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.courseId ?? `pending-${course.celebrity}`}
              course={course}
              onOpen={open}
              deleting={deletingId === course.courseId}
              onDelete={remove}
              onAskDelete={setDeletingId}
              onCancelDelete={() => setDeletingId(null)}
            />
          ))}
        </div>
      )}

      {/* 캐시된 코스 편집기와 **같은 크기의 팝업**이다. 지도가 한쪽을 통째로 쓰므로
          680px 로는 코스도 지도도 못 본다. */}
      <Modal
        open={Boolean(detail) || opening}
        onClose={close}
        labelledBy="system-course-editor"
        panelClassName="h-[92dvh] w-[92vw] max-w-[1680px] overflow-hidden rounded-[24px] border border-[#e1e4ed] bg-white shadow-[0_30px_90px_rgba(20,24,50,0.28)]"
      >
        {detail ? (
          <AdminSystemCourseEditor
            key={detail.courseId}
            detail={detail}
            onClose={close}
            onSaved={() => {
              close();
              // 목록을 다시 읽는다. 수정이 `updated_at` 을 바꾸는데 그 값은 서버가
              // 정하므로, 손에 든 것으로 덮어쓰면 카드의 "마지막 수정" 이 안 맞는다.
              reload();
            }}
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
