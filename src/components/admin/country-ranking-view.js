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

const COUNTRY_CODES = ["KR", "CN", "JP", "US"];

function score(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  return number.toFixed(number % 1 ? 1 : 0);
}

function classificationLabel(value) {
  return (
    {
      sustained: "지속 상승",
      rising: "상승",
      breakout: "급상승",
      steady: "유지",
    }[value] || value || "-"
  );
}

function countryCount(countries, code) {
  return Array.isArray(countries?.[code]) ? countries[code].length : 0;
}

export function CountryRankingView({ mode }) {
  const loader = mode === "top10" ? getAdminTop10 : getAdminCandidates;
  const { data, error, loading, reload } = useAdminTrendArtifact(loader);
  const [country, setCountry] = useState("KR");

  if (loading) return <ArtifactLoading />;
  if (error) return <ArtifactError error={error} onRetry={reload} />;

  const payload = data?.payload || {};
  const countries = payload.countries || {};
  const rows = Array.isArray(countries[country]) ? countries[country] : [];
  const isFinal = mode === "top10";

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
              onClick={() => setCountry(code)}
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
        <div className="flex items-center justify-between border-b border-[#eceef4] px-6 py-5">
          <div>
            <h2 className="font-bold">
              {COUNTRY_META[country].flag} {COUNTRY_META[country].name}{" "}
              {isFinal ? "최종 TOP 10" : "국가별 후보군"}
            </h2>
            <p className="mt-1 text-xs text-[#8a90a3]">
              {isFinal ? "화면 노출용 최종 순위" : "최종 비교 전 후보 우선순위"}
            </p>
          </div>
          <span className="rounded-full bg-[#f2efff] px-3 py-1.5 text-xs font-bold text-brand">
            {rows.length}명
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-[#fafbfe] text-[11px] font-bold uppercase tracking-[0.08em] text-[#858b9e]">
              <tr>
                <th className="w-20 px-6 py-4">순위</th>
                <th className="px-4 py-4">아티스트</th>
                {isFinal ? (
                  <>
                    <th className="px-4 py-4">7일</th>
                    <th className="px-4 py-4">30일</th>
                    <th className="px-4 py-4">90일</th>
                    <th className="px-4 py-4">관심도</th>
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
              {rows.map((item, index) => (
                <tr
                  key={item.qid || `${item.name}-${index}`}
                  className="transition-colors hover:bg-[#faf9ff]"
                >
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex size-8 items-center justify-center rounded-lg text-xs font-black ${
                        index < 3
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
                      {item.entityType ? ` · ${item.entityType}` : ""}
                    </p>
                  </td>
                  {isFinal ? (
                    <>
                      <td className="px-4 py-4 font-semibold">{score(item.scores?.short7)}</td>
                      <td className="px-4 py-4 font-semibold">{score(item.scores?.medium30)}</td>
                      <td className="px-4 py-4 font-semibold">{score(item.scores?.long90)}</td>
                      <td className="px-4 py-4"><strong className="text-brand">{score(item.interestScore)}</strong></td>
                      <td className="px-4 py-4"><span className="rounded-full bg-[#f0f7ff] px-2.5 py-1 text-[11px] font-bold text-[#3570a8]">{classificationLabel(item.classification)}</span></td>
                      <td className="max-w-[190px] truncate px-4 py-4 text-xs text-[#777d90]">{item.queryMode || "-"}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-4"><strong className="text-brand">{score(item.candidateScore)}</strong></td>
                      <td className="px-4 py-4 font-semibold">{score(item.scores?.short7)}</td>
                      <td className="px-4 py-4 font-semibold">{score(item.scores?.medium30)}</td>
                      <td className="px-4 py-4 font-semibold">{score(item.scores?.long90)}</td>
                      <td className="max-w-[220px] truncate px-4 py-4 text-xs text-[#777d90]">{item.candidateSignal || "-"}</td>
                      <td className="px-4 py-4"><span className="rounded-full bg-[#f0f7ff] px-2.5 py-1 text-[11px] font-bold text-[#3570a8]">{classificationLabel(item.classification)}</span></td>
                    </>
                  )}
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-sm text-[#9095a6]">
                    이 국가의 수집 결과가 없습니다.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
      <WarningPanel warnings={payload.warnings} />
    </section>
  );
}
