"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "@/components/common/modal";
import { getAdminCourseRun, getAdminCourses } from "@/lib/api/admin-courses";
import { clearCachedDrafts, getAdminCourseCached } from "@/lib/api/admin-course-cache";
import { useAdminTrendArtifact } from "@/hooks/use-admin-trend-artifact";
import { ArtifactError, ArtifactLoading, CardHero, ttlLabel } from "./admin-artifact-ui";
import { AdminCourseEditor } from "./admin-course-editor";

// 초안은 `ditto-celeb-warm-2` 배치가 만들어 Redis 에 하루 두는 것이고, 관리자가 승인해야
// 손님에게 나간다. 이 화면은 초안을 카드로 늘어놓고, 고르면 팝업 편집기를 연다 —
// 화면을 통째로 바꾸지 않는 것은 관리자가 목록으로 돌아오는 비용을 없애기 위해서다.

// **목록을 받은 뒤 각 초안의 전문을 미리 받아 둔다.** 목록 창구는 머리말만 주는데
// 카드에 얹을 사진이 거기 없다. 미리 받으면 사진이 생기고, 카드를 눌렀을 때 편집기가
// 기다림 없이 열린다 — 어차피 열면 받을 것을 미리 받는 것뿐이다.
//
// 대가는 첫 로딩이 인물 수만큼 무거워지는 것이다(초안 하나가 조사 원문까지 들고 있어
// 수십 KB). 배치가 한 번에 10명까지만 돌리므로(`DITTO_CELEB_MAX`) 실제로는 열 건이
// 상한이고, 그래도 늘어날 때를 대비해 여기서 한 번 더 끊는다.
//
// 더 싼 길은 람다의 `{"drafts":true}` 창구가 대표 사진 한 장을 같이 주는 것이다.
// 그쪽은 어차피 문서를 통째로 읽어 머리말을 만들고 있어 한 줄이면 된다.
const PREFETCH_LIMIT = 12;

function statusTone(status) {
  if (status === "ok") return "bg-[#e9f9f0] text-[#12804b]";
  return "bg-[#fff4dc] text-[#a96700]";
}

/** 카드에 얹을 대표 사진. 근거 사진을 먼저 고른다 — 그게 이 초안의 얼굴이다. */
function heroOf(detail) {
  const places = detail?.payload?.places;
  if (!Array.isArray(places)) return null;
  const evidence = places.find((place) => place.image?.kind === "evidence" && place.image?.url);
  const any = places.find((place) => place.image?.url);
  const picked = evidence || any;
  return picked ? { ...picked.image, place_name: picked.place_name } : null;
}

function DraftCard({ draft, hero, loading, onOpen }) {
  const warnings = Number(draft.warnings) || 0;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full flex-col rounded-2xl border border-[#e1e4ed] bg-white p-4 text-left shadow-[0_10px_35px_rgba(31,36,66,0.05)] transition hover:-translate-y-0.5 hover:border-brand hover:shadow-[0_16px_45px_rgba(92,46,245,0.12)]"
    >
      <CardHero hero={hero} name={draft.celebrity} loading={loading} />

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <strong className="block truncate text-[17px] font-bold text-[#171b30]">
            {draft.celebrity}
          </strong>
          <span className="mt-0.5 block text-[11px] text-[#9aa0b0]">
            {draft.kind === "GROUP" ? "그룹" : "개인"}
          </span>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusTone(draft.status)}`}
        >
          {draft.status}
        </span>
      </div>

      <p className="mt-3 text-sm font-semibold text-[#4c5164]">{draft.shape || "코스 없음"}</p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-[#f2f3f7] px-2.5 py-1 text-[11px] font-bold text-[#6d7387]">
          자리 {draft.places ?? 0}
        </span>
        {warnings > 0 ? (
          <span className="rounded-full bg-[#fff4dc] px-2.5 py-1 text-[11px] font-bold text-[#a96700]">
            경고 {warnings}
          </span>
        ) : (
          <span className="rounded-full bg-[#e9f9f0] px-2.5 py-1 text-[11px] font-bold text-[#12804b]">
            경고 없음
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-[11px] text-[#9aa0b0]">
        <span>{ttlLabel(draft.ttl)}</span>
        <span className="font-bold text-brand">열어서 편집 →</span>
      </div>
    </button>
  );
}

function RunStrip({ run, onReload }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e2e5ef] bg-white px-5 py-4 shadow-[0_8px_30px_rgba(25,30,60,0.04)]">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {run ? (
          <>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                run.queued > 0 ? "bg-[#fff4dc] text-[#a96700]" : "bg-[#e9f9f0] text-[#12804b]"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${run.queued > 0 ? "bg-[#f1a72b]" : "bg-[#20ad6a]"}`}
              />
              {run.queued > 0 ? `배치 진행 중 · 대기 ${run.queued}명` : "배치 대기 없음"}
            </span>
            <span className="font-semibold text-[#687087]">{run.date} 실행</span>
            <span className="h-3 w-px bg-[#dfe2eb]" />
            <span className="text-[#8a90a3]">끝난 인물 {run.doneCount}명</span>
          </>
        ) : (
          // /run 이 502 여도 목록은 볼 수 있어야 한다. 배치 상황만 접는다.
          <span className="text-[#9aa0b0]">배치 실행 상황을 읽지 못했습니다.</span>
        )}
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

export function AdminCourseView() {
  const { data: list, error, loading, reload } = useAdminTrendArtifact(getAdminCourses);
  const { data: run, reload: reloadRun } = useAdminTrendArtifact(getAdminCourseRun);

  const [opened, setOpened] = useState(null);
  const [details, setDetails] = useState({});
  // 이미 부른 인물. 상태(details)를 의존성에 넣으면 응답이 올 때마다 effect 가 다시 돌아
  // 서로를 깨우므로, 부른 적 있다는 사실만 ref 에 둔다.
  const requested = useRef(new Set());

  const drafts = useMemo(() => {
    const rows = list?.payload?.drafts;
    return Array.isArray(rows) ? rows : [];
  }, [list]);

  // 미리 받을 인물 + 지금 연 인물. 상한을 넘긴 인물은 눌렀을 때 받는다.
  const wanted = useMemo(() => {
    const names = drafts.slice(0, PREFETCH_LIMIT).map((draft) => draft.celebrity);
    if (opened && !names.includes(opened)) names.push(opened);
    return names;
  }, [drafts, opened]);

  useEffect(() => {
    let active = true;

    wanted.forEach((name) => {
      if (requested.current.has(name)) return;
      requested.current.add(name);

      getAdminCourseCached(name)
        .then((data) => {
          if (active) setDetails((prev) => ({ ...prev, [name]: { data, error: null } }));
        })
        .catch((nextError) => {
          if (active) setDetails((prev) => ({ ...prev, [name]: { data: null, error: nextError } }));
        });
    });

    return () => {
      active = false;
    };
  }, [wanted]);

  const reloadAll = useCallback(() => {
    // 새로고침은 캐시까지 비운다 — 배치가 다시 돌았을 수 있다.
    clearCachedDrafts();
    requested.current = new Set();
    setDetails({});
    reload();
    reloadRun();
  }, [reload, reloadRun]);

  const close = useCallback(() => setOpened(null), []);

  // 승인하면 그 인물의 초안이 Redis 에서 사라진다. 목록을 다시 받으면 카드가
  // 빠지는데, 그게 관리자가 보는 성공 신호다.
  const afterApprove = useCallback(
    (celebrity, result) => {
      const warnings = result?.warnings;
      close();
      reloadAll();
      if (Array.isArray(warnings) && warnings.length) {
        // 올라가긴 했는데 원장 반영이 일부 빠진 경우다. 조용히 넘기면 안 된다.
        window.alert(`${celebrity} 승인됨 — 확인할 것:\n· ${warnings.join("\n· ")}`);
      }
    },
    [close, reloadAll],
  );

  const openedEntry = opened ? details[opened] : null;

  if (loading) return <ArtifactLoading />;
  if (error) return <ArtifactError error={error} onRetry={reloadAll} />;

  return (
    <section>
      <RunStrip run={run} onReload={reloadAll} />

      {drafts.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {drafts.map((draft) => {
            const entry = details[draft.celebrity];
            return (
              <DraftCard
                key={draft.celebrity}
                draft={draft}
                hero={heroOf(entry?.data)}
                loading={!entry}
                onOpen={() => setOpened(draft.celebrity)}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#e5e7ef] bg-white p-16 text-center">
          <p className="text-sm font-bold text-[#4c5164]">승인 대기 중인 초안이 없습니다.</p>
          <p className="mt-1.5 text-xs text-[#9095a6]">
            배치가 아직 안 돌았거나 하루가 지나 만료됐습니다.
          </p>
        </div>
      )}

      {/* 전체 화면을 갈아치우지 않고 팝업으로 연다 — 목록으로 돌아오는 비용을 없앤다.
          대신 지도와 경로가 들어가므로 넉넉하게 잡는다. */}
      <Modal
        open={Boolean(opened)}
        onClose={close}
        labelledBy="admin-course-editor-title"
        panelClassName="h-[92dvh] w-[92vw] max-w-[1680px] overflow-hidden rounded-[24px] border border-[#e1e4ed] bg-white shadow-[0_30px_90px_rgba(20,24,50,0.28)]"
      >
        {openedEntry?.error ? (
          <div className="flex h-full flex-col justify-center p-8">
            <ArtifactError
              error={openedEntry.error}
              onRetry={() => {
                requested.current.delete(opened);
                setDetails((prev) => {
                  const next = { ...prev };
                  delete next[opened];
                  return next;
                });
              }}
            />
            <button
              type="button"
              onClick={close}
              className="mx-auto mt-4 rounded-xl border border-[#dfe2ec] bg-white px-6 py-2 text-xs font-bold text-[#4d536a]"
            >
              닫기
            </button>
          </div>
        ) : openedEntry?.data ? (
          <AdminCourseEditor
            // 인물이 바뀌면 편집 상태를 새로 시작한다. 안 그러면 앞 인물의 수정이 남는다.
            key={openedEntry.data.celebrity}
            detail={openedEntry.data}
            onClose={close}
            onApproved={afterApprove}
          />
        ) : (
          <div className="flex h-full items-center justify-center gap-3 text-sm font-semibold text-[#596078]">
            <span className="size-5 animate-spin rounded-full border-2 border-[#d9ddef] border-t-brand" />
            초안을 불러오는 중
          </div>
        )}
      </Modal>
    </section>
  );
}
