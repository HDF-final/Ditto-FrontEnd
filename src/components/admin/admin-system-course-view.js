"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/common/modal";
import {
  deleteSystemCourse,
  getSystemCourse,
  getSystemCourses,
  updateSystemCourse,
} from "@/lib/api/admin-system-courses";
import { useAdminTrendArtifact } from "@/hooks/use-admin-trend-artifact";
import {
  ArtifactError,
  ArtifactLoading,
  COUNTRY_META,
  formatAdminDate,
} from "./admin-artifact-ui";

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

  return (
    <article className="flex h-full flex-col rounded-2xl border border-[#e1e4ed] bg-white p-4 shadow-[0_10px_35px_rgba(31,36,66,0.05)]">
      <div className="flex items-start justify-between gap-3">
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

      <div className="mt-4 flex gap-2 border-t border-[#eef0f5] pt-3">
        <button
          type="button"
          onClick={() => onOpen(course)}
          disabled={!course.courseId}
          className="flex-1 rounded-xl bg-[#231f35] px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:bg-[#c9ccd8]"
        >
          {inFlight ? "반영 중…" : "수정"}
        </button>
        {/* **두 번 눌러야 나간다.** 지운 것을 되돌리는 창구가 없다 — 다시 올리려면
            셀럽 편집기에서 다시 승인해야 한다. */}
        {deleting ? (
          <>
            <button
              type="button"
              onClick={() => onDelete(course)}
              className="rounded-xl bg-[#d4485a] px-3 py-2 text-xs font-bold text-white"
            >
              정말 내립니다
            </button>
            <button
              type="button"
              onClick={onCancelDelete}
              className="rounded-xl border border-[#dfe2ec] px-3 py-2 text-xs font-bold text-[#5b6076]"
            >
              취소
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onAskDelete(course.courseId)}
            disabled={!course.courseId}
            className="rounded-xl border border-[#dfe2ec] px-3 py-2 text-xs font-bold text-[#a3323f] disabled:cursor-not-allowed disabled:text-[#c9ccd8]"
          >
            내리기
          </button>
        )}
      </div>
    </article>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-bold text-[#3d4258]">{label}</span>
      {hint ? <span className="mt-0.5 block text-[11px] text-[#9aa0b0]">{hint}</span> : null}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const INPUT_CLASS =
  "w-full rounded-xl border border-[#dfe2ec] px-3 py-2 text-[13px] text-[#171b30] outline-none focus:border-brand";

function CourseEditor({ detail, onClose, onSaved }) {
  const [name, setName] = useState(detail.name || "");
  const [description, setDescription] = useState(detail.description || "");
  const [countryCode, setCountryCode] = useState(detail.countryCode || "");
  const [postContent, setPostContent] = useState(detail.postContent || "");
  const [reasons, setReasons] = useState(() =>
    Object.fromEntries((detail.places || []).map((p) => [p.placeId, p.recommendationReason || ""])),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const nameTooLong = name.trim().length > 100;
  const nameEmpty = !name.trim();

  const save = useCallback(async () => {
    if (saving || nameEmpty || nameTooLong) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await updateSystemCourse(detail.courseId, {
        name: name.trim(),
        description,
        countryCode,
        postContent,
        places: Object.entries(reasons).map(([placeId, recommendationReason]) => ({
          placeId: Number(placeId),
          recommendationReason,
        })),
      });
      onSaved(saved);
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  }, [saving, nameEmpty, nameTooLong, detail.courseId, name, description, countryCode,
      postContent, reasons, onSaved]);

  return (
    <div className="flex max-h-[86vh] flex-col">
      <header className="flex items-start justify-between gap-3 border-b border-[#eef0f5] px-6 py-4">
        <div className="min-w-0">
          <h2 id="system-course-editor" className="truncate text-[17px] font-bold text-[#171b30]">
            {detail.name}
          </h2>
          <p className="mt-0.5 text-[11px] text-[#9aa0b0]">
            코스 #{detail.courseId}
            {detail.celebrity ? ` · ${detail.celebrity}` : ""}
            {detail.shareCode ? ` · ${detail.shareCode}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-sm text-[#9aa0b0] hover:bg-[#f3f4f9]"
        >
          닫기
        </button>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <div className="rounded-xl bg-[#f6f7fb] px-4 py-3 text-[12px] leading-5 text-[#5b6076]">
          여기서 고치는 것은 <b>문안과 나라</b>입니다. 어느 매장을 몇 번째로 넣을지는
          <b> 승인 대기·캐시된 코스</b> 화면의 편집기에서 고쳐 다시 승인하면 이 코스를
          덮어씁니다.
        </div>

        <Field label="코스 이름" hint="목록 카드와 코스 상세의 제목. 100자까지.">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${INPUT_CLASS} ${nameEmpty || nameTooLong ? "border-[#d4485a]" : ""}`}
          />
          {nameTooLong ? (
            <span className="mt-1 block text-[11px] font-semibold text-[#a3323f]">
              {name.trim().length}자 — 100자를 넘을 수 없습니다
            </span>
          ) : null}
          {nameEmpty ? (
            <span className="mt-1 block text-[11px] font-semibold text-[#a3323f]">
              이름이 비면 목록 카드가 제목 없이 그려집니다
            </span>
          ) : null}
        </Field>

        <Field label="한 줄 설명" hint="카드 밑에 붙는 문장.">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={INPUT_CLASS}
          />
        </Field>

        <Field label="나라" hint="비워 두면 나라를 안 가리고 모든 목록에 나옵니다.">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">나라 미지정</option>
            {Object.entries(COUNTRY_META).map(([code, meta]) => (
              <option key={code} value={code}>
                {meta.flag} {meta.name} ({code})
              </option>
            ))}
          </select>
        </Field>

        <Field label="코스 소개 문안" hint="코스를 소개하는 본문. 커뮤니티에는 안 나갑니다.">
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            rows={5}
            className={INPUT_CLASS}
            disabled={!detail.postId}
          />
          {!detail.postId ? (
            <span className="mt-1 block text-[11px] text-[#9aa0b0]">
              이 코스에는 소개 문안이 없습니다 (게시글이 안 붙어 있습니다)
            </span>
          ) : null}
        </Field>

        <div>
          <span className="block text-[12px] font-bold text-[#3d4258]">자리별 추천 이유</span>
          <span className="mt-0.5 block text-[11px] text-[#9aa0b0]">
            코스 상세에서 장소 이름 밑에 한 줄로 붙습니다. 15~30자가 적당합니다.
          </span>
          <ul className="mt-2 space-y-2">
            {(detail.places || []).map((place) => (
              <li
                key={place.placeId}
                className="flex items-center gap-3 rounded-xl border border-[#eef0f5] p-2.5"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#eef0f8] text-[11px] font-bold text-[#4a5170]">
                  {place.visitOrder}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-bold text-[#171b30]">
                    {place.name}
                    <em className="ml-1.5 not-italic text-[11px] font-semibold text-[#9aa0b0]">
                      {place.floorCode}
                    </em>
                  </span>
                  <input
                    value={reasons[place.placeId] ?? ""}
                    onChange={(e) =>
                      setReasons((prev) => ({ ...prev, [place.placeId]: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-[#dfe2ec] px-2 py-1 text-[12px] text-[#171b30] outline-none focus:border-brand"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {Array.isArray(detail.warnings) && detail.warnings.length > 0 ? (
          <div className="rounded-xl bg-[#fffaf2] px-4 py-3">
            <strong className="text-[12px] font-bold text-[#a96700]">
              반영할 때 남은 경고 {detail.warnings.length}건
            </strong>
            <ul className="mt-1.5 space-y-1">
              {detail.warnings.map((w) => (
                <li key={w} className="text-[11px] leading-4 text-[#8a6a30]">· {w}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <footer className="border-t border-[#eef0f5] px-6 py-4">
        {error ? (
          <p className="mb-3 rounded-xl bg-[#fff9f9] px-3 py-2 text-[12px] text-[#a3323f]">
            {error.message || "저장에 실패했습니다."}
          </p>
        ) : null}
        <button
          type="button"
          onClick={save}
          disabled={saving || nameEmpty || nameTooLong}
          className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-[#c9ccd8]"
        >
          {saving ? "저장하는 중…" : "저장하고 바로 반영"}
        </button>
        <p className="mt-2 text-center text-[11px] text-[#9aa0b0]">
          저장하면 손님 화면에 바로 나갑니다.
        </p>
      </footer>
    </div>
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

  const open = useCallback(async (course) => {
    setOpening(true);
    setActionError(null);
    try {
      setDetail(await getSystemCourse(course.courseId));
    } catch (err) {
      setActionError(err);
    } finally {
      setOpening(false);
    }
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

      <Modal
        open={Boolean(detail) || opening}
        onClose={() => setDetail(null)}
        labelledBy="system-course-editor"
        panelClassName="w-[min(680px,94vw)] overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_rgba(20,24,45,0.28)]"
      >
        {detail ? (
          <CourseEditor
            detail={detail}
            onClose={() => setDetail(null)}
            onSaved={() => {
              setDetail(null);
              // 목록을 다시 읽는다. 수정이 `updated_at` 을 바꾸는데 그 값은 서버가
              // 정하므로, 손에 든 것으로 덮어쓰면 카드의 "마지막 수정" 이 안 맞는다.
              reload();
            }}
          />
        ) : (
          <div className="px-6 py-10 text-center text-sm text-[#7a8095]">불러오는 중…</div>
        )}
      </Modal>
    </section>
  );
}
