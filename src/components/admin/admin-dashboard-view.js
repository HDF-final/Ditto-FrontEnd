"use client";

import Link from "next/link";
import { getAdminTrendOverview } from "@/lib/api/admin-trends";
import {
  buildYoutubeOverallRows,
  rankMovement,
  rankMovementLabel,
} from "@/lib/admin/youtube-ranking";
import { useAdminTrendArtifact } from "@/hooks/use-admin-trend-artifact";
import {
  ArtifactError,
  ArtifactLoading,
  COUNTRY_META,
  StatusBadge,
  formatAdminDate,
} from "./admin-artifact-ui";

const COUNTRIES = ["KR", "CN", "JP", "US"];

function totalCountryRows(countries) {
  return COUNTRIES.reduce(
    (sum, code) => sum + (Array.isArray(countries?.[code]) ? countries[code].length : 0),
    0,
  );
}

function latestRows(artifact, code) {
  return Array.isArray(artifact?.payload?.countries?.[code])
    ? artifact.payload.countries[code]
    : [];
}

function weeklyScore(item) {
  const value = item?.scores?.short7
    ?? item?.score7d
    ?? item?.windowScores?.["7d"]
    ?? item?.interestScore;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function weeklyRows(artifact, code) {
  return latestRows(artifact, code)
    .map((item, sourceIndex) => ({ item, score: weeklyScore(item), sourceIndex }))
    .sort((a, b) => {
      if (a.score !== null && b.score !== null && b.score !== a.score) return b.score - a.score;
      if (a.score !== null && b.score === null) return -1;
      if (a.score === null && b.score !== null) return 1;
      const rankingGap = Number(a.item?.ranking || a.sourceIndex + 1) - Number(b.item?.ranking || b.sourceIndex + 1);
      if (rankingGap !== 0) return rankingGap;
      return String(a.item?.nameKo || a.item?.name || "").localeCompare(String(b.item?.nameKo || b.item?.name || ""), "ko");
    })
    .map(({ item, score }) => ({ ...item, weeklyScore: score }));
}

function formatWeeklyScore(value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return "-";
  const number = Number(value);
  return Number.isInteger(number) ? number.toFixed(0) : number.toFixed(1);
}

function warningCount(artifacts) {
  return artifacts.reduce(
    (sum, artifact) => sum + Number(artifact?.warningCount || 0),
    0,
  );
}

function MetricCard({ label, value, caption, tone }) {
  const tones = {
    purple: "bg-[#eee9ff] text-brand",
    blue: "bg-[#e9f4ff] text-[#3475b8]",
    green: "bg-[#e8f8f0] text-[#19885a]",
    amber: "bg-[#fff3d9] text-[#9b6811]",
  };

  return (
    <article className="rounded-2xl border border-[#e2e5ee] bg-white p-5 shadow-[0_12px_36px_rgba(31,36,66,0.04)]">
      <span className={"inline-flex rounded-lg px-2.5 py-1 text-[10px] font-black tracking-[0.12em] " + tones[tone]}>
        {label}
      </span>
      <p className="mt-5 text-3xl font-black tracking-[-0.04em] text-[#20243a]">{value}</p>
      <p className="mt-2 text-xs text-[#8a90a3]">{caption}</p>
    </article>
  );
}

function YoutubeMovement({ item }) {
  const movement = rankMovement(item);
  const category = item?.dailyCategory;
  let tone = "bg-[#f1f2f6] text-[#6d7385]";
  if (movement.value > 0 || category === "new") tone = "bg-[#eaf9f1] text-[#118150]";
  if (movement.value < 0) tone = "bg-[#fff0f1] text-[#ca4050]";
  if (category === "reentry") tone = "bg-[#fff4dc] text-[#a96700]";

  const title = movement.source === "market-net"
    ? "관측 " + movement.count + "개국 전일 순위 변동 합계"
    : "전일 순위 변동";

  return (
    <span className={"shrink-0 rounded-full px-2 py-1 text-[10px] font-black " + tone} title={title}>
      {rankMovementLabel(item)}
    </span>
  );
}

function WeeklyRankingPanel({ top10 }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#e1e4ed] bg-white shadow-[0_14px_45px_rgba(31,36,66,0.05)]">
      <div className="flex items-center justify-between border-b border-[#eceef4] px-5 py-4">
        <div>
          <h2 className="font-bold">K-POP 아티스트 주간 국가별 랭킹</h2>
          <p className="mt-1 text-xs text-[#8a90a3]">최근 7일 검색 관심도 기준 국가별 상위 3명</p>
        </div>
        <Link href="/admin/trends/rankings" className="shrink-0 text-xs font-bold text-brand hover:underline">
          전체 보기 →
        </Link>
      </div>

      <div className="grid sm:grid-cols-2">
        {COUNTRIES.map((code, countryIndex) => {
          const rows = weeklyRows(top10, code).slice(0, 3);
          return (
            <section
              key={code}
              className={"p-3.5 " + (countryIndex >= 2 ? "border-t border-[#eceef4] " : "") + (countryIndex % 2 === 1 ? "sm:border-l sm:border-[#eceef4]" : "")}
            >
              <h3 className="mb-2.5 flex items-center gap-2 text-xs font-black">
                <span>{COUNTRY_META[code].flag}</span>
                {COUNTRY_META[code].name}
              </h3>
              <ol className="space-y-1.5">
                {rows.map((item, index) => (
                  <li key={item.qid || code + "-" + item.name + "-" + index} className="flex items-center gap-2 rounded-lg bg-[#fafbfe] px-2.5 py-1.5">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[#eee9ff] text-[10px] font-black text-brand">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs font-bold">{item.nameKo || item.name}</span>
                    <span className="shrink-0 text-[10px] font-black text-brand" title="최근 7일 관심도 점수">
                      {formatWeeklyScore(item.weeklyScore)}
                    </span>
                  </li>
                ))}
                {!rows.length ? <li className="py-6 text-center text-xs text-[#9aa0b0]">결과 없음</li> : null}
              </ol>
            </section>
          );
        })}
      </div>
    </article>
  );
}

function YoutubeRankingPanel({ rows }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#e1e4ed] bg-white shadow-[0_14px_45px_rgba(31,36,66,0.05)]">
      <div className="flex items-center justify-between border-b border-[#eceef4] px-5 py-4">
        <div>
          <h2 className="font-bold">YouTube 종합 급상승 TOP 5</h2>
          <p className="mt-1 text-xs text-[#8a90a3]">한국·일본·미국 최근 7일 급상승 신호 통합</p>
        </div>
        <Link href="/admin/trends/youtube" className="shrink-0 text-xs font-bold text-brand hover:underline">
          전체 보기 →
        </Link>
      </div>
      <ol className="divide-y divide-[#eceef4] px-4">
        {rows.slice(0, 5).map((item, index) => (
          <li key={item.qid || (item.name || "artist") + "-" + index} className="flex items-center gap-3 py-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#eee9ff] text-[11px] font-black text-brand">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold">{item.nameKo || item.name}</p>
              <p className="mt-1 truncate text-[10px] text-[#9298aa]">
                급상승 {formatWeeklyScore(item.breakoutScore ?? item.interestScore)}
              </p>
            </div>
            <YoutubeMovement item={item} />
          </li>
        ))}
        {!rows.length ? <li className="py-12 text-center text-xs text-[#9aa0b0]">결과 없음</li> : null}
      </ol>
    </article>
  );
}

function CollectionStatusPanel({ top10, candidates, youtube, reload }) {
  return (
    <article className="rounded-2xl border border-[#e1e4ed] bg-white p-4 shadow-[0_14px_45px_rgba(31,36,66,0.05)]">
      <h2 className="font-bold">수집 상태</h2>
      <p className="mt-1 text-xs text-[#8a90a3]">S3 최신 산출물</p>
      <div className="mt-3 divide-y divide-[#eceef4]">
        {[
          ["국가별 TOP 10", top10, "/admin/trends/rankings"],
          ["국가별 후보군", candidates, "/admin/trends/candidates"],
          ["YouTube 급상승", youtube, "/admin/trends/youtube"],
        ].map(([label, artifact, href]) => (
          <Link key={label} href={href} className="flex items-center justify-between gap-2 py-3 first:pt-0 hover:text-brand">
            <div className="min-w-0">
              <p className="truncate text-xs font-bold">{label}</p>
              <p className="mt-1 text-[10px] text-[#9095a6]">{formatAdminDate(artifact?.builtAt)}</p>
            </div>
            <StatusBadge status={artifact?.status} />
          </Link>
        ))}
      </div>
      <button type="button" onClick={reload} className="mt-3 w-full rounded-xl border border-[#dedfee] px-3 py-2.5 text-xs font-bold text-[#5f6579] transition hover:border-[#c8bdfd] hover:text-brand">
        전체 새로고침
      </button>
    </article>
  );
}

export function AdminDashboardView() {
  const { data, error, loading, reload } = useAdminTrendArtifact(getAdminTrendOverview);

  if (loading) return <ArtifactLoading />;
  if (error) return <ArtifactError error={error} onRetry={reload} />;

  const { top10, candidates, youtube } = data;
  const artifacts = [top10, candidates, youtube];
  const youtubeOverall = buildYoutubeOverallRows(youtube?.payload || {});

  return (
    <section className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="K-POP 주간 랭킹" value={totalCountryRows(top10?.payload?.countries)} caption="최근 7일 기준 4개국 순위 항목" tone="purple" />
        <MetricCard label="후보군" value={totalCountryRows(candidates?.payload?.countries)} caption="교차 검증 후보 전체" tone="blue" />
        <MetricCard label="YOUTUBE 급상승" value={youtubeOverall.length} caption="최근 7일 종합 급상승" tone="green" />
        <MetricCard label="수집 경고" value={warningCount(artifacts)} caption="확인이 필요한 수집 경고" tone="amber" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.85fr)_minmax(220px,0.55fr)]">
        <WeeklyRankingPanel top10={top10} />
        <YoutubeRankingPanel rows={youtubeOverall} />
        <CollectionStatusPanel top10={top10} candidates={candidates} youtube={youtube} reload={reload} />
      </div>
    </section>
  );
}
