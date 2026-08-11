"use client";

import { PlaceThumbnail } from "./place-thumbnail";

export function PlaceSearchResultList({ places, addedIds, onSelect }) {
  if (places.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-ink-muted">
        검색 결과가 없어요.
      </p>
    );
  }

  return (
    <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
      {places.map((place) => {
        const added = addedIds.includes(place.id);
        return (
          <li key={place.id}>
            <button
              type="button"
              disabled={added}
              onClick={() => onSelect(place)}
              className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-2.5 text-left transition hover:border-brand disabled:pointer-events-none disabled:opacity-55"
            >
              <div className="relative size-12 flex-none overflow-hidden rounded-xl bg-surface-muted">
                <PlaceThumbnail src={place.image} alt={place.name} sizes="48px" iconClassName="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">{place.name}</p>
                <p className="truncate text-xs text-ink-muted">{place.category}</p>
              </div>
              <span
                className={[
                  "flex-none rounded-control px-2.5 py-1 text-xs font-bold",
                  added ? "bg-surface-muted text-ink-subtle" : "bg-brand-soft text-brand",
                ].join(" ")}
              >
                {added ? "추가됨" : "상세보기"}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
