"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { Plus, Mic, MapPin, ImagePlus, CalendarDays } from "./recommend-icons";
import { suggestions, BONI_IMAGE } from "./recommend-data";
import { useTransparentBg } from "./use-transparent-bg";

const plusMenuItems = [
  { icon: <ImagePlus size={15} />, label: "사진 첨부", desc: "사진으로 비슷한 장소 추천" },
  { icon: <MapPin size={15} />, label: "장소 추가", desc: "직접 장소를 검색해서 고정" },
  { icon: <CalendarDays size={15} />, label: "날짜/시간 설정", desc: "운영 중인 곳만 필터링" },
];

const MODE_OPTIONS = [
  { value: "auto", label: "자동", desc: "챗봇 Boni" },
  { value: "manual", label: "수동", desc: "직접 만들기" },
];

// Segmented 자동/수동 switch. 자동 lets Boni build the course, 수동 starts empty.
// A white indicator slides between the two options on change.
function ModeToggle({ mode, onModeChange }) {
  const activeIndex = MODE_OPTIONS.findIndex((option) => option.value === mode);

  return (
    <div
      className="relative flex items-center p-[4px] rounded-full mb-6 md:mb-7"
      style={{ background: "#f0ecfa", border: "1px solid #e0d9f8" }}
      role="tablist"
      aria-label="코스 만들기 방식"
    >
      {/* Sliding highlight — one option wide, translated to the active slot. */}
      <span
        aria-hidden="true"
        className="absolute top-[4px] bottom-[4px] left-[4px] rounded-full bg-white"
        style={{
          width: "calc(50% - 4px)",
          boxShadow: "0 3px 10px rgba(92,46,245,0.16)",
          transform: `translateX(${activeIndex * 100}%)`,
          transition: "transform 260ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
      {MODE_OPTIONS.map((option) => {
        const active = mode === option.value;
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={active}
            onClick={() => onModeChange(option.value)}
            className="relative z-10 flex w-[80px] flex-col items-center rounded-full py-[6px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c2ef5] md:w-[90px]"
          >
            <span
              className="text-[13px] md:text-[14px] font-bold leading-none"
              style={{ color: active ? "#5c2ef5" : "#9994ad" }}
            >
              {option.label}
            </span>
            <span
              className="text-[9px] md:text-[10px] mt-[3px] leading-none"
              style={{ color: active ? "#8b7ae0" : "#bcb6cf" }}
            >
              {option.desc}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function PromptScreen({
  mode = "auto",
  initialPrompt = "",
  onModeChange,
  onStart,
}) {
  const [input, setInput] = useState(initialPrompt || "");
  const [prevInitial, setPrevInitial] = useState(initialPrompt);

  if (initialPrompt !== prevInitial) {
    setPrevInitial(initialPrompt);
    setInput(initialPrompt);
  }

  const [menuOpen, setMenuOpen] = useState(false);
  const boniSrc = useTransparentBg(BONI_IMAGE);

  const isManual = mode === "manual";

  const submit = (val) => {
    if (val.trim()) onStart(val.trim());
  };

  return (
    <main
      className="flex flex-1 flex-col items-center justify-center bg-white px-4 py-8 min-h-[calc(100dvh-var(--app-header)-var(--app-tabbar))] lg:min-h-[calc(100dvh-94px)]"
    >
      {/* Boni */}
      <div className="relative mb-6 md:mb-8">
        {boniSrc ? (
          <img
            src={boniSrc}
            alt="Boni"
            className="h-[100px] w-[100px] object-contain md:h-[150px] md:w-[150px]"
            style={{ filter: "drop-shadow(0 12px 32px rgba(92,46,245,0.2))" }}
          />
        ) : (
          <div
            className="h-[100px] w-[100px] md:h-[150px] md:w-[150px]"
            aria-hidden="true"
          />
        )}
      </div>

      <h1 className="mb-2 text-center text-[24px] font-bold text-[#1a142e] md:mb-3 md:text-[36px]">
        오늘은 무엇을 해볼까요?
      </h1>
      <p className="mb-6 text-center text-[14px] text-[#9994ad] md:mb-8 md:text-[16px]">
        {isManual
          ? "빈 코스에서 시작해 원하는 장소를 직접 담아보세요"
          : "Boni가 최적의 K-Culture 코스를 만들어 드릴게요"}
      </p>

      <ModeToggle mode={mode} onModeChange={onModeChange} />

      {/* Fixed-height region: auto and manual content differ in height, so we
          reserve the taller (auto) height to keep the toggle from shifting.
          Content is top-aligned so it hugs the toggle instead of floating. */}
      <div className="flex w-full max-w-[720px] flex-col items-center justify-start min-h-[165px] md:min-h-[122px]">
      {isManual ? (
        /* 수동: skip the prompt bar and jump straight into an empty course. */
        <div className="w-full flex flex-col items-center">
          <button
            onClick={() => onStart("")}
            className="flex items-center gap-2 rounded-full px-8 py-[15px] text-[16px] font-bold text-white bg-[#1a142e] hover:bg-[#2a2140] transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus size={18} /> 빈 코스로 시작하기
          </button>
          <p className="text-[12px] text-[#9994ad] mt-4 text-center">
            다음 화면에서 &lsquo;장소 추가&rsquo;로 백화점 안 상점을 골라 담을 수 있어요
          </p>
        </div>
      ) : (
      /* Input bar */
      <div className="w-full">
        <div className="relative">
          {/* Plus popup menu */}
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div
                className="absolute left-0 bottom-[calc(100%+10px)] z-20 bg-white rounded-[16px] overflow-hidden"
                style={{
                  boxShadow: "0 8px 32px rgba(92,46,245,0.14)",
                  border: "1px solid #ede9f5",
                  minWidth: "220px",
                }}
              >
                {plusMenuItems.map((item, i) => (
                  <button
                    key={item.label}
                    className="w-full flex items-center gap-5 px-5 py-3 hover:bg-[#f7f4ff] transition-colors text-left"
                    style={{
                      borderBottom:
                        i < plusMenuItems.length - 1 ? "1px solid #f3f0fc" : "none",
                    }}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="shrink-0 text-[#5c2ef5]">{item.icon}</span>
                    <div>
                      <p className="text-[13px] font-semibold text-[#1a142e]">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-[#9994ad]">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          <div
            className="flex items-center gap-3 rounded-full px-6 py-[16px] bg-white transition-all"
            style={{
              border: "1.5px solid #e0d9f8",
              boxShadow: "0 4px 20px rgba(92,46,245,0.08)",
            }}
          >
            <button
              className="shrink-0 transition-colors"
              style={{ color: menuOpen ? "#5c2ef5" : "#ccc8d8" }}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <Plus size={18} />
            </button>
            <input
              className="flex-1 text-[17px] text-[#1a142e] outline-none bg-transparent placeholder-[#ccc8d8]"
              style={{ outline: "none" }}
              placeholder="무엇이든 물어보세요"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit(input)}
              autoFocus
            />
            <Mic
              size={17}
              className="text-[#ccc8d8] shrink-0 cursor-pointer hover:text-[#5c2ef5] transition-colors"
            />
            <button
              onClick={() => submit(input)}
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all hover:scale-105 active:scale-95"
              style={{ background: input.trim() ? "#1a142e" : "#e8e4f5" }}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="5" width="2" height="6" rx="1" fill={input.trim() ? "white" : "#9994ad"} />
                <rect x="4.5" y="3" width="2" height="10" rx="1" fill={input.trim() ? "white" : "#9994ad"} />
                <rect x="8" y="1" width="2" height="14" rx="1" fill={input.trim() ? "white" : "#9994ad"} />
                <rect x="11.5" y="3" width="2" height="10" rx="1" fill={input.trim() ? "white" : "#9994ad"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Suggestion chips */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => submit(s)}
              className="text-[12px] text-[#6b6685] border border-[#e8e4f5] rounded-full px-4 py-2 hover:border-[#5c2ef5] hover:text-[#5c2ef5] hover:bg-[#f7f4ff] transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      )}
      </div>
    </main>
  );
}
