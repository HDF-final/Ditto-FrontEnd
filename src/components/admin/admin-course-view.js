"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAdminCourse,
  getAdminCourseRun,
  getAdminCourses,
} from "@/lib/api/admin-courses";
import { useAdminTrendArtifact } from "@/hooks/use-admin-trend-artifact";
import { ArtifactError, ArtifactLoading, WarningPanel, formatAdminDate } from "./admin-artifact-ui";

// 초안은 `ditto-celeb-warm-2` 배치가 만들어 Redis 에 하루 두는 것이고, 관리자가 승인해야
// 손님에게 나간다. 이 화면은 그것을 **읽기만** 한다 — 승인·거절 창구는 아직 없다.

const KIND_STYLE = {
  매장: "bg-[#eee9ff] text-brand",
  음식점: "bg-[#ffeef2] text-[#c53a63]",
  카페: "bg-[#fff2e2] text-[#a5650f]",
  여가: "bg-[#e6f6ef] text-[#12804b]",
};

function statusTone(status) {
  if (status === "ok") return "bg-[#e9f9f0] text-[#12804b]";
  return "bg-[#fff4dc] text-[#a96700]";
}

function ttlLabel(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value <= 0) return "만료됨";
  const hours = Math.floor(value / 3600);
  if (hours >= 1) return `${hours}시간 뒤 만료`;
  return `${Math.max(1, Math.floor(value / 60))}분 뒤 만료`;
}

function hostOf(url) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

/**
 * 근거 사진.
 *
 * `next/image` 를 안 쓴다 — 사진이 기사에서 온 것이라 호스트를 미리 알 수 없는데
 * `next.config.mjs` 의 `remotePatterns` 는 호스트를 열거해야 통과시킨다. 원본이 핫링크를
 * 막거나 사진이 사라지는 일도 흔해서, 실패하면 자리를 접는다.
 */
function DraftPhoto({ image, alt }) {
  const [failed, setFailed] = useState(false);
  if (!image?.url || failed) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.url}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="size-[132px] shrink-0 rounded-xl border border-[#e6e8f0] bg-[#f6f7fb] object-cover"
    />
  );
}

function RunStrip({ run, onReload, reloading }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e2e5ef] bg-white px-5 py-4 shadow-[0_8px_30px_rgba(25,30,60,0.04)]">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {run ? (
          <>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${run.queued > 0 ? "bg-[#fff4dc] text-[#a96700]" : "bg-[#e9f9f0] text-[#12804b]"}`}>
              <span className={`size-1.5 rounded-full ${run.queued > 0 ? "bg-[#f1a72b]" : "bg-[#20ad6a]"}`} />
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
        disabled={reloading}
        className="inline-flex items-center gap-2 rounded-xl border border-[#dfe2ec] bg-white px-4 py-2 text-xs font-bold text-[#4d536a] transition hover:border-[#c8bdfd] hover:text-brand disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 11a8.1 8.1 0 1 0 2 5.3"/><path d="M20 4v7h-7"/></svg>
        새로고침
      </button>
    </div>
  );
}

function DraftList({ drafts, selected, onSelect }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e1e4ed] bg-white shadow-[0_14px_45px_rgba(31,36,66,0.05)]">
      <div className="flex items-center justify-between gap-3 border-b border-[#eceef4] px-5 py-4">
        <h2 className="text-sm font-bold">승인 대기 초안</h2>
        <span className="rounded-full bg-[#f2efff] px-2.5 py-1 text-[11px] font-bold text-brand">{drafts.length}건</span>
      </div>
      <ul className="max-h-[70dvh] divide-y divide-[#eff1f6] overflow-y-auto">
        {drafts.map((draft) => {
          const active = draft.celebrity === selected;
          return (
            <li key={draft.celebrity}>
              <button
                type="button"
                onClick={() => onSelect(draft.celebrity)}
                aria-current={active ? "true" : undefined}
                className={`w-full px-5 py-4 text-left transition-colors ${active ? "bg-[#f6f3ff]" : "hover:bg-[#fafaff]"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <strong className="truncate text-sm text-[#20243a]">{draft.celebrity}</strong>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusTone(draft.status)}`}>{draft.status}</span>
                </div>
                <p className="mt-1.5 truncate text-xs text-[#8a90a3]">{draft.shape || "코스 없음"}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#9aa0b0]">
                  <span>장소 {draft.places ?? 0}</span>
                  {draft.warnings > 0 ? <span className="font-bold text-[#a96700]">경고 {draft.warnings}</span> : null}
                  <span>· {ttlLabel(draft.ttl)}</span>
                </p>
              </button>
            </li>
          );
        })}
        {!drafts.length ? (
          <li className="px-5 py-16 text-center text-sm text-[#9095a6]">
            승인 대기 중인 초안이 없습니다.
            <span className="mt-1 block text-xs">배치가 아직 안 돌았거나 하루가 지나 만료됐습니다.</span>
          </li>
        ) : null}
      </ul>
    </div>
  );
}

function EvidenceLine({ evidence }) {
  if (!evidence?.sentence && !evidence?.article) return null;
  return (
    <div className="mt-3 rounded-xl bg-[#f8f7fd] px-3.5 py-3">
      {evidence.brand ? (
        <p className="text-[11px] font-bold tracking-[0.04em] text-brand">
          {evidence.person ? `${evidence.person} × ` : ""}{evidence.brand}
        </p>
      ) : null}
      {evidence.sentence ? <p className="mt-1.5 text-xs leading-5 text-[#5b6076]">{evidence.sentence}</p> : null}
      {evidence.article ? (
        <a href={evidence.article} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[11px] font-semibold text-[#6f55d9] hover:underline">
          근거 기사 · {hostOf(evidence.article)}
        </a>
      ) : null}
    </div>
  );
}

function PlaceCard({ place, index }) {
  const image = place.image;
  const evidenceReason = place.reason_kind === "evidence";

  return (
    <li className="flex gap-4 rounded-2xl border border-[#e5e7ef] bg-white p-4">
      <div className="flex flex-col items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-lg bg-[#f3f4f7] text-xs font-black text-[#777d90]">{index + 1}</span>
        {/* URL 을 key 로 준다. 인물을 바꿨을 때 슬롯 번호가 겹치면 React 가 같은 자리로 보고
            앞 사진의 "실패했다" 상태를 물려줘, 멀쩡한 사진이 안 뜬다. */}
        <DraftPhoto key={image?.url} image={image} alt={image?.caption || place.place_name} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <strong className="text-[15px] text-[#20243a]">{place.place_name}</strong>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${KIND_STYLE[place.kind] || "bg-[#f3f4f7] text-[#777d90]"}`}>{place.kind}</span>
          <span className="font-mono text-[11px] text-[#a3a8b8]">{place.navigation_key}</span>
        </div>

        <p className="mt-1 text-[11px] text-[#9aa0b0]">
          {[place.floor, place.place_type, place.category, place.price_tier].filter(Boolean).join(" · ")}
        </p>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${evidenceReason ? "bg-[#eee9ff] text-brand" : "bg-[#f1f2f6] text-[#787f92]"}`}>
            {evidenceReason ? "셀럽 근거" : "동선"}
          </span>
          {image?.url ? (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${image.kind === "evidence" ? "bg-[#e6f6ef] text-[#12804b]" : "bg-[#f1f2f6] text-[#787f92]"}`}>
              {image.kind === "evidence" ? "근거 사진" : "매장 사진"}
            </span>
          ) : (
            <span className="rounded-full bg-[#ffeef0] px-2 py-0.5 text-[10px] font-bold text-[#c0392b]">사진 없음</span>
          )}
          {place.filled ? (
            <span className="rounded-full bg-[#fff4dc] px-2 py-0.5 text-[10px] font-bold text-[#a96700]" title="코스 모양을 맞추려고 채운 자리입니다">
              자리 채움
            </span>
          ) : null}
        </div>

        <p className="mt-3 text-sm leading-6 text-[#4c5164]">{place.reason}</p>

        <EvidenceLine evidence={place.evidence} />

        {image?.url ? (
          <p className="mt-2 text-[11px] text-[#9aa0b0]">
            사진 {image.caption ? `“${image.caption}” · ` : ""}
            <a href={image.article || image.url} target="_blank" rel="noreferrer" className="font-semibold text-[#6f55d9] hover:underline">
              {image.source || hostOf(image.url)}
            </a>
          </p>
        ) : null}

        {place.alternates?.length ? (
          <details className="mt-3">
            <summary className="cursor-pointer text-[11px] font-bold text-[#7b8195]">차순위 후보 {place.alternates.length}곳</summary>
            <ul className="mt-2 space-y-1 text-[11px] text-[#8a90a3]">
              {place.alternates.map((alternate) => (
                <li key={alternate.navigation_key}>
                  {alternate.place_name}
                  <span className="ml-1.5 font-mono text-[10px] text-[#adb2c0]">{alternate.navigation_key}</span>
                  {alternate.floor ? <span className="ml-1.5">{alternate.floor}</span> : null}
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </li>
  );
}

function RawJson({ title, value }) {
  if (value === null || value === undefined) return null;
  return (
    <details className="mt-3 rounded-2xl border border-[#e5e7ef] bg-white px-5 py-4">
      <summary className="cursor-pointer text-sm font-bold text-[#4d536a]">{title}</summary>
      <pre className="mt-3 max-h-[420px] overflow-auto rounded-xl bg-[#f7f8fb] p-4 text-[11px] leading-5 text-[#4c5164]">
        {JSON.stringify(value, null, 2)}
      </pre>
    </details>
  );
}

function DraftDetail({ detail, loading, error, onRetry }) {
  if (loading) {
    return <div className="h-[420px] animate-pulse rounded-2xl border border-[#e5e7ef] bg-white" />;
  }
  if (error) return <ArtifactError error={error} onRetry={onRetry} />;
  if (!detail) {
    return (
      <div className="rounded-2xl border border-[#e5e7ef] bg-white p-12 text-center text-sm text-[#9095a6]">
        왼쪽에서 초안을 고르면 코스 전문이 보입니다.
      </div>
    );
  }

  const payload = detail.payload || {};
  const places = Array.isArray(payload.places) ? payload.places : [];

  return (
    <section>
      <div className="rounded-2xl border border-[#e1e4ed] bg-white px-6 py-5 shadow-[0_14px_45px_rgba(31,36,66,0.05)]">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-bold text-[#171b30]">{detail.celebrity}</h2>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusTone(detail.status)}`}>{detail.status}</span>
          <span className="text-xs font-semibold text-[#687087]">{detail.shape || "코스 없음"}</span>
          <span className="h-3 w-px bg-[#dfe2eb]" />
          <span className="text-xs text-[#8a90a3]">{detail.kind === "GROUP" ? "그룹" : "개인"}</span>
          <span className="text-xs text-[#8a90a3]">생성 {formatAdminDate(detail.builtAt)}</span>
        </div>
        {payload.why ? <p className="mt-2 text-xs text-[#9aa0b0]">{payload.why}</p> : null}
        {payload.reply ? <p className="mt-4 text-sm leading-6 text-[#4c5164]">{payload.reply}</p> : null}
      </div>

      {/* 경고를 펼친 채로 맨 위에 둔다. 관리자가 초안에서 제일 먼저 봐야 하는 것이다. */}
      <WarningPanel warnings={payload.warnings} open label="초안 경고" />

      <ul className="mt-6 space-y-3">
        {places.map((place, index) => (
          <PlaceCard key={place.slot_id ?? place.navigation_key ?? index} place={place} index={index} />
        ))}
      </ul>
      {!places.length ? (
        <div className="mt-6 rounded-2xl border border-[#e5e7ef] bg-white p-12 text-center text-sm text-[#9095a6]">
          이 초안에는 코스가 없습니다. 위의 상태와 경고에 사유가 있습니다.
        </div>
      ) : null}

      {/* research·state 는 수십 KB 라 카드로 안 그린다. 승인 람다가 쓸 재료이므로 원문으로 둔다. */}
      <RawJson title="조사 원문 (research)" value={payload.research} />
      <RawJson title="세션 상태 (state)" value={payload.state} />
    </section>
  );
}

export function AdminCourseView() {
  const { data: list, error, loading, reload } = useAdminTrendArtifact(getAdminCourses);
  const { data: run, reload: reloadRun } = useAdminTrendArtifact(getAdminCourseRun);

  // 사용자가 고른 것과 실제로 열려 있는 것을 나눈다. 고른 인물이 목록에서 사라져도
  // (하루가 지나 만료됐다) 화면은 첫 줄로 내려앉아야 하는데, 그걸 effect 로 맞추면
  // 렌더가 한 번 더 돈다 — 렌더 중에 계산하면 그럴 일이 없다.
  const [picked, setPicked] = useState(null);
  const [result, setResult] = useState(null);
  const [detailNonce, setDetailNonce] = useState(0);

  const drafts = useMemo(() => {
    const rows = list?.payload?.drafts;
    return Array.isArray(rows) ? rows : [];
  }, [list]);

  const selected = useMemo(() => {
    if (!drafts.length) return null;
    if (picked && drafts.some((draft) => draft.celebrity === picked)) return picked;
    return drafts[0].celebrity;
  }, [drafts, picked]);

  // 응답을 요청 키와 함께 담는다. 그래야 로딩 여부를 따로 들고 있지 않아도 되고
  // (담긴 키가 지금 보는 인물과 다르면 아직 안 온 것이다), 늦게 온 앞 요청이
  // 지금 화면을 덮어쓰지도 않는다.
  useEffect(() => {
    if (!selected) return undefined;

    let active = true;
    const request = { key: selected, nonce: detailNonce };

    getAdminCourse(selected)
      .then((data) => {
        if (active) setResult({ ...request, data, error: null });
      })
      .catch((error) => {
        if (active) setResult({ ...request, data: null, error });
      });

    return () => {
      active = false;
    };
  }, [selected, detailNonce]);

  const fresh = result?.key === selected && result?.nonce === detailNonce;
  const detail = fresh ? result.data : null;
  const detailError = fresh ? result.error : null;
  const detailLoading = Boolean(selected) && !fresh;

  const reloadDetail = useCallback(() => setDetailNonce((value) => value + 1), []);

  const reloadAll = useCallback(() => {
    reload();
    reloadRun();
    reloadDetail();
  }, [reload, reloadRun, reloadDetail]);

  if (loading) return <ArtifactLoading />;
  if (error) return <ArtifactError error={error} onRetry={reloadAll} />;

  return (
    <section>
      <RunStrip run={run} onReload={reloadAll} reloading={detailLoading} />

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <DraftList drafts={drafts} selected={selected} onSelect={setPicked} />
        <DraftDetail
          detail={detail}
          loading={detailLoading}
          error={detailError}
          onRetry={reloadDetail}
        />
      </div>
    </section>
  );
}
