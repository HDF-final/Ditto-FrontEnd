"use client";

export function PlaceSearchForm({ value, onChange }) {
  return (
    <div>
      <label htmlFor="place-search" className="sr-only">
        장소 검색
      </label>
      <input
        id="place-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="장소명 또는 카테고리로 검색"
        autoComplete="off"
        className="w-full rounded-control border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-subtle focus:border-brand"
      />
    </div>
  );
}
