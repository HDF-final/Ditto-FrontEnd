"use client";

import { useState } from "react";
import { getAdminCandidates, getAdminTop10 } from "@/lib/api/admin-trends";
import { useAdminTrendArtifact } from "@/hooks/use-admin-trend-artifact";
import {
  ArtifactError,
  ArtifactHeader,
  ArtifactLoading,
  COUNTRY_META,
  WarningPanel,
} from "./admin-artifact-ui";
import { PeriodChartLegend, PeriodScoreChart } from "./period-score-chart";

const COUNTRY_CODES = ["KR", "CN", "JP", "US"];
const PAGE_SIZE = 10;

const CLASSIFICATION_META = {
  sustained: { label: "지속 상승", className: "bg-[#e9f8f0] text-[#178455]" },
  established: { label: "장기 강세", className: "bg-[#eee9ff] text-brand" },
  rising: { label: "상승", className: "bg-[#eaf4ff] text-[#2f70ac]" },
  breakout: { label: "급상승", className: "bg-[#fff0e6] text-[#bc571c]" },
  cooling: { label: "관심 하락", className: "bg-[#eef0f5] text-[#666d80]" },
  watch: { label: "관찰", className: "bg-[#fff5d9] text-[#96630d]" },
  steady: { label: "유지", className: "bg-[#eef4ff] text-[#46668e]" },
  youtube_hot: { label: "YouTube 급상승", className: "bg-[#fff0f4] text-[#b63c62]" },
};

const SIGNAL_LABELS = {
  naver_search_7_30_90_weighted: "네이버 검색 7·30·90일 가중치",
  wikimedia_pageviews_30d: "Wikimedia 30일 조회수",
};

function entityTypeLabel(value) {
  return { person: "개인", group: "그룹" }[value] || value || "";
}

function signalLabel(value) {
  return SIGNAL_LABELS[value] || value || "-";
}

function queryModeLabel(value) {
  return { MID: "주제 MID", QUERY: "검색어", Naver: "네이버 검색" }[value] || value || "-";
}

function score(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  return number.toFixed(number % 1 ? 1 : 0);
}

function classificationLabel(value) {
  return CLASSIFICATION_META[value]?.label || value || "-";
}

function countryCount(countries, code) {
  return Array.isArray(countries?.[code]) ? countries[code].length : 0;
}

function ClassificationBadge({ value }) {
  const meta = CLASSIFICATION_META[value] || {
    label: value || "미분류",
    className: "bg-[#f1f2f6] text-[#73798b]",
  };
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.className}`}>
      {meta.label}
    </span>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-[#eceef4] px-6 py-4">
      <p className="text-xs text-[#8a90a3]">페이지당 {PAGE_SIZE}명</p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1} className="rounded-lg border border-[#e0e3ed] px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40">이전</button>
        <span className="min-w-16 text-center text-xs font-bold text-[#5f6579]">{page} / {totalPages}</span>
        <button type="button" onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="rounded-lg border border-[#e0e3ed] px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40">다음</button>
      </div>
    </div>
  );
}

function WikimediaBars({ rows, page, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const visibleRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const maxViews = Math.max(0, ...rows.map((item) => Number(item.wikiViews30 ?? item.candidateScore) || 0));

  return (
    <>
      <div className="space-y-3 px-6 py-5">
        {visibleRows.map((item, index) => {
          const views = Number(item.wikiViews30 ?? item.candidateScore) || 0;
          const width = maxViews > 0 ? Math.max(3, (views / maxViews) * 100) : 0;
          const rank = item.ranking || (page - 1) * PAGE_SIZE + index + 1;
          return (
            <article
              key={item.qid || `${item.name}-${rank}`}
              className="grid grid-cols-[36px_minmax(120px,190px)_1fr_auto] items-center gap-3"
            >
              <span className={`flex size-8 items-center justify-center rounded-lg text-xs font-black ${rank <= 3 ? "bg-[#eee9ff] text-brand" : "bg-[#f3f4f7] text-[#777d90]"}`}>
                {rank}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#20243a]">{item.nameKo || item.name}</p>
                <p className="truncate text-[11px] text-[#9499aa]">{item.name} · {entityTypeLabel(item.entityType)}</p>
              </div>
              <div className="h-8 overflow-hidden rounded-lg bg-[#f1effa]" aria-label={`${item.nameKo || item.name} 조회수 ${views.toLocaleString("ko-KR")}회`}>
                <div
                  className="flex h-full items-center rounded-lg bg-gradient-to-r from-[#5c2ef5] to-[#8d6bff] px-3 text-[11px] font-bold text-white transition-[width] duration-500"
                  style={{ width: `${width}%` }}
                >
                  {rank <= 3 ? `${width.toFixed(0)}%` : ""}
                </div>
              </div>
              <strong className="min-w-24 text-right text-xs text-[#4f566d]">{views.toLocaleString("ko-KR")}회</strong>
            </article>
          );
        })}
        {!visibleRows.length ? <p className="py-12 text-center text-sm text-[#9095a6]">이 국가의 수집 결과가 없습니다.</p> : null}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
    </>
  );
}

export function CountryRankingView({ mode }) {
  const loader = mode === "top10" ? getAdminTop10 : getAdminCandidates;
  const { data, error, loading, reload } = useAdminTrendArtifact(loader);
  const [country, setCountry] = useState("KR");
  const [classification, setClassification] = useState("all");
  const [page, setPage] = useState(1);

  if (loading) return <ArtifactLoading />;
  if (error) return <ArtifactError error={error} onRetry={reload} />;

  const payload = data?.payload || {};
  const countries = payload.countries || {};
  const rows = Array.isArray(countries[country]) ? countries[country] : [];
  const isFinal = mode === "top10";
  const isWikimediaCandidate = !isFinal && country !== "KR";
  const classifications = [...new Set(rows.map((item) => item.classification).filter(Boolean))];
  const filteredRows =
    !isFinal && country === "KR" && classification !== "all"
      ? rows.filter((item) => item.classification === classification)
      : rows;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const visibleRows = !isFinal ? filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : filteredRows;

  return (
    <section>
      <ArtifactHeader artifact={data} onReload={reload} />

      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="국가 선택">
        {COUNTRY_CODES.map((code) => {
          const meta = COUNTRY_META[code];
          const active = country === code;
          return (
            <button
              key={code}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setCountry(code);
                setClassification("all");
                setPage(1);
              }}
              className={`flex min-w-[116px] items-center justify-between rounded-xl border px-4 py-3 text-sm font-bold transition ${
                active
                  ? "border-brand bg-brand text-white shadow-[0_10px_25px_rgba(92,46,245,0.18)]"
                  : "border-[#e0e3ed] bg-white text-[#5e647a] hover:border-[#c9bffd]"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{meta.flag}</span>
                {meta.name}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  active ? "bg-white/15" : "bg-[#f0f2f7] text-[#777e92]"
                }`}
              >
                {countryCount(countries, code)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e1e4ed] bg-white shadow-[0_14px_45px_rgba(31,36,66,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eceef4] px-6 py-5">
          <div>
            <h2 className="font-bold">
              {COUNTRY_META[country].flag} {COUNTRY_META[country].name}{" "}
              {isFinal ? "최종 TOP 10" : "국가별 후보군"}
            </h2>
            <p className="mt-1 text-xs text-[#8a90a3]">
              {isFinal ? "7·30·90일 상대 관심도를 한눈에 비교하는 최종 순위" : "최종 비교 전 후보 우선순위"}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-4">
            {isFinal ? <PeriodChartLegend /> : null}
            <span className="rounded-full bg-[#f2efff] px-3 py-1.5 text-xs font-bold text-brand">
              {rows.length}명
            </span>
          </div>
        </div>
        {!isFinal && country === "KR" ? (
          <div className="flex flex-wrap items-center gap-2 border-b border-[#eceef4] bg-[#fafbfe] px-6 py-3">
            <span className="mr-1 text-xs font-bold text-[#73798b]">상태 필터</span>
            {[{ value: "all", label: "전체" }, ...classifications.map((value) => ({ value, label: classificationLabel(value) }))].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setClassification(option.value);
                  setPage(1);
                }}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${classification === option.value ? "border-brand bg-brand text-white" : "border-[#e0e3ed] bg-white text-[#697084] hover:border-[#c8bdfd]"}`}
              >
                {option.label}
              </button>
            ))}
            <span className="ml-auto text-xs text-[#8a90a3]">{filteredRows.length}명 표시</span>
          </div>
        ) : null}

        {isWikimediaCandidate ? (
          <WikimediaBars rows={rows} page={page} onPageChange={setPage} />
        ) : null}


        <div className={isWikimediaCandidate ? "hidden" : "overflow-x-auto"}>
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-[#fafbfe] text-[11px] font-bold uppercase tracking-[0.08em] text-[#858b9e]">
              <tr>
                <th className="w-20 px-6 py-4">순위</th>
                <th className="px-4 py-4">아티스트</th>
                {isFinal ? (
                  <>
                    <th className="w-[46%] px-4 py-4">기간별 관심도</th>
                    <th className="px-4 py-4">상태</th>
                    <th className="px-4 py-4">조회 방식</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-4">후보 점수</th>
                    <th className="px-4 py-4">7일</th>
                    <th className="px-4 py-4">30일</th>
                    <th className="px-4 py-4">90일</th>
                    <th className="px-4 py-4">신호</th>
                    <th className="px-4 py-4">상태</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceef4]">
              {visibleRows.map((item, index) => (
                <tr
                  key={item.qid || `${item.name}-${index}`}
                  className="transition-colors hover:bg-[#faf9ff]"
                >
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex size-8 items-center justify-center rounded-lg text-xs font-black ${
                        (item.ranking || index + 1) <= 3
                          ? "bg-[#eee9ff] text-brand"
                          : "bg-[#f3f4f7] text-[#777d90]"
                      }`}
                    >
                      {item.ranking || index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-[#20243a]">{item.nameKo || item.name}</p>
                    <p className="mt-1 text-xs text-[#9499aa]">
                      {item.name}
                      {item.entityType ? ` · ${entityTypeLabel(item.entityType)}` : ""}
                    </p>
                  </td>
                  {isFinal ? (
                    <>
                      <td className="px-4 py-5">
                        <PeriodScoreChart scores={item.scores} name={item.nameKo || item.name} />
                      </td>
                      <td className="px-4 py-4"><ClassificationBadge value={item.classification} /></td>
                      <td className="max-w-[190px] truncate px-4 py-4 text-xs text-[#777d90]">{queryModeLabel(item.queryMode)}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-4"><strong className="text-brand">{score(item.candidateScore)}</strong></td>
                      <td className="px-4 py-4 font-semibold">{score(item.scores?.short7)}</td>
                      <td className="px-4 py-4 font-semibold">{score(item.scores?.medium30)}</td>
                      <td className="px-4 py-4 font-semibold">{score(item.scores?.long90)}</td>
                      <td className="max-w-[220px] truncate px-4 py-4 text-xs text-[#777d90]">{signalLabel(item.candidateSignal)}</td>
                      <td className="px-4 py-4"><ClassificationBadge value={item.classification} /></td>
                    </>
                  )}
                </tr>
              ))}
              {!visibleRows.length ? (
                <tr>
                  <td colSpan={isFinal ? 5 : 8} className="px-6 py-16 text-center text-sm text-[#9095a6]">
                    이 국가의 수집 결과가 없습니다.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {!isFinal && country === "KR" ? (
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        ) : null}
      </div>
      <WarningPanel warnings={payload.warnings} />
    </section>
  );
}
