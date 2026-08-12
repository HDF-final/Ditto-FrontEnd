"use client";

/* eslint-disable @next/next/no-img-element */

import { Plus, X } from "./recommend-icons";

/**
 * Place picker shown when the user taps "장소 추가".
 * Lists candidate places (those not yet in the course) and lets the user pick.
 */
export function AddPlaceModal({ open, places, onAdd, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-5"
      style={{ backgroundColor: "rgba(10,8,20,0.72)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[440px] max-h-[82vh] rounded-[24px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.45)] bg-white flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 flex items-start justify-between px-6 pt-6 pb-4 border-b border-[#f0ecfa]">
          <div>
            <h2 className="text-[18px] font-bold text-[#1a142e]">장소 추가</h2>
            <p className="text-[12px] text-[#9994ad] mt-1">
              코스에 넣을 장소를 골라보세요
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[#f0ecfa] text-[#6b6685]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Candidate list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-[10px]">
          {places.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <span className="text-2xl">🗺️</span>
              <p className="text-[13px] text-[#6b6685]">
                추천할 수 있는 장소를 모두 담았어요
              </p>
            </div>
          ) : (
            places.map((place) => (
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
                  <span
                    className={`inline-block text-[10px] font-medium px-[8px] py-[2px] rounded-full mb-[5px] ${place.categoryStyle}`}
                  >
                    {place.category}
                  </span>
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
