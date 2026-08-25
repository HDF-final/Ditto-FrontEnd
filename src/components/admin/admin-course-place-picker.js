"use client";

import { useMemo, useState } from "react";
import { FLOOR_ORDER } from "@/lib/navigation/navigation-dataset";
import { PLACE_CATEGORY_FILTERS } from "@/lib/navigation/place-category";
import { getFallbackPlaceImage } from "@/lib/navigation/course-routing-service";

// 자리를 갈아 끼우거나 새 자리를 넣을 매장을 고른다.
//
// **목록은 /ai-course 의 '장소 추가'와 같은 것을 쓴다** — 편집기가 한 번 받아 두고
// 여기로 내려 준다. 손님이 고를 수 있는 매장과 관리자가 고를 수 있는 매장이 다르면
// 승인해 놓고 손님 화면에서 안 뜨는 자리가 생긴다.
//
// 목록을 스스로 안 받는 것은 성능 문제이기도 하다. 자리마다 이 컴포넌트가 하나씩
// 붙는데, 각자 받으면 자리를 옮겨 다닐 때마다 147곳을 다시 받는다.

const ALL = "__all__";

function Chip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold transition ${
        active
          ? "bg-brand text-white shadow-[0_2px_6px_rgba(92,46,245,0.25)]"
          : "border border-[#e0d9f8] bg-white text-[#6b6685] hover:border-brand"
      }`}
    >
      {label}
    </button>
  );
}

function PlaceRow({ place, disabled, disabledLabel, onPick }) {
  const [failed, setFailed] = useState(false);
  const src = failed ? null : place.image || getFallbackPlaceImage(place);

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
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
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
          <span className="block truncate text-sm font-bold text-[#20243a]">{place.name}</span>
          <span className="mt-0.5 flex items-center gap-1.5">
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${place.categoryStyle}`}>
              {place.category}
            </span>
            <span className="truncate text-[11px] text-[#9aa0b0]">{place.floor}</span>
          </span>
        </span>
        <span className="shrink-0 font-mono text-[10px] text-[#adb2c0]">{place.navigationKey}</span>
        {disabled ? (
          <span className="shrink-0 rounded-full bg-[#eee9ff] px-2 py-0.5 text-[10px] font-bold text-brand">
            {disabledLabel}
          </span>
        ) : null}
      </button>
    </li>
  );
}

export function AdminCoursePlacePicker({
  title,
  catalog = [],
  loading = false,
  error = null,
  alternates = [],
  currentKey = null,
  usedKeys = [],
  onPick,
  onClose,
}) {
  const [category, setCategory] = useState(ALL);
  const [floor, setFloor] = useState(ALL);
  const [query, setQuery] = useState("");

  const used = useMemo(() => new Set(usedKeys), [usedKeys]);

  const categoryOptions = useMemo(() => {
    const fromCatalog = catalog.map((place) => place.category).filter(Boolean);
    return [ALL, ...new Set([...PLACE_CATEGORY_FILTERS, ...fromCatalog])];
  }, [catalog]);

  const floorOptions = useMemo(() => [ALL, ...FLOOR_ORDER.slice().reverse()], []);

  // 차순위 후보는 초안이 들고 있는 것(navigation_key 만 있다)이라 카탈로그와 이어 붙여
  // 사진과 카테고리를 채운다. 카탈로그에 없으면 초안이 준 것을 그대로 쓴다.
  const alternateRows = useMemo(() => {
    if (!alternates.length) return [];
    const byKey = new Map(catalog.map((place) => [place.navigationKey, place]));
    return alternates.map(
      (row) =>
        byKey.get(row.navigation_key) || {
          id: row.navigation_key,
          navigationKey: row.navigation_key,
          name: row.place_name,
          floor: row.floor,
          category: row.category || "매장",
          categoryStyle: "bg-[#f0ecfa] text-[#6b6685]",
          image: row.image_url || null,
        },
    );
  }, [alternates, catalog]);

  const matches = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("ko");
    return catalog
      .filter(
        (place) =>
          (category === ALL || place.category === category) &&
          (floor === ALL || place.floor === floor) &&
          (!needle ||
            (place.name || "").toLocaleLowerCase("ko").includes(needle) ||
            (place.navigationKey || "").toLowerCase().includes(needle)),
      )
      .slice(0, 60);
  }, [catalog, category, floor, query]);

  return (
    <div className="rounded-2xl border border-[#dcd4fb] bg-[#faf9ff] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-bold text-[#4d536a]">{title}</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-[#dfe2ec] bg-white px-2.5 py-1 text-[11px] font-bold text-[#6d7387] hover:text-brand"
        >
          닫기
        </button>
      </div>

      {alternateRows.length ? (
        <div className="mb-3">
          <p className="mb-1.5 text-[11px] font-bold tracking-[0.04em] text-[#7b8195]">
            차순위 후보 {alternateRows.length}곳
          </p>
          <ul className="space-y-1.5">
            {alternateRows.map((place) => (
              <PlaceRow
                key={`alt-${place.navigationKey}`}
                place={place}
                disabled={place.navigationKey === currentKey}
                disabledLabel="지금 이 자리"
                onPick={onPick}
              />
            ))}
          </ul>
        </div>
      ) : null}

      <div className="hide-scrollbar mb-2 flex gap-1.5 overflow-x-auto pb-1">
        {categoryOptions.map((value) => (
          <Chip
            key={value}
            label={value === ALL ? "전체" : value}
            active={category === value}
            onClick={() => setCategory(value)}
          />
        ))}
      </div>

      <div className="hide-scrollbar mb-2 flex gap-1.5 overflow-x-auto pb-1">
        {floorOptions.map((value) => (
          <Chip
            key={value}
            label={value === ALL ? "모든 층" : value}
            active={floor === value}
            onClick={() => setFloor(value)}
          />
        ))}
      </div>

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="매장 이름 또는 navigation key"
        className="w-full rounded-xl border border-[#dfe2ec] bg-white px-3 py-2.5 text-sm outline-none focus:border-brand"
      />

      {loading ? <p className="mt-3 text-xs text-[#9aa0b0]">장소 목록을 불러오는 중…</p> : null}

      {error ? (
        <p className="mt-3 text-xs text-[#c0392b]">
          {error.message || "장소 목록을 불러오지 못했습니다."}
        </p>
      ) : null}

      {!loading && !error ? (
        <>
          <p className="mt-3 text-[11px] text-[#9aa0b0]">
            {matches.length ? `${matches.length}곳` : "조건에 맞는 매장이 없습니다."}
            {matches.length === 60 ? " (앞 60곳만 보입니다 — 검색어를 좁혀 주세요)" : ""}
          </p>
          {matches.length ? (
            <ul className="mt-1.5 max-h-[320px] space-y-1.5 overflow-y-auto pr-1">
              {matches.map((place) => (
                <PlaceRow
                  key={place.navigationKey}
                  place={place}
                  disabled={place.navigationKey === currentKey || used.has(place.navigationKey)}
                  disabledLabel={place.navigationKey === currentKey ? "지금 이 자리" : "코스에 있음"}
                  onPick={onPick}
                />
              ))}
            </ul>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
