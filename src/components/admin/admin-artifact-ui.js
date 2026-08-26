"use client";

import { useState } from "react";

export const COUNTRY_META = {
  KR: { flag: "🇰🇷", name: "한국" },
  CN: { flag: "🇨🇳", name: "중국" },
  JP: { flag: "🇯🇵", name: "일본" },
  US: { flag: "🇺🇸", name: "미국" },
};

export function formatAdminDate(value) {
  if (!value) return "기록 없음";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  }).format(date);
}

export function StatusBadge({ status }) {
  const complete = status === "complete";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${complete ? "bg-[#e9f9f0] text-[#12804b]" : "bg-[#fff4dc] text-[#a96700]"}`}>
      <span className={`size-1.5 rounded-full ${complete ? "bg-[#20ad6a]" : "bg-[#f1a72b]"}`} />
      {complete ? "수집 완료" : "일부 수집"}
    </span>
  );
}

export function ArtifactHeader({ artifact, onReload }) {
  const period = artifact?.payload?.period;
  const periodText = period?.start && period?.end
    ? `${period.start} ~ ${period.end}`
    : period?.days
      ? `최근 ${period.days}일`
      : "최신 산출물";

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e2e5ef] bg-white px-5 py-4 shadow-[0_8px_30px_rgba(25,30,60,0.04)]">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={artifact?.status} />
        <span className="text-xs font-semibold text-[#687087]">{periodText}</span>
        <span className="h-3 w-px bg-[#dfe2eb]" />
        <span className="text-xs text-[#8a90a3]">생성 {formatAdminDate(artifact?.builtAt)}</span>
        <span className="text-xs text-[#8a90a3]">경고 {artifact?.warningCount || 0}건</span>
      </div>
      <button type="button" onClick={onReload} className="inline-flex items-center gap-2 rounded-xl border border-[#dfe2ec] bg-white px-4 py-2 text-xs font-bold text-[#4d536a] transition hover:border-[#c8bdfd] hover:text-brand">
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 11a8.1 8.1 0 1 0 2 5.3"/><path d="M20 4v7h-7"/></svg>
        새로고침
      </button>
    </div>
  );
}

export function ArtifactLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((item) => <div key={item} className="h-44 animate-pulse rounded-2xl border border-[#e5e7ef] bg-white" />)}
    </div>
  );
}

export function ArtifactError({ error, onRetry }) {
  return (
    <div className="rounded-2xl border border-[#f3d8da] bg-[#fff9f9] p-8 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#ffe9eb] text-xl">!</div>
      <h2 className="mt-4 font-bold text-[#562a31]">산출물을 불러오지 못했어요</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#8c656b]">{error?.message || "백엔드 연결과 관리자 권한을 확인해주세요."}</p>
      <button type="button" onClick={onRetry} className="mt-5 rounded-xl bg-[#231f35] px-5 py-2.5 text-xs font-bold text-white">다시 시도</button>
    </div>
  );
}

// `open`·`label` 은 코스 초안 화면이 쓴다. 거기서는 경고가 곁다리가 아니라 관리자가
// 제일 먼저 봐야 하는 것이라 펼친 채로 띄운다. 기본값은 트렌드 화면의 지금 모습 그대로다.
export function WarningPanel({ warnings = [], open = false, label = "수집 경고" }) {
  if (!warnings.length) return null;
  return (
    <details open={open} className="mt-6 rounded-2xl border border-[#f0dfb8] bg-[#fffaf0] px-5 py-4">
      <summary className="cursor-pointer text-sm font-bold text-[#7d5912]">{label} {warnings.length}건 확인</summary>
      <ul className="mt-3 space-y-2 border-t border-[#f0dfb8] pt-3 text-xs leading-5 text-[#856c3a]">
        {warnings.map((warning, index) => <li key={`${index}-${String(warning)}`}>• {typeof warning === "string" ? warning : JSON.stringify(warning)}</li>)}
      </ul>
    </details>
  );
}

// 아래 둘은 **초안 카드와 캐시된 코스 카드가 같이 쓴다.** 둘 다 인물 하나를 카드로
// 늘어놓는 화면이고, 사진이 깨졌을 때의 처리와 남은 시간 문구가 달라야 할 이유가 없다.

/** 셀럽 캐시는 전부 다음 00시(KST)에 만료된다. 남은 초를 사람 말로 옮긴다. */
export function ttlLabel(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value <= 0) return "만료됨";
  const hours = Math.floor(value / 3600);
  if (hours >= 1) return `${hours}시간 뒤 만료`;
  return `${Math.max(1, Math.floor(value / 60))}분 뒤 만료`;
}

/** 카드 위쪽 사진. 없거나 깨졌으면 이름 두 글자를 대신 띄운다. */
export function CardHero({ hero, name, loading = false }) {
  // 실패한 주소를 기억한다. 참/거짓으로 두면 사진이 갈려도 계속 빈 자리다.
  const [failedUrl, setFailedUrl] = useState(null);

  if (hero?.url && failedUrl !== hero.url) {
    return (
      <span className="relative block h-[168px] overflow-hidden rounded-xl bg-[#f1f2f6]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hero.url}
          alt={hero.caption || name}
          loading="lazy"
          onError={() => setFailedUrl(hero.url)}
          className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        {hero.caption ? (
          <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/65 to-transparent px-3 pb-2 pt-6 text-[11px] font-semibold text-white">
            {hero.caption}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <span className="flex h-[168px] items-center justify-center rounded-xl bg-gradient-to-br from-[#efeaff] to-[#f7f5ff]">
      {loading ? (
        <span className="size-5 animate-spin rounded-full border-2 border-[#d9ddef] border-t-brand" />
      ) : (
        <span className="text-3xl font-black text-[#c7bdf5]">{String(name || "").slice(0, 2)}</span>
      )}
    </span>
  );
}
