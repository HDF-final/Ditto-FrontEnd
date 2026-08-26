"use client";

import { useMemo, useState } from "react";
import { getAdminYoutube } from "@/lib/api/admin-trends";
import {
  buildYoutubeOverallRows,
  rankMovement,
  rankMovementLabel,
} from "@/lib/admin/youtube-ranking";
import { useAdminTrendArtifact } from "@/hooks/use-admin-trend-artifact";
import {
  ArtifactError,
  ArtifactHeader,
  ArtifactLoading,
  COUNTRY_META,
  WarningPanel,
} from "./admin-artifact-ui";

const TABS = [
  { code: "OVERALL", flag: "🌐", name: "종합 순위" },
  ...["KR", "JP", "US"].map((code) => ({ code, ...COUNTRY_META[code] })),
];

const WEEKLY_FILTERS = [
  { code: "all", label: "전체" },
  { code: "rising", label: "주간 상승" },
  { code: "falling", label: "주간 하락" },
  { code: "stable", label: "주간 유지" },
  { code: "new", label: "신규 진입" },
  { code: "reentry", label: "재진입" },
  { code: "watch", label: "관찰 필요" },
];

const DAILY_META = {
  rising: { className: "bg-[#eaf9f1] text-[#118150]" },
  falling: { className: "bg-[#fff0f1] text-[#ca4050]" },
  stable: { className: "bg-[#f1f2f6] text-[#6d7385]" },
  new: { className: "bg-[#eee8ff] text-brand" },
  reentry: { className: "bg-[#fff4dc] text-[#a96700]" },
  unavailable: { className: "bg-[#f4f5f8] text-[#8b91a2]" },
};

const WEEKLY_META = {
  rising: { label: "주간 상승", className: "bg-[#eaf9f1] text-[#118150]", bar: "bg-[#29b873]" },
  falling: { label: "주간 하락", className: "bg-[#fff0f1] text-[#ca4050]", bar: "bg-[#ee6673]" },
  stable: { label: "주간 유지", className: "bg-[#f1f2f6] text-[#666d80]", bar: "bg-[#9097a8]" },
  new: { label: "신규 진입", className: "bg-[#eee8ff] text-brand", bar: "bg-brand" },
  reentry: { label: "재진입", className: "bg-[#fff4dc] text-[#a96700]", bar: "bg-[#e7a11e]" },
  watch: { label: "관찰 필요", className: "bg-[#eef5ff] text-[#326bb3]", bar: "bg-[#6a9ee3]" },
  unavailable: { label: "비교 불가", className: "bg-[#f4f5f8] text-[#8b91a2]", bar: "bg-[#b3b8c4]" },
};

function valueOrDash(value, digits = 0) {
  if (value === null || value === undefined || value === "") return "-";
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  return number.toFixed(digits);
}

function resolveRows(payload, country, overallRows) {
  if (country === "OVERALL") return overallRows;
  return Array.isArray(payload.countries?.[country]) ? payload.countries[country] : [];
}

function entityTypeLabel(value) {
  return { person: "개인", group: "그룹" }[value] || value || "";
}

function compactNumber(value) {
  if (value === null || value === undefined) return "수집본 미제공";
  return `${new Intl.NumberFormat("ko-KR", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value) || 0)}회`;
}

function signedNumber(value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return null;
  const number = Number(value);
  if (number > 0) return `+${number.toFixed(1)}`;
  return number.toFixed(1);
}

function rankLabel(value) {
  if (value === null || value === undefined || value === "") return "-";
  const number = Number(value);
  return Number.isFinite(number) ? `${number.toFixed(0)}위` : "-";
}

function dailyCategory(item) {
  return DAILY_META[item?.dailyCategory] ? item.dailyCategory : "unavailable";
}

function weeklyCategory(item) {
  if (WEEKLY_META[item?.weeklyCategory]) return item.weeklyCategory;
  return "watch";
}

function SignalBar({ value, label }) {
  const number = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="min-w-[140px]">
      <div className="mb-1 flex items-center justify-between gap-3 text-[11px]">
        <span className="text-[#8a90a3]">{label}</span>
        <strong className="text-brand">{valueOrDash(number, 1)}</strong>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#eeeafc]">
        <div className="h-full rounded-full bg-gradient-to-r from-[#5c2ef5] to-[#9b7cff]" style={{ width: `${number}%` }} />
      </div>
    </div>
  );
}

function ArtistCell({ item, video }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {video?.thumbnailUrl ? (
        <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noreferrer" className="shrink-0 overflow-hidden rounded-lg bg-[#f1f2f6]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={video.thumbnailUrl} alt="" className="h-12 w-[76px] object-cover" />
        </a>
      ) : null}
      <div className="min-w-0">
        <p className="font-bold text-[#20243a]">{item.nameKo || item.name}</p>
        <p className="mt-1 text-xs text-[#9499aa]">{item.name}{item.entityType ? ` · ${entityTypeLabel(item.entityType)}` : ""}</p>
        {video ? (
          <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noreferrer" className="mt-1 block max-w-[310px] truncate text-[11px] font-semibold text-[#6f55d9] hover:underline" title={video.title}>
            대표 영상 · {video.title}
          </a>
        ) : null}
      </div>
    </div>
  );
}

function RankBadge({ rank }) {
  return (
    <span className={`inline-flex size-8 items-center justify-center rounded-lg text-xs font-black ${rank <= 3 ? "bg-[#eee9ff] text-brand" : "bg-[#f3f4f7] text-[#777d90]"}`}>
      {rank}
    </span>
  );
}

function DailyMovementBadge({ item }) {
  const category = dailyCategory(item);
  const movement = rankMovement(item);
  const movementCategory = movement.value > 0 ? "rising" : movement.value < 0 ? "falling" : category;
  const meta = DAILY_META[movementCategory] || DAILY_META.unavailable;
  const title = movement.source === "market-net"
    ? "관측 " + movement.count + "개국 전일 순위 변동 합계"
    : item?.previousRanking
      ? "전일 " + item.previousRanking + "위"
      : "전일 순위 비교";
  return (
    <span className={"inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black " + meta.className} title={title}>
      {rankMovementLabel(item)}
    </span>
  );
}

function WeeklyTrendBadge({ item }) {
  const category = weeklyCategory(item);
  const meta = WEEKLY_META[category];
  const change = signedNumber(item?.weeklySignalChange);
  return (
    <div className="min-w-[118px]">
      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black ${meta.className}`}>
        {meta.label}{change ? ` ${change}` : ""}
      </span>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eef0f5]">
        <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${Math.max(12, Math.min(100, Math.abs(Number(item?.weeklySignalChange) || 0) * 4))}%` }} />
      </div>
    </div>
  );
}

function WeeklySummary({ rows, activeFilter, onFilter }) {
  const counts = useMemo(() => WEEKLY_FILTERS.reduce((result, filter) => {
    result[filter.code] = filter.code === "all" ? rows.length : rows.filter((item) => weeklyCategory(item) === filter.code).length;
    return result;
  }, {}), [rows]);
  return (
    <div className="mb-5 rounded-2xl border border-[#e1e4ed] bg-white p-5 shadow-[0_10px_35px_rgba(31,36,66,0.04)]">
      <div className="mb-4">
        <h2 className="font-bold text-[#24283c]">최근 7일 흐름</h2>
        <p className="mt-1 text-xs text-[#8a90a3]">성공한 수집일만 비교하며 실패한 날은 하락이나 0점으로 계산하지 않습니다.</p>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="주간 변화 필터">
        {WEEKLY_FILTERS.map((filter) => {
          const active = filter.code === activeFilter;
          return (
            <button key={filter.code} type="button" onClick={() => onFilter(filter.code)} className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${active ? "border-brand bg-brand text-white shadow-[0_8px_18px_rgba(92,46,245,0.16)]" : "border-[#e0e3ed] bg-white text-[#646a7e] hover:border-[#c9bffd]"}`}>
              {filter.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? "bg-white/15" : "bg-[#f1f2f6] text-[#7c8294]"}`}>{counts[filter.code]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OverallYoutubeTable({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-[#fafbfe] text-[11px] font-bold uppercase tracking-[0.08em] text-[#858b9e]">
          <tr>
            <th className="w-20 px-6 py-4">순위</th>
            <th className="px-4 py-4">아티스트</th>
            <th className="w-[24%] px-4 py-4">종합 급상승 점수</th>
            <th className="px-4 py-4">전일 순위 변동</th>
            <th className="px-4 py-4">최근 7일</th>
            <th className="px-4 py-4">관측 국가</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#eceef4]">
          {rows.map((item, index) => (
            <tr key={item.qid || (item.name || "artist") + "-" + index} className="transition-colors hover:bg-[#faf9ff]">
              <td className="px-6 py-4"><RankBadge rank={index + 1} /></td>
              <td className="px-4 py-4"><ArtistCell item={item} /></td>
              <td className="px-4 py-4"><SignalBar value={item.breakoutScore ?? item.interestScore} label="종합 점수" /></td>
              <td className="px-4 py-4"><DailyMovementBadge item={item} /></td>
              <td className="px-4 py-4"><WeeklyTrendBadge item={item} /></td>
              <td className="px-4 py-4 font-semibold">{valueOrDash(item.marketCount)}개국</td>
            </tr>
          ))}
          {!rows.length ? <tr><td colSpan={6} className="px-6 py-16 text-center text-sm text-[#9095a6]">선택한 흐름에 해당하는 YouTube 결과가 없습니다.</td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}
function CountryYoutubeTable({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1180px] text-left text-sm">
        <thead className="bg-[#fafbfe] text-[11px] font-bold uppercase tracking-[0.08em] text-[#858b9e]"><tr><th className="w-20 px-6 py-4">순위</th><th className="px-4 py-4">아티스트·대표 영상</th><th className="w-[18%] px-4 py-4">급상승 신호</th><th className="px-4 py-4">전일 대비</th><th className="px-4 py-4">최근 7일</th><th className="px-4 py-4">최고 영상 순위</th><th className="px-4 py-4">조회수·반응</th><th className="px-4 py-4">노출</th></tr></thead>
        <tbody className="divide-y divide-[#eceef4]">
          {rows.map((item, index) => {
            const videos = Array.isArray(item.videos) ? [...item.videos].sort((a, b) => Number(a.chartRank || 999) - Number(b.chartRank || 999)) : [];
            const video = videos[0];
            return <tr key={item.qid || `${item.name}-${index}`} className="transition-colors hover:bg-[#faf9ff]"><td className="px-6 py-4"><RankBadge rank={index + 1} /></td><td className="px-4 py-4"><ArtistCell item={item} video={video} /></td><td className="px-4 py-4"><SignalBar value={item.breakoutScore ?? item.signalScore ?? item.interestScore} label="급상승 점수" /></td><td className="px-4 py-4"><DailyMovementBadge item={item} /></td><td className="px-4 py-4"><WeeklyTrendBadge item={item} /></td><td className="px-4 py-4 font-semibold"><div>{rankLabel(item.bestVideoRank)}</div>{video?.chartRankChange !== null && video?.chartRankChange !== undefined ? <span className="mt-1 block text-[11px] text-[#8b91a2]">영상 {video.chartRankChange > 0 ? `↑${video.chartRankChange}` : video.chartRankChange < 0 ? `↓${Math.abs(video.chartRankChange)}` : "유지"}</span> : null}</td><td className="px-4 py-4 text-xs"><strong className="block text-[#33384d]">{compactNumber(item.totalViews)}</strong>{video?.likeCount !== null && video?.likeCount !== undefined ? <span className="mt-1 block text-[#8b91a2]">좋아요 {compactNumber(video.likeCount)}</span> : null}{video?.commentCount !== null && video?.commentCount !== undefined ? <span className="block text-[#8b91a2]">댓글 {compactNumber(video.commentCount)}</span> : null}</td><td className="px-4 py-4 font-semibold"><span>{valueOrDash(item.observedDays)}일</span><span className="mt-1 block text-[11px] font-normal text-[#8b91a2]">연속 {valueOrDash(item.consecutiveDays)}일</span></td></tr>;
          })}
          {!rows.length ? <tr><td colSpan={8} className="px-6 py-16 text-center text-sm text-[#9095a6]">선택한 흐름에 해당하는 이 국가의 결과가 없습니다.</td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}

export function YoutubeRankingView() {
  const { data, error, loading, reload } = useAdminTrendArtifact(getAdminYoutube);
  const [country, setCountry] = useState("OVERALL");
  const [weeklyFilter, setWeeklyFilter] = useState("all");

  const payload = useMemo(() => data?.payload || {}, [data?.payload]);
  const overallRows = useMemo(() => buildYoutubeOverallRows(payload), [payload]);
  const sourceRows = resolveRows(payload, country, overallRows);
  const rows = weeklyFilter === "all" ? sourceRows : sourceRows.filter((item) => weeklyCategory(item) === weeklyFilter);
  const activeTab = TABS.find((tab) => tab.code === country) || TABS[0];

  if (loading) return <ArtifactLoading />;
  if (error) return <ArtifactError error={error} onRetry={reload} />;

  return (
    <section>
      <ArtifactHeader artifact={data} onReload={reload} />
      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="YouTube 국가 선택">
        {TABS.map((tab) => {
          const active = country === tab.code;
          return <button key={tab.code} type="button" role="tab" aria-selected={active} onClick={() => setCountry(tab.code)} className={`flex min-w-[116px] items-center justify-between rounded-xl border px-4 py-3 text-sm font-bold transition ${active ? "border-brand bg-brand text-white shadow-[0_10px_25px_rgba(92,46,245,0.18)]" : "border-[#e0e3ed] bg-white text-[#5e647a] hover:border-[#c9bffd]"}`}><span className="flex items-center gap-2"><span>{tab.flag}</span>{tab.name}</span><span className={`rounded-full px-2 py-0.5 text-[10px] ${active ? "bg-white/15" : "bg-[#f0f2f7] text-[#777e92]"}`}>{resolveRows(payload, tab.code, overallRows).length}</span></button>;
        })}
      </div>

      <WeeklySummary rows={sourceRows} activeFilter={weeklyFilter} onFilter={setWeeklyFilter} />

      <div className="overflow-hidden rounded-2xl border border-[#e1e4ed] bg-white shadow-[0_14px_45px_rgba(31,36,66,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eceef4] px-6 py-5"><div><h2 className="font-bold">{country === "OVERALL" ? "🌐 YouTube 국가 통합 종합 TOP 10" : `${activeTab.flag} ${activeTab.name} YouTube 급상승 TOP 10`}</h2><p className="mt-1 text-xs text-[#8a90a3]">{country === "OVERALL" ? "한국·일본·미국 급상승 신호를 통합해 전일 변화와 최근 7일 흐름까지 비교합니다." : "전일 순위 변화와 최근 7일 흐름을 함께 보는 보조 트렌드 신호"}</p></div><span className="rounded-full bg-[#f2efff] px-3 py-1.5 text-xs font-bold text-brand">{rows.length}명</span></div>
        {country === "OVERALL" ? <OverallYoutubeTable rows={rows} /> : <CountryYoutubeTable rows={rows} />}
      </div>
      <WarningPanel warnings={payload.warnings} />
    </section>
  );
}
