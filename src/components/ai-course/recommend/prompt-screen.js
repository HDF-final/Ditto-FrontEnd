"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Mic, MapPin, ImagePlus, CalendarDays } from "./recommend-icons";
import { BONI_IMAGE } from "./recommend-data";
import { useTransparentBg } from "./use-transparent-bg";

// Segmented 자동/수동 switch. 자동 lets Boni build the course, 수동 starts empty.
// A white indicator slides between the two options on change.
function ModeToggle({ mode, onModeChange, options, label }) {
  const activeIndex = options.findIndex((option) => option.value === mode);

  return (
    <div
      className="relative flex items-center p-[4px] rounded-full mb-6 md:mb-7"
      style={{ background: "#f0ecfa", border: "1px solid #e0d9f8" }}
      role="tablist"
      aria-label={label}
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
      {options.map((option) => {
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
  const t = useTranslations("aiCourse");
  const [input, setInput] = useState(initialPrompt || "");
  const [prevInitial, setPrevInitial] = useState(initialPrompt);

  if (initialPrompt !== prevInitial) {
    setPrevInitial(initialPrompt);
    setInput(initialPrompt);
  }

  const [menuOpen, setMenuOpen] = useState(false);
  const boniSrc = useTransparentBg(BONI_IMAGE);

  const isManual = mode === "manual";
  const plusMenuItems = [
    {
      icon: <ImagePlus size={15} />,
      label: t("attachPhoto"),
      desc: t("attachPhotoDetail"),
    },
    {
      icon: <MapPin size={15} />,
      label: t("addPlace"),
      desc: t("addPlaceDetail"),
    },
    {
      icon: <CalendarDays size={15} />,
      label: t("setDateTime"),
      desc: t("setDateTimeDetail"),
    },
  ];
  const modeOptions = [
    { value: "auto", label: t("auto"), desc: t("autoDetail") },
    { value: "manual", label: t("manual"), desc: t("manualDetail") },
  ];
  const suggestions = [
    t.has("suggestion1") ? t("suggestion1") : "지수와 관련된 브랜드 코스 생성해줘",
    t.has("suggestion2") ? t("suggestion2") : "장원영처럼 반짝 코스 생성해줘",
    t.has("suggestion3") ? t("suggestion3") : "필릭스 감성으로 코스 생성해줘",
    t.has("suggestion4") ? t("suggestion4") : "카리나 코스 생성해줘",
  ];

  const submit = (val) => {
    if (val.trim()) onStart(val.trim());
  };

  return (
    <main
      className="flex min-h-[calc(100dvh-var(--app-header)-var(--app-tabbar))] w-full min-w-0 flex-1 flex-col items-center justify-center overflow-x-hidden bg-white px-4 py-6 sm:py-8 lg:min-h-[calc(100dvh-94px)]"
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

      <h1 className="mb-2 max-w-full px-2 text-center text-[22px] font-bold break-keep text-[#1a142e] sm:text-[24px] md:mb-3 md:text-[36px]">
        {t("promptTitle")}
      </h1>
      <p className="mb-6 max-w-full px-2 text-center text-[13px] leading-relaxed text-[#9994ad] sm:text-[14px] md:mb-8 md:text-[16px]">
        {isManual ? t("manualDescription") : t("autoDescription")}
      </p>

      <ModeToggle
        mode={mode}
        onModeChange={onModeChange}
        options={modeOptions}
        label={t("modeLabel")}
      />

      {/* Fixed-height region: auto and manual content differ in height, so we
          reserve the taller (auto) height to keep the toggle from shifting.
          Content is top-aligned so it hugs the toggle instead of floating. */}
      <div className="flex w-full min-w-0 max-w-[720px] flex-col items-center justify-start min-h-[165px] md:min-h-[122px]">
      {isManual ? (
        /* 수동: skip the prompt bar and jump straight into an empty course. */
        <div className="w-full flex flex-col items-center">
          <button
            onClick={() => onStart("")}
            className="flex items-center gap-2 rounded-full px-8 py-[15px] text-[16px] font-bold text-white bg-[#1a142e] hover:bg-[#2a2140] transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus size={18} /> {t("emptyCourse")}
          </button>
          <p className="text-[12px] text-[#9994ad] mt-4 text-center">
            {t("emptyCourseHelp")}
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
                className="absolute bottom-[calc(100%+10px)] left-0 right-0 z-20 overflow-hidden rounded-[16px] bg-white sm:right-auto sm:min-w-[220px]"
                style={{
                  boxShadow: "0 8px 32px rgba(92,46,245,0.14)",
                  border: "1px solid #ede9f5",
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
            className="flex min-w-0 items-center gap-2 rounded-full bg-white px-4 py-3 transition-all sm:gap-3 sm:px-6 sm:py-[16px]"
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
              className="min-w-0 flex-1 bg-transparent text-[15px] text-[#1a142e] outline-none placeholder-[#ccc8d8] sm:text-[17px]"
              style={{ outline: "none" }}
              placeholder={t("askAnything")}
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
              className="flex size-8 shrink-0 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 sm:size-9"
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
        <div className="mt-4 flex flex-wrap justify-center gap-2">
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
