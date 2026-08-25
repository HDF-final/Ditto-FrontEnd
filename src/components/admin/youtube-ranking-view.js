"use client";

import { useState } from "react";
import { getAdminYoutube } from "@/lib/api/admin-trends";
import { useAdminTrendArtifact } from "@/hooks/use-admin-trend-artifact";
import {
  ArtifactError,
  ArtifactHeader,
  ArtifactLoading,
  COUNTRY_META,
  WarningPanel,
} from "./admin-artifact-ui";

const TABS = [
  { code: "OVERALL", flag: "🌐", name: "전체" },
  ...["KR", "JP", "US"].map((code) => ({ code, ...COUNTRY_META[code] })),
];

function valueOrDash(value, digits = 0) {
  if (value === null || value === undefined || value === "") return "-";
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  return number.toFixed(digits);
}

function resolveRows(payload, country) {
  if (country === "OVERALL") {
    return Array.isArray(payload.overall) ? payload.overall : [];
  }
  return Array.isArray(payload.countries?.[country]) ? payload.countries[country] : [];
}

function entityTypeLabel(value) {
  return { person: "개인", group: "그룹" }[value] || value || "";
}

function compactNumber(value) {
  if (value === null || value === undefined) return "수집본 미제공";
  return `${new Intl.NumberFormat("ko-KR", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value) || 0)}회`;
}

function rankLabel(value) {
  if (value === null || value === undefined || value === "") return "-";
  const number = Number(value);
  return Number.isFinite(number) ? `${number.toFixed(0)}위` : "-";
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
    <div className="min-w-0">
      <p className="font-bold text-[#20243a]">{item.nameKo || item.name}</p>
      <p className="mt-1 text-xs text-[#9499aa]">{item.name}{item.entityType ? ` · ${entityTypeLabel(item.entityType)}` : ""}</p>
      {video ? (
        <a
          href={`https://www.youtube.com/watch?v=${video.videoId}`}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block max-w-[320px] truncate text-[11px] font-semibold text-[#6f55d9] hover:underline"
          title={video.title}
        >
          대표 영상 · {video.title}
        </a>
      ) : null}
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

function MarketSignals({ scores }) {
  const markets = ["KR", "JP", "US"].filter((code) => {
    const value = scores?.[code];
    return value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
  });
  if (!markets.length) return <span className="text-xs text-[#9aa0b0]">국가 신호 없음</span>;
  return (
    <div className="flex min-w-[230px] gap-2">
      {markets.map((code) => {
        const value = Math.max(0, Math.min(100, Number(scores[code]) || 0));
        return (
          <div key={code} className="flex-1" title={`${COUNTRY_META[code]?.name || code} ${value.toFixed(1)}`}>
            <div className="mb-1 flex justify-between text-[10px] text-[#81879a]">
              <span>{COUNTRY_META[code]?.flag}</span>
              <span>{value.toFixed(0)}</span>
            </div>
            <div className="h-12 rounded-md bg-[#f1effa] p-1">
              <div className="flex h-full items-end">
                <div className="w-full rounded bg-brand/75" style={{ height: `${Math.max(5, value)}%` }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function observationLabel(item) {
  const observedDays = Number(item.observedDays);
  const recent = Number(item.latestSignalScore ?? item.recentScore ?? item.signalScore);
  const persistence = Number(item.persistenceScore);
  const rank = Number(item.bestVideoRank);
  const videoCount = Number(item.videoCount ?? item.uniqueVideoCount);
  if (Number.isFinite(recent) && Number.isFinite(persistence) && recent >= persistence * 1.15) return "최근 급등";
  if (Number.isFinite(observedDays) && observedDays >= 5) return "지속 노출";
  if (Number.isFinite(rank) && rank <= 30) return "상위권 영상";
  if (Number.isFinite(videoCount) && videoCount >= 5) return "다수 영상 노출";
  return "관찰";
}

function OverallYoutubeTable({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[940px] text-left text-sm">
        <thead className="bg-[#fafbfe] text-[11px] font-bold uppercase tracking-[0.08em] text-[#858b9e]">
          <tr>
            <th className="w-20 px-6 py-4">순위</th>
            <th className="px-4 py-4">아티스트</th>
            <th className="w-[25%] px-4 py-4">종합 급상승 신호</th>
            <th className="px-4 py-4">국가별 신호</th>
            <th className="px-4 py-4">관측 국가</th>
            <th className="px-4 py-4">관련 영상</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#eceef4]">
          {rows.map((item, index) => (
            <tr key={item.qid || `${item.name}-${index}`} className="transition-colors hover:bg-[#faf9ff]">
              <td className="px-6 py-4"><RankBadge rank={index + 1} /></td>
              <td className="px-4 py-4"><ArtistCell item={item} /></td>
              <td className="px-4 py-4"><SignalBar value={item.score ?? item.interestScore} label="통합 신호" /></td>
              <td className="px-4 py-4"><MarketSignals scores={item.marketScores} /></td>
              <td className="px-4 py-4 font-semibold">{valueOrDash(item.marketCount)}개국</td>
              <td className="px-4 py-4 font-semibold">{valueOrDash(item.uniqueVideoCount)}개</td>
            </tr>
          ))}
          {!rows.length ? <tr><td colSpan={6} className="px-6 py-16 text-center text-sm text-[#9095a6]">전체 YouTube 수집 결과가 없습니다.</td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}

function CountryYoutubeTable({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1040px] text-left text-sm">
        <thead className="bg-[#fafbfe] text-[11px] font-bold uppercase tracking-[0.08em] text-[#858b9e]">
          <tr>
            <th className="w-20 px-6 py-4">순위</th>
            <th className="px-4 py-4">아티스트·대표 영상</th>
            <th className="w-[22%] px-4 py-4">급상승 신호</th>
            <th className="px-4 py-4">최고 영상 순위</th>
            <th className="px-4 py-4">총 조회수</th>
            <th className="px-4 py-4">영상 수</th>
            <th className="px-4 py-4">관찰 요약</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#eceef4]">
          {rows.map((item, index) => {
            const videos = Array.isArray(item.videos) ? [...item.videos].sort((a, b) => Number(a.chartRank || 999) - Number(b.chartRank || 999)) : [];
            const representativeVideo = videos[0];
            return (
              <tr key={item.qid || `${item.name}-${index}`} className="transition-colors hover:bg-[#faf9ff]">
                <td className="px-6 py-4"><RankBadge rank={index + 1} /></td>
                <td className="px-4 py-4"><ArtistCell item={item} video={representativeVideo} /></td>
                <td className="px-4 py-4"><SignalBar value={item.signalScore ?? item.interestScore ?? item.recentScore} label="국가 신호" /></td>
                <td className="px-4 py-4 font-semibold">{rankLabel(item.bestVideoRank)}</td>
                <td className="px-4 py-4 font-semibold">{compactNumber(item.totalViews)}</td>
                <td className="px-4 py-4 font-semibold">{valueOrDash(item.videoCount ?? item.uniqueVideoCount)}개</td>
                <td className="px-4 py-4"><span className="rounded-full bg-[#f1efff] px-2.5 py-1 text-[11px] font-bold text-brand">{observationLabel(item)}</span></td>
              </tr>
            );
          })}
          {!rows.length ? <tr><td colSpan={7} className="px-6 py-16 text-center text-sm text-[#9095a6]">이 국가의 YouTube 수집 결과가 없습니다.</td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}

export function YoutubeRankingView() {
  const { data, error, loading, reload } = useAdminTrendArtifact(getAdminYoutube);
  const [country, setCountry] = useState("OVERALL");

  if (loading) return <ArtifactLoading />;
  if (error) return <ArtifactError error={error} onRetry={reload} />;

  const payload = data?.payload || {};
  const rows = resolveRows(payload, country);
  const activeTab = TABS.find((tab) => tab.code === country) || TABS[0];

  return (
    <section>
      <ArtifactHeader artifact={data} onReload={reload} />

      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="YouTube 국가 선택">
        {TABS.map((tab) => {
          const active = country === tab.code;
          return (
            <button
              key={tab.code}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCountry(tab.code)}
              className={`flex min-w-[116px] items-center justify-between rounded-xl border px-4 py-3 text-sm font-bold transition ${
                active
                  ? "border-brand bg-brand text-white shadow-[0_10px_25px_rgba(92,46,245,0.18)]"
                  : "border-[#e0e3ed] bg-white text-[#5e647a] hover:border-[#c9bffd]"
              }`}
            >
              <span className="flex items-center gap-2"><span>{tab.flag}</span>{tab.name}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] ${active ? "bg-white/15" : "bg-[#f0f2f7] text-[#777e92]"}`}>
                {resolveRows(payload, tab.code).length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e1e4ed] bg-white shadow-[0_14px_45px_rgba(31,36,66,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eceef4] px-6 py-5">
          <div>
            <h2 className="font-bold">{activeTab.flag} {activeTab.name} YouTube 급상승 TOP 10</h2>
            <p className="mt-1 text-xs text-[#8a90a3]">최근 영상 노출·순위·지속성을 합산한 보조 트렌드 신호</p>
          </div>
          <span className="rounded-full bg-[#f2efff] px-3 py-1.5 text-xs font-bold text-brand">{rows.length}명</span>
        </div>

        {country === "OVERALL" ? <OverallYoutubeTable rows={rows} /> : <CountryYoutubeTable rows={rows} />}
      </div>
      <WarningPanel warnings={payload.warnings} />
    </section>
  );
}
