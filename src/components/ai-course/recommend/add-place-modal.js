"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import { Plus, X } from "./recommend-icons";
import { DEPARTMENT_CATEGORIES, DEPARTMENT_FLOORS } from "./recommend-data";

const ALL = "전체";

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
export function AddPlaceModal({ open, places, onAdd, onClose }) {
  const [category, setCategory] = useState(ALL);
  const [floor, setFloor] = useState(ALL);

  // Only show categories/floors that actually have candidates available.
  const categoryOptions = useMemo(
    () => [ALL, ...DEPARTMENT_CATEGORIES.filter((c) => places.some((p) => p.category === c))],
    [places]
  );
  const floorOptions = useMemo(
    () => [ALL, ...DEPARTMENT_FLOORS.filter((f) => places.some((p) => p.floor === f))],
    [places]
  );

  const filtered = useMemo(
    () =>
      places.filter(
        (p) =>
          (category === ALL || p.category === category) &&
          (floor === ALL || p.floor === floor)
      ),
    [places, category, floor]
  );

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
            <h2 className="text-[18px] font-bold text-[#1a142e]">장소 추가</h2>
            <p className="text-[12px] text-[#9994ad] mt-1">
              백화점 안 상점을 카테고리·층별로 골라보세요
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
          <div>
            <p className="text-[10px] font-bold tracking-wide text-[#9994ad] mb-[6px]">
              카테고리
            </p>
            <div className="flex gap-[7px] overflow-x-auto pb-1">
              {categoryOptions.map((c) => (
                <FilterChip
                  key={c}
                  label={c}
                  active={category === c}
                  onClick={() => setCategory(c)}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-wide text-[#9994ad] mb-[6px]">
              층수
            </p>
            <div className="flex gap-[7px] overflow-x-auto pb-1">
              {floorOptions.map((f) => (
                <FilterChip
                  key={f}
                  label={f}
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
                  ? "추천할 수 있는 장소를 모두 담았어요"
                  : "선택한 조건에 맞는 장소가 없어요"}
              </p>
            </div>
          ) : (
            filtered.map((place) => (
              <div
                key={place.id}
                className="flex items-center gap-[12px] rounded-[14px] p-[12px] border-2 border-transparent hover:border-[#e0d9f8] hover:bg-[#faf8ff] transition-all"
              >
                {place.image ? (
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-[60px] h-[60px] rounded-[10px] object-cover shrink-0"
                  />
                ) : (
                  <div
                    className="w-[60px] h-[60px] rounded-[10px] shrink-0"
                    style={{
                      background: `linear-gradient(135deg,${place.accentColor}22,${place.accentColor}0a)`,
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
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
                  <h3 className="text-[13px] font-bold text-[#1a142e] truncate">
                    {place.name}
                  </h3>
                  <p className="text-[11px] text-[#6b6685] leading-[1.4] line-clamp-2">
                    {place.desc}
                  </p>
                </div>
                <button
                  onClick={() => onAdd(place)}
                  className="shrink-0 flex items-center gap-[4px] rounded-full px-[13px] py-[7px] text-[12px] font-semibold text-white bg-[#5c2ef5] hover:bg-[#4a22d4] transition-colors active:scale-95"
                >
                  <Plus size={13} /> 추가
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
