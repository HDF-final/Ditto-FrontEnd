"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { Plus, Mic, MapPin, ImagePlus, CalendarDays } from "./recommend-icons";
import { suggestions, BONI_IMAGE } from "./recommend-data";
import { useTransparentBg } from "./use-transparent-bg";

const plusMenuItems = [
  { icon: <ImagePlus size={15} />, label: "사진 첨부", desc: "사진으로 비슷한 장소 추천" },
  { icon: <MapPin size={15} />, label: "장소 추가", desc: "직접 장소를 검색해서 고정" },
  { icon: <CalendarDays size={15} />, label: "날짜/시간 설정", desc: "운영 중인 곳만 필터링" },
];

export function PromptScreen({ onSubmit }) {
  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const boniSrc = useTransparentBg(BONI_IMAGE);

  const submit = (val) => {
    if (val.trim()) onSubmit(val.trim());
  };

  return (
    <main
      className="flex-1 flex flex-col items-center justify-center bg-white px-4 py-8"
      style={{ minHeight: "calc(100vh - 94px - 355px)" }}
    >
      {/* Boni */}
      <div className="relative mb-6 md:mb-8">
        <img
          src={boniSrc}
          alt="Boni"
          className="w-[100px] h-[100px] md:w-[150px] md:h-[150px] object-contain"
          style={{ filter: "drop-shadow(0 12px 32px rgba(92,46,245,0.2))" }}
        />
      </div>

      <h1 className="text-[24px] md:text-[36px] font-bold text-[#1a142e] mb-2 md:mb-3 text-center">
        오늘은 무엇을 해볼까요?
      </h1>
      <p className="text-[14px] md:text-[16px] text-[#9994ad] mb-7 md:mb-10 text-center">
        Boni가 최적의 K-Culture 코스를 만들어 드릴게요
      </p>

      {/* Input bar */}
      <div className="w-full max-w-[720px]">
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
    </main>
  );
}
