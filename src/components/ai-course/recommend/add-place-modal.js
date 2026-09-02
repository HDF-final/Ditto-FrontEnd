"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, X } from "./recommend-icons";
import { FLOOR_ORDER } from "@/lib/navigation/navigation-dataset";
import {
  getPlaceCategoryLabel,
  PLACE_CATEGORY_FILTERS,
} from "@/lib/navigation/place-category";
import { getFallbackPlaceImage } from "@/lib/navigation/course-routing-service";

const ALL = "__all__";

// Category pill button
function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className="shrink-0 rounded-full px-4 py-1.5 text-[12px] font-bold transition-all cursor-pointer"
      style={
        active
          ? { background: "#5c2ef5", color: "white", border: "1px solid #5c2ef5", boxShadow: "0 2px 6px rgba(92,46,245,0.25)" }
          : { background: "white", color: "#6b6685", border: "1px solid #e0d9f8" }
      }
    >
      {label}
    </button>
  );
}

/**
 * Place picker shown when the user taps "장소 추가".
 * Exact proportions matching the user's floor sidebar reference screenshot.
 */
export function AddPlaceModal({
  open,
  places = [],
  loading = false,
  onAdd,
  onClose,
  onPlaceClick,
}) {
  const t = useTranslations("aiCourse");
  const [category, setCategory] = useState(ALL);
  const [floor, setFloor] = useState(ALL);
  const [query, setQuery] = useState("");

  // Category options: default categories + any unique categories from places
  const categoryOptions = useMemo(() => {
    const defaults = PLACE_CATEGORY_FILTERS;
    const fromPlaces = Array.from(
      new Set(places.map((place) => place.category).filter(Boolean)),
    );
    const merged = Array.from(new Set([...defaults, ...fromPlaces]));
    return [ALL, ...merged];
  }, [places]);

  // Show all floors in descending order (6F → 5F → ... → 1F → B1 → B2)
  const floorOptions = useMemo(
    () => [ALL, ...FLOOR_ORDER.slice().reverse()],
    [],
  );

  const filtered = useMemo(
    () =>
      places.filter(
        (p) =>
          (category === ALL || p.category === category) &&
          (floor === ALL || p.floor === floor) &&
          (p.name || "")
            .toLocaleLowerCase("ko")
            .includes(query.trim().toLocaleLowerCase("ko")),
      ),
    [places, category, floor, query],
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
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-5"
      style={{ backgroundColor: "rgba(10,8,20,0.72)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative flex h-[min(640px,calc(100dvh-0.75rem))] max-h-[calc(100dvh-0.75rem)] w-full max-w-[620px] flex-col overflow-hidden rounded-t-[24px] bg-white shadow-[0_32px_80px_rgba(0,0,0,0.45)] animate-in zoom-in-95 duration-150 sm:h-[min(640px,calc(100dvh-2.5rem))] sm:max-h-[calc(100dvh-2.5rem)] sm:rounded-[28px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-[#f0ecfa] bg-white px-4 pt-4 pb-3 sm:px-6 sm:pt-5 sm:pb-3.5">
          <div className="min-w-0 pr-3">
            <h2 className="text-[18px] font-black text-[#1a142e] sm:text-[19px]">{t("addPlace")}</h2>
            <p className="mt-0.5 text-[12px] leading-snug text-[#9994ad]">
              {t("placePickerDescription")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#6b6685] transition-colors hover:bg-[#f0ecfa] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body: floor chips on mobile, sidebar on sm+ */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden sm:flex-row">
          <div className="hide-scrollbar flex shrink-0 gap-2 overflow-x-auto border-b border-[#f0ecfa] px-4 py-2.5 sm:hidden">
            {floorOptions.map((f) => {
              const active = floor === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFloor(f)}
                  aria-pressed={active}
                  className={`h-9 shrink-0 rounded-full px-3.5 text-[13px] font-black transition-all cursor-pointer ${
                    active
                      ? "bg-[#5c2ef5] text-white shadow-xs"
                      : "border border-[#e0d9f8] bg-white text-[#2d2843]"
                  }`}
                >
                  {f === ALL ? t("all") : f}
                </button>
              );
            })}
          </div>

          <aside className="hidden w-[100px] shrink-0 flex-col items-center gap-2.5 overflow-y-auto border-r border-[#f0ecfa] bg-white px-2 py-4 sm:flex sm:w-[118px] sm:px-3">
            <p className="mb-0.5 text-[12px] font-bold text-[#9994ad]">
              {t("floor")}
            </p>
            {floorOptions.map((f) => {
              const active = floor === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFloor(f)}
                  aria-pressed={active}
                  className={`flex h-11 w-[88px] shrink-0 items-center justify-center rounded-full text-[18px] transition-all cursor-pointer ${
                    active
                      ? "bg-[#5c2ef5] text-white font-black shadow-xs"
                      : "bg-white text-[#2d2843] border border-[#e0d9f8] font-black hover:bg-[#faf8ff]"
                  }`}
                >
                  {f === ALL ? t("all") : f}
                </button>
              );
            })}
          </aside>

          <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
            <div className="flex shrink-0 flex-col gap-3 border-b border-[#f0ecfa] p-3 sm:p-4">
              <label className="relative block">
                <span className="sr-only">{t("searchStore")}</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("searchPlaceholder", { count: places.length })}
                  className="w-full rounded-[14px] border border-[#e0d9f8] bg-[#faf8ff] px-3.5 py-2.5 text-[13px] text-[#1a142e] outline-none transition-colors placeholder:text-[#aaa5b8] focus:border-[#5c2ef5] focus:bg-white focus:ring-2 focus:ring-[#5c2ef5]/20"
                />
              </label>

              <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto pb-0.5">
                <span className="shrink-0 text-[11.5px] font-bold text-[#9994ad]">
                  {t("category")}
                </span>
                {categoryOptions.map((c) => (
                  <FilterChip
                    key={c}
                    label={c === ALL ? t("all") : getPlaceCategoryLabel(c, t)}
                    active={category === c}
                    onClick={() => setCategory(c)}
                  />
                ))}
              </div>
            </div>

            {/* Candidate Places List */}
            <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-3 sm:p-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <div className="size-7 animate-spin rounded-full border-2 border-[#5c2ef5] border-t-transparent" />
                  <p className="text-[12px] font-bold text-[#9994ad]">
                    {t("loadingStores")}
                  </p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                  <span className="text-3xl">🗺️</span>
                  <p className="text-[12px] font-bold text-[#6b6685]">
                    {places.length === 0 ? t("allAdded") : t("noMatches")}
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
                        aiNotice: null,
                        isAiVersion: false,
                        onAddPlace: () => handleAdd(place),
                      });
                    }}
                    className="group flex min-w-0 cursor-pointer items-center gap-2.5 rounded-[16px] border border-[#ede8fc] p-2.5 shadow-2xs transition-all hover:border-[#5c2ef5]/40 hover:bg-[#faf8ff] hover:shadow-xs sm:gap-3.5 sm:rounded-[18px] sm:p-3.5"
                    title={t("viewStore")}
                  >
                    <img
                      src={place.image || getFallbackPlaceImage(place)}
                      alt={place.name}
                      className="pointer-events-none size-11 shrink-0 rounded-[12px] object-cover bg-[#f0ecfa] sm:size-[54px] sm:rounded-[14px]"
                    />
                    <div className="pointer-events-none min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${place.categoryStyle}`}
                        >
                          {getPlaceCategoryLabel(place.category, t)}
                        </span>
                        {place.floor && (
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f0ecfa] text-[#5c2ef5]">
                            {place.floor}
                          </span>
                        )}
                      </div>
                      <h3 className="text-[14.5px] font-black text-[#1a142e] truncate group-hover:text-[#5c2ef5] transition-colors">
                        {place.name}
                      </h3>
                      <p className="text-[11.5px] text-[#6b6685] leading-[1.35] line-clamp-1 mt-0.5">
                        {place.desc}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdd(place);
                      }}
                      className="z-10 flex shrink-0 items-center gap-1 rounded-full bg-[#5c2ef5] px-3 py-1.5 text-[11px] font-black text-white shadow-xs transition-all hover:bg-[#4a22d4] active:scale-95 cursor-pointer sm:px-4 sm:py-2 sm:text-[12px]"
                    >
                      <Plus size={11} /> {t("add")}
                    </button>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
