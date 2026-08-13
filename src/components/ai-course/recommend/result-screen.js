"use client";

/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react";
import { Plus, Zap, Save, RotateCcw, Check, Trash2 } from "./recommend-icons";
import { places as initialPlaces, extraPlaces } from "./recommend-data";
import { PanelChat } from "./boni-chat";
import { AddPlaceModal } from "./add-place-modal";
import { CourseNavigationMap } from "@/components/navigation/course-navigation-map";

/**
 * Category order used by "최적화" to build a logical route that finishes at a
 * restaurant (the course finale). Lower number = earlier in the course.
 */
const CATEGORY_PRIORITY = {
  전시: 0,
  팝업: 1,
  "디자이너 편집샵": 2,
  패션: 3,
  뷰티: 4,
  카페: 5,
  음식점: 6,
};

function optimizeOrder(list) {
  return [...list].sort((a, b) => {
    const pa = CATEGORY_PRIORITY[a.category] ?? 4;
    const pb = CATEGORY_PRIORITY[b.category] ?? 4;
    if (pa !== pb) return pa - pb;
    return (b.rating ?? 0) - (a.rating ?? 0);
  });
}

function sameOrder(a, b) {
  return a.length === b.length && a.every((item, i) => item.id === b[i].id);
}

export function ResultScreen({ onPlaceClick }) {
  const [items, setItems] = useState(initialPlaces);
  const [history, setHistory] = useState([]); // stack of previous orders for undo
  const [hoveredId, setHoveredId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [visited, setVisited] = useState(() => new Set()); // ids marked "다녀옴"

  const dragIndex = useRef(null);
  const dragStartOrder = useRef(null);

  // Push the current order onto the undo stack, then apply `next`.
  const commit = (next) => {
    setHistory((h) => [...h, items]);
    setItems(next);
  };

  // "이전으로" — revert to the state before the last move (undo), not navigation.
  const undo = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      setItems(h[h.length - 1]);
      return h.slice(0, -1);
    });
  };

  // Candidate places not already in the course.
  const availablePlaces = extraPlaces.filter(
    (p) => !items.some((item) => item.id === p.id)
  );

  const handleAddPlace = (place) => {
    commit([...items, place]);
  };

  const handleDelete = (id) => {
    commit(items.filter((p) => p.id !== id));
  };

  const toggleVisited = (id) => {
    setVisited((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleOptimize = () => {
    const next = optimizeOrder(items);
    if (!sameOrder(next, items)) commit(next);
  };

  // ── Drag to reorder (native HTML5 DnD) ──
  const handleDragStart = (event, index) => {
    dragIndex.current = index;
    dragStartOrder.current = items;
    setDraggingId(items[index].id);
    event.dataTransfer.effectAllowed = "move";
    try {
      event.dataTransfer.setData("text/plain", String(index));
    } catch {
      // Some browsers disallow setData outside a user gesture — safe to ignore.
    }
  };

  const handleDragEnter = (index) => {
    const from = dragIndex.current;
    if (from === null || from === index) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      return next;
    });
    dragIndex.current = index;
  };

  const handleDragEnd = () => {
    const before = dragStartOrder.current;
    if (before && !sameOrder(before, items)) {
      setHistory((h) => [...h, before]);
    }
    dragIndex.current = null;
    dragStartOrder.current = null;
    setDraggingId(null);
  };

  return (
    <>
    <main
      className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden md:h-[calc(100vh-94px)]"
      style={{ background: "#f0ecfa", gap: "12px", padding: "12px" }}
    >
      {/* ── Left: course list ── */}
      <div
        className="flex flex-col gap-[14px] md:overflow-y-auto px-5 md:px-7 py-5 md:py-6 rounded-[20px] md:w-1/4 md:min-w-[300px] md:shrink-0 order-2 md:order-1"
        style={{ background: "white", boxShadow: "0 2px 12px rgba(92,46,245,0.06)" }}
      >
        {/* Editable title */}
        <input
          className="text-[22px] md:text-[26px] font-bold text-[#1a142e] bg-transparent outline-none placeholder-[#ccc8d8] border-b-2 border-transparent focus:border-[#5c2ef5] transition-colors pb-1"
          style={{ outline: "none" }}
          placeholder="코스 제목을 입력하세요"
          value={courseTitle}
          onChange={(e) => setCourseTitle(e.target.value)}
        />

        {/* Action buttons */}
        <div className="flex flex-wrap gap-[8px]">
          <button
            onClick={undo}
            disabled={history.length === 0}
            title="코스를 옮기기 전 상태로 되돌립니다"
            className="flex items-center gap-[5px] border border-[#ccc8d8] rounded-full px-[14px] py-[7px] text-[12px] text-[#1a142e] bg-white hover:bg-[#f7f5ff] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            <RotateCcw size={12} /> 이전으로
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-[5px] border border-[#ccc8d8] rounded-full px-[14px] py-[7px] text-[12px] text-[#1a142e] bg-white hover:bg-[#f7f5ff] transition-colors"
          >
            <Plus size={12} /> 장소 추가
          </button>
          <button
            onClick={handleOptimize}
            className="flex items-center gap-[5px] border border-[#ccc8d8] rounded-full px-[14px] py-[7px] text-[12px] text-[#1a142e] bg-white hover:bg-[#f7f5ff] transition-colors"
          >
            <Zap size={12} className="text-yellow-500" /> 최적화
          </button>
          <button className="flex items-center gap-[5px] rounded-full px-[14px] py-[7px] text-[12px] text-white bg-[#5c2ef5] hover:bg-[#4a22d4] transition-colors">
            <Save size={12} /> 저장
          </button>
        </div>

        {/* Drag hint */}
        <p className="text-[#9994ad] text-[12px] border border-dashed border-[#ccc8d8] rounded-[8px] px-[14px] py-[9px] bg-white/60">
          카드를 드래그해 코스 순서를 바꿔보세요
        </p>

        {/* Place cards */}
        <div className="flex flex-col gap-[10px]">
          {items.map((place, index) => (
            <div
              key={place.id}
              className="flex items-start gap-[12px]"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragOver={(e) => e.preventDefault()}
              onDragEnd={handleDragEnd}
              style={{
                opacity: draggingId === place.id ? 0.4 : 1,
                cursor: "grab",
              }}
            >
              <div className="flex flex-col items-center shrink-0 mt-[14px]">
                <div
                  className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-150"
                  style={{
                    backgroundColor: visited.has(place.id)
                      ? "#4a2fa8"
                      : hoveredId === place.id
                        ? "#5c2ef5"
                        : "white",
                    color:
                      visited.has(place.id) || hoveredId === place.id
                        ? "white"
                        : "#5c2ef5",
                    border: `2px solid ${visited.has(place.id) ? "#4a2fa8" : "#5c2ef5"}`,
                    boxShadow: hoveredId === place.id ? "0 4px 12px #5c2ef544" : "none",
                  }}
                >
                  {index + 1}
                </div>
              </div>
              <button
                className="flex-1 bg-white rounded-[14px] p-[16px] flex items-center gap-[12px] text-left transition-all duration-150 border-2"
                style={{
                  borderColor: hoveredId === place.id ? "#5c2ef5" : "transparent",
                  boxShadow:
                    hoveredId === place.id
                      ? "0 6px 20px rgba(92,46,245,0.12)"
                      : "0 2px 8px rgba(0,0,0,0.05)",
                  opacity: visited.has(place.id) ? 0.6 : 1,
                }}
                onClick={() => onPlaceClick(place)}
                onMouseEnter={() => setHoveredId(place.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="flex-1 min-w-0">
                  <span
                    className={`inline-block text-[11px] font-medium px-[9px] py-[3px] rounded-full mb-[7px] ${place.categoryStyle}`}
                  >
                    {place.category}
                  </span>
                  <h3
                    className={`text-[14px] font-bold mb-[4px] truncate ${
                      visited.has(place.id)
                        ? "line-through text-[#9994ad]"
                        : "text-[#1a142e]"
                    }`}
                  >
                    {place.name}
                  </h3>
                  <p className="text-[12px] text-[#6b6685] leading-[1.5] line-clamp-2">
                    {place.desc}
                  </p>
                </div>
                {place.image ? (
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-[68px] h-[68px] rounded-[10px] object-cover shrink-0 pointer-events-none"
                  />
                ) : (
                  <div
                    className="w-[68px] h-[68px] rounded-[10px] shrink-0"
                    style={{
                      background: `linear-gradient(135deg,${place.accentColor}22,${place.accentColor}0a)`,
                    }}
                  />
                )}
              </button>

              {/* Per-card controls: visited toggle + delete */}
              <div className="flex flex-col gap-[6px] shrink-0 mt-[14px]">
                <button
                  onClick={() => toggleVisited(place.id)}
                  title={visited.has(place.id) ? "다녀옴 해제" : "다녀왔어요 체크"}
                  aria-pressed={visited.has(place.id)}
                  className="w-[26px] h-[26px] rounded-full border flex items-center justify-center transition-colors cursor-pointer"
                  style={
                    visited.has(place.id)
                      ? { backgroundColor: "#22c55e", borderColor: "#22c55e", color: "white" }
                      : { backgroundColor: "white", borderColor: "#ccc8d8", color: "#9994ad" }
                  }
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => handleDelete(place.id)}
                  title="코스에서 삭제"
                  aria-label={`${place.name} 삭제`}
                  className="w-[26px] h-[26px] rounded-full border border-[#ccc8d8] text-[#9994ad] flex items-center justify-center transition-colors cursor-pointer hover:border-[#ef4444] hover:text-[#ef4444] hover:bg-[#fef2f2]"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: map + chat overlay ── */}
      <div className="relative h-[260px] rounded-[20px] overflow-hidden order-1 md:order-2 md:h-auto md:flex-1 md:min-w-0">
        <div className="w-full h-full">
          <CourseNavigationMap />
        </div>

        {/* PanelChat: absolute on desktop, hidden on mobile (shown below instead) */}
        <div className="hidden md:flex absolute bottom-5 left-0 right-0 justify-center px-6">
          <PanelChat />
        </div>
      </div>

      {/* Mobile-only PanelChat — below the map */}
      <div className="md:hidden order-3 w-full">
        <PanelChat />
      </div>
    </main>

    <AddPlaceModal
      open={addOpen}
      places={availablePlaces}
      onAdd={handleAddPlace}
      onClose={() => setAddOpen(false)}
    />
    </>
  );
}
