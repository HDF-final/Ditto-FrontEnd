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

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-[#fafbfe] text-[11px] font-bold uppercase tracking-[0.08em] text-[#858b9e]">
              <tr>
                <th className="w-20 px-6 py-4">순위</th>
                <th className="px-4 py-4">아티스트</th>
                <th className="px-4 py-4">관심도</th>
                <th className="px-4 py-4">최고 영상 순위</th>
                <th className="px-4 py-4">관측 일수</th>
                <th className="px-4 py-4">지속성</th>
                <th className="px-4 py-4">최근 신호</th>
                <th className="px-4 py-4">급상승</th>
                <th className="px-4 py-4">영상 수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceef4]">
              {rows.map((item, index) => (
                <tr key={item.qid || `${item.name}-${index}`} className="transition-colors hover:bg-[#faf9ff]">
                  <td className="px-6 py-4">
                    <span className={`inline-flex size-8 items-center justify-center rounded-lg text-xs font-black ${index < 3 ? "bg-[#eee9ff] text-brand" : "bg-[#f3f4f7] text-[#777d90]"}`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-[#20243a]">{item.nameKo || item.name}</p>
                    <p className="mt-1 text-xs text-[#9499aa]">{item.name}{item.entityType ? ` · ${item.entityType}` : ""}</p>
                  </td>
                  <td className="px-4 py-4"><strong className="text-brand">{valueOrDash(item.interestScore)}</strong></td>
                  <td className="px-4 py-4 font-semibold">{valueOrDash(item.bestVideoRank)}</td>
                  <td className="px-4 py-4 font-semibold">{valueOrDash(item.observedDays)}일</td>
                  <td className="px-4 py-4">{valueOrDash(item.persistenceScore, 1)}</td>
                  <td className="px-4 py-4">{valueOrDash(item.latestSignalScore, 1)}</td>
                  <td className="px-4 py-4">{valueOrDash(item.breakoutScore, 1)}</td>
                  <td className="px-4 py-4">{valueOrDash(item.uniqueVideoCount)}</td>
                </tr>
              ))}
              {!rows.length ? (
                <tr><td colSpan={9} className="px-6 py-16 text-center text-sm text-[#9095a6]">이 국가의 YouTube 수집 결과가 없습니다.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
      <WarningPanel warnings={payload.warnings} />
    </section>
  );
}
