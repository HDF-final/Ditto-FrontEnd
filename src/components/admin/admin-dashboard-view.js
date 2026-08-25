"use client";

import Link from "next/link";
import { getAdminTrendOverview } from "@/lib/api/admin-trends";
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
      <span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-black tracking-[0.12em] ${tones[tone]}`}>
        {label}
      </span>
      <p className="mt-5 text-3xl font-black tracking-[-0.04em] text-[#20243a]">{value}</p>
      <p className="mt-2 text-xs text-[#8a90a3]">{caption}</p>
    </article>
  );
}

export function AdminDashboardView() {
  const { data, error, loading, reload } = useAdminTrendArtifact(getAdminTrendOverview);

  if (loading) return <ArtifactLoading />;
  if (error) return <ArtifactError error={error} onRetry={reload} />;

  const { top10, candidates, youtube } = data;
  const artifacts = [top10, candidates, youtube];
  const youtubeOverall = Array.isArray(youtube?.payload?.overall)
    ? youtube.payload.overall
    : [];

  return (
    <section className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="최종 순위" value={totalCountryRows(top10?.payload?.countries)} caption="4개국 최종 순위 항목" tone="purple" />
        <MetricCard label="후보군" value={totalCountryRows(candidates?.payload?.countries)} caption="교차 검증 후보 전체" tone="blue" />
        <MetricCard label="YOUTUBE 급상승" value={youtubeOverall.length} caption="최근 7일 전체 급상승" tone="green" />
        <MetricCard label="수집 경고" value={warningCount(artifacts)} caption="확인이 필요한 수집 경고" tone="amber" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
        <article className="overflow-hidden rounded-2xl border border-[#e1e4ed] bg-white shadow-[0_14px_45px_rgba(31,36,66,0.05)]">
          <div className="flex items-center justify-between border-b border-[#eceef4] px-6 py-5">
            <div>
              <h2 className="font-bold">오늘의 국가별 TOP 3</h2>
              <p className="mt-1 text-xs text-[#8a90a3]">최신 TOP 10 산출물 중 국가별 상위 3명 미리보기</p>
            </div>
            <Link href="/admin/trends/rankings" className="text-xs font-bold text-brand hover:underline">
              전체 보기 →
            </Link>
          </div>

          <div className="grid md:grid-cols-2">
            {COUNTRIES.map((code, countryIndex) => {
              const rows = latestRows(top10, code).slice(0, 3);
              return (
                <section
                  key={code}
                  className={`p-4 ${countryIndex >= 2 ? "border-t border-[#eceef4]" : ""} ${countryIndex % 2 === 1 ? "md:border-l md:border-[#eceef4]" : ""}`}
                >
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-black">
                    <span>{COUNTRY_META[code].flag}</span>
                    {COUNTRY_META[code].name}
                  </h3>
                  <ol className="space-y-2">
                    {rows.map((item, index) => (
                      <li key={item.qid || `${code}-${item.name}-${index}`} className="flex items-center gap-3 rounded-xl bg-[#fafbfe] px-3 py-2">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#eee9ff] text-[11px] font-black text-brand">
                          {item.ranking || index + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-xs font-bold">{item.nameKo || item.name}</span>
                      </li>
                    ))}
                    {!rows.length ? <li className="py-8 text-center text-xs text-[#9aa0b0]">결과 없음</li> : null}
                  </ol>
                </section>
              );
            })}
          </div>
        </article>

        <article className="rounded-2xl border border-[#e1e4ed] bg-white p-6 shadow-[0_14px_45px_rgba(31,36,66,0.05)]">
          <h2 className="font-bold">수집 상태</h2>
          <p className="mt-1 text-xs text-[#8a90a3]">S3 최신 산출물 기준</p>
          <div className="mt-5 divide-y divide-[#eceef4]">
            {[
              ["국가별 TOP 10", top10, "/admin/trends/rankings"],
              ["국가별 후보군", candidates, "/admin/trends/candidates"],
              ["YouTube 급상승", youtube, "/admin/trends/youtube"],
            ].map(([label, artifact, href]) => (
              <Link key={label} href={href} className="flex items-center justify-between gap-4 py-4 first:pt-0 hover:text-brand">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{label}</p>
                  <p className="mt-1 text-[11px] text-[#9095a6]">{formatAdminDate(artifact?.builtAt)}</p>
                </div>
                <StatusBadge status={artifact?.status} />
              </Link>
            ))}
          </div>
          <button type="button" onClick={reload} className="mt-5 w-full rounded-xl border border-[#dedfee] px-4 py-3 text-xs font-bold text-[#5f6579] transition hover:border-[#c8bdfd] hover:text-brand">
            전체 새로고침
          </button>
        </article>
      </div>
    </section>
  );
}
