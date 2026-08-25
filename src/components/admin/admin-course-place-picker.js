"use client";

import { useEffect, useMemo, useState } from "react";
import { getAdminCoursePlaces } from "@/lib/api/admin-courses";

// 자리를 갈아 끼울 매장을 고른다. 초안이 들고 있는 차순위 후보를 먼저 보여 주고,
// 거기에 없으면 더현대 전체 목록에서 찾는다.
//
// 카탈로그는 이 컴포넌트가 처음 열릴 때만 부르고 그다음부터는 부모가 들고 있는다
// (147곳이 한 번에 오고 하루에 바뀔 일이 없다).

function PlaceRow({ place, current, onPick }) {
  const [failed, setFailed] = useState(false);
  const disabled = place.navigation_key === current;

  return (
    <li>
      <button
        type="button"
        onClick={() => onPick(place)}
        disabled={disabled}
        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
          disabled
            ? "cursor-default border-[#e6e8f0] bg-[#f7f8fb] opacity-60"
            : "border-[#e6e8f0] bg-white hover:border-brand hover:bg-[#faf9ff]"
        }`}
      >
        {place.image_url && !failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={place.image_url}
            alt=""
            loading="lazy"
            onError={() => setFailed(true)}
            className="size-11 shrink-0 rounded-lg border border-[#eceef4] object-cover"
          />
        ) : (
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#f1f2f6] text-[10px] font-bold text-[#9aa0b0]">
            사진
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-[#20243a]">{place.place_name}</span>
          <span className="mt-0.5 block truncate text-[11px] text-[#9aa0b0]">
            {[place.floor, place.place_type, place.category, place.price_tier]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </span>
        <span className="shrink-0 font-mono text-[10px] text-[#adb2c0]">{place.navigation_key}</span>
        {disabled ? (
          <span className="shrink-0 rounded-full bg-[#eee9ff] px-2 py-0.5 text-[10px] font-bold text-brand">
            지금 이 자리
          </span>
        ) : null}
      </button>
    </li>
  );
}

export function AdminCoursePlacePicker({ slot, alternates = [], onPick, onClose }) {
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState(null);
  const [catalogError, setCatalogError] = useState(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    getAdminCoursePlaces()
      .then((data) => {
        if (active) setCatalog({ nonce, rows: data?.payload?.places || [] });
      })
      .catch((error) => {
        if (active) setCatalog({ nonce, rows: [], error });
      });
    return () => {
      active = false;
    };
  }, [nonce]);

  const ready = catalog?.nonce === nonce;
  // 빈 배열을 렌더마다 새로 만들면 아래 useMemo 의 의존성이 매번 바뀐다.
  const rows = useMemo(() => (ready ? catalog.rows : []), [ready, catalog]);
  const failed = ready ? catalog.error : null;

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return rows
      .filter((place) =>
        [place.place_name, place.category, place.floor, place.place_type, place.navigation_key]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(needle)),
      )
      .slice(0, 40);
  }, [rows, query]);

  return (
    <div className="rounded-2xl border border-[#dcd4fb] bg-[#faf9ff] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-bold text-[#4d536a]">
          <span className="text-brand">{slot?.place_name}</span> 자리를 바꿉니다
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-[#dfe2ec] bg-white px-2.5 py-1 text-[11px] font-bold text-[#6d7387] hover:text-brand"
        >
          닫기
        </button>
      </div>

      {alternates.length ? (
        <div className="mb-3">
          <p className="mb-1.5 text-[11px] font-bold tracking-[0.04em] text-[#7b8195]">
            차순위 후보 {alternates.length}곳
          </p>
          <ul className="space-y-1.5">
            {alternates.map((place) => (
              <PlaceRow
                key={`alt-${place.navigation_key}`}
                place={place}
                current={slot?.navigation_key}
                onPick={onPick}
              />
            ))}
          </ul>
        </div>
      ) : null}

      <label className="block">
        <span className="mb-1.5 block text-[11px] font-bold tracking-[0.04em] text-[#7b8195]">
          더현대 전체에서 찾기 {ready && !failed ? `(${rows.length}곳)` : ""}
        </span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="매장 이름 · 카테고리 · 층 (예: 프라다, 럭셔리, 4F)"
          className="w-full rounded-xl border border-[#dfe2ec] bg-white px-3 py-2.5 text-sm outline-none focus:border-brand"
        />
      </label>

      {!ready ? <p className="mt-3 text-xs text-[#9aa0b0]">장소 목록을 불러오는 중…</p> : null}

      {failed ? (
        <div className="mt-3 flex items-center gap-3 text-xs text-[#c0392b]">
          <span>{failed.message || "장소 목록을 불러오지 못했습니다."}</span>
          <button
            type="button"
            onClick={() => setNonce((value) => value + 1)}
            className="rounded-lg border border-[#f3d8da] bg-white px-2.5 py-1 font-bold"
          >
            다시 시도
          </button>
        </div>
      ) : null}

      {ready && !failed && query.trim() && !matches.length ? (
        <p className="mt-3 text-xs text-[#9aa0b0]">찾는 매장이 없습니다.</p>
      ) : null}

      {matches.length ? (
        <ul className="mt-2 max-h-[320px] space-y-1.5 overflow-y-auto pr-1">
          {matches.map((place) => (
            <PlaceRow
              key={place.navigation_key}
              place={place}
              current={slot?.navigation_key}
              onPick={onPick}
            />
          ))}
        </ul>
      ) : null}
    </div>
  );
}
