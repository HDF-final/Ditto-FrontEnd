"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, X } from "./recommend-icons";
import { FLOOR_ORDER } from "@/lib/navigation/navigation-dataset";
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
    const defaults = ["매장", "팝업", "카페", "음식점"];
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-5"
      style={{ backgroundColor: "rgba(10,8,20,0.72)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[620px] h-[640px] max-h-[90vh] rounded-[28px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.45)] bg-white flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 flex items-start justify-between px-6 pt-5 pb-3.5 border-b border-[#f0ecfa] bg-white">
          <div>
            <h2 className="text-[19px] font-black text-[#1a142e]">{t("addPlace")}</h2>
            <p className="text-[12px] text-[#9994ad] mt-0.5">
              {t("placePickerDescription")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[#f0ecfa] text-[#6b6685] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body: Left Floor Sidebar + Right Content */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Left: Floor Selector Sidebar (118px width, 88px x 44px buttons, 18px font-black) */}
          <aside className="w-[118px] shrink-0 border-r border-[#f0ecfa] bg-white flex flex-col items-center py-4 px-3 overflow-y-auto gap-2.5">
            <p className="text-[12px] font-bold text-[#9994ad] mb-0.5">
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
                  className={`w-[88px] h-[44px] shrink-0 rounded-full flex items-center justify-center text-[18px] transition-all cursor-pointer ${
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

          {/* Right: Main Content (Search Bar + Category Filter + Scrollable Candidate List) */}
          <main className="flex-1 flex flex-col min-w-0 bg-white">
            {/* Top Filter Area: Search Bar + Category Chips */}
            <div className="shrink-0 p-4 border-b border-[#f0ecfa] flex flex-col gap-3">
              {/* Search Bar */}
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

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
                <span className="text-[11.5px] font-bold text-[#9994ad] shrink-0">
                  {t("category")}
                </span>
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

            {/* Candidate Places List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <div className="size-7 animate-spin rounded-full border-2 border-[#5c2ef5] border-t-transparent" />
                  <p className="text-[12px] font-bold text-[#9994ad]">
                    매장 목록을 불러오는 중...
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
                        isAiVersion: false,
                        onAddPlace: () => handleAdd(place),
                      });
                    }}
                    className="flex items-center gap-3.5 rounded-[18px] border border-[#ede8fc] p-3.5 hover:border-[#5c2ef5]/40 hover:bg-[#faf8ff] transition-all cursor-pointer group shadow-2xs hover:shadow-xs"
                    title={t("viewStore")}
                  >
                    <img
                      src={place.image || getFallbackPlaceImage(place)}
                      alt={place.name}
                      className="w-[54px] h-[54px] rounded-[14px] object-cover shrink-0 pointer-events-none bg-[#f0ecfa]"
                    />
                    <div className="flex-1 min-w-0 pointer-events-none">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${place.categoryStyle}`}
                        >
                          {place.category}
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
                      className="shrink-0 flex items-center gap-1 rounded-full px-4 py-2 text-[12px] font-black text-white bg-[#5c2ef5] hover:bg-[#4a22d4] transition-all active:scale-95 cursor-pointer shadow-xs z-10"
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
