"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, X } from "./recommend-icons";
import { FLOOR_ORDER } from "@/lib/navigation/navigation-dataset";

const ALL = "__all__";

// Small pill button used by both the category and floor filter rows.
function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className="shrink-0 rounded-full px-[13px] py-[6px] text-[12px] font-semibold transition-colors"
      style={
        active
          ? { background: "#5c2ef5", color: "white", border: "1px solid #5c2ef5" }
          : { background: "white", color: "#6b6685", border: "1px solid #e0d9f8" }
      }
    >
      {label}
    </button>
  );
}

/**
 * Place picker shown when the user taps "장소 추가".
 *
 * DITTO only offers shops inside the department store, so the list can be
 * narrowed by category (팝업, 음식점 …) and floor (B2 → 6F) to make picking easy.
 * Already-added places are filtered out by the caller before they reach here.
 */
export function AddPlaceModal({ open, places, onAdd, onClose, onPlaceClick }) {
  const t = useTranslations("aiCourse");
  const [category, setCategory] = useState(ALL);
  const [floor, setFloor] = useState(ALL);
  const [query, setQuery] = useState("");

  // Only show categories/floors that actually have candidates available.
  const categoryOptions = useMemo(
    () => [ALL, ...new Set(places.map((place) => place.category))],
    [places]
  );
  const floorOptions = useMemo(
    () => [ALL, ...FLOOR_ORDER.filter((f) => places.some((p) => p.floor === f))],
    [places]
  );

  const filtered = useMemo(
    () =>
      places.filter(
        (p) =>
          (category === ALL || p.category === category) &&
          (floor === ALL || p.floor === floor) &&
          p.name
            .toLocaleLowerCase("ko")
            .includes(query.trim().toLocaleLowerCase("ko"))
      ),
    [places, category, floor, query]
  );

  const handleAdd = (place) => {
    onAdd(place);
    setCategory(ALL);
    setFloor(ALL);
    setQuery("");
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-5"
      style={{ backgroundColor: "rgba(10,8,20,0.72)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[520px] max-h-[85vh] rounded-[24px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.45)] bg-white flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 flex items-start justify-between px-6 pt-6 pb-4 border-b border-[#f0ecfa]">
          <div>
            <h2 className="text-[18px] font-bold text-[#1a142e]">{t("addPlace")}</h2>
            <p className="text-[12px] text-[#9994ad] mt-1">
              {t("placePickerDescription")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[#f0ecfa] text-[#6b6685]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Filters: category + floor */}
        <div className="shrink-0 px-5 pt-4 pb-3 border-b border-[#f0ecfa] flex flex-col gap-[10px]">
          <label>
            <span className="sr-only">{t("searchStore")}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchPlaceholder", { count: places.length })}
              className="w-full rounded-xl border border-[#e0d9f8] bg-[#faf8ff] px-3.5 py-2.5 text-[13px] text-[#1a142e] outline-none transition-colors placeholder:text-[#aaa5b8] focus:border-[#5c2ef5]"
            />
          </label>
          <div>
            <p className="text-[10px] font-bold tracking-wide text-[#9994ad] mb-[6px]">
              {t("category")}
            </p>
            <div className="flex gap-[7px] overflow-x-auto pb-1">
              {categoryOptions.map((c) => (
                <FilterChip
                  key={c}
                  label={c === ALL ? t("all") : c}
                  active={category === c}
                  onClick={() => setCategory(c)}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-wide text-[#9994ad] mb-[6px]">
              {t("floor")}
            </p>
            <div className="flex gap-[7px] overflow-x-auto pb-1">
              {floorOptions.map((f) => (
                <FilterChip
                  key={f}
                  label={f === ALL ? t("all") : f}
                  active={floor === f}
                  onClick={() => setFloor(f)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Candidate list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-[10px]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <span className="text-2xl">🗺️</span>
              <p className="text-[13px] text-[#6b6685]">
                {places.length === 0
                  ? t("allAdded")
                  : t("noMatches")}
              </p>
            </div>
          ) : (
            filtered.map((place) => (
              <div
                key={place.id}
                onClick={() => {
                  onPlaceClick?.({
                    ...place,
                    modalMode: "compact",
                    isAiRecommended: false,
                    aiReason: null,
                    isAiVersion: false,
                  });
                }}
                className="flex items-center gap-[12px] rounded-[14px] p-[12px] border-2 border-transparent hover:border-[#e0d9f8] hover:bg-[#faf8ff] transition-all cursor-pointer group"
                title={t("viewStore")}
              >
                {place.image ? (
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-[60px] h-[60px] rounded-[10px] object-cover shrink-0 pointer-events-none"
                  />
                ) : (
                  <div
                    className="w-[60px] h-[60px] rounded-[10px] shrink-0 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg,${place.accentColor}22,${place.accentColor}0a)`,
                    }}
                  />
                )}
                <div className="flex-1 min-w-0 pointer-events-none">
                  <div className="flex items-center gap-[5px] mb-[5px]">
                    <span
                      className={`inline-block text-[10px] font-medium px-[8px] py-[2px] rounded-full ${place.categoryStyle}`}
                    >
                      {place.category}
                    </span>
                    {place.floor && (
                      <span className="inline-block text-[10px] font-semibold px-[7px] py-[2px] rounded-full bg-[#f0ecfa] text-[#5c2ef5]">
                        {place.floor}
                      </span>
                    )}
                  </div>
                  <h3 className="text-[13px] font-bold text-[#1a142e] truncate group-hover:text-[#5c2ef5] transition-colors">
                    {place.name}
                  </h3>
                  <p className="text-[11px] text-[#6b6685] leading-[1.4] line-clamp-2">
                    {place.desc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdd(place);
                  }}
                  className="shrink-0 flex items-center gap-[4px] rounded-full px-[13px] py-[7px] text-[12px] font-semibold text-white bg-[#5c2ef5] hover:bg-[#4a22d4] transition-colors active:scale-95 cursor-pointer z-10"
                >
                  <Plus size={13} /> {t("add")}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
