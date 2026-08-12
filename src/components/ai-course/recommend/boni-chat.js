"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "./recommend-icons";
import { boniReplies, BONI_IMAGE } from "./recommend-data";
import { useTransparentBg } from "./use-transparent-bg";

/**
 * Docked chat used inside the result screen's map panel. Collapses to a single
 * input bar and expands to a full message thread on focus.
 */
export function PanelChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "boni", text: "안녕하세요! 코스에 대해 궁금한 게 있으면 뭐든 물어보세요 🐾" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const messagesRef = useRef(null);
  const boniSrc = useTransparentBg(BONI_IMAGE);

  const sendMessage = () => {
    const text = chatInput.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setChatInput("");
    setTimeout(() => {
      const reply = boniReplies[Math.floor(Math.random() * boniReplies.length)];
      setMessages((m) => [...m, { role: "boni", text: reply }]);
    }, 700);
  };

  useEffect(() => {
    const c = messagesRef.current;
    if (open && c) c.scrollTo({ top: c.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  return (
    <div
      className="panel-chat flex flex-col rounded-[24px] overflow-hidden w-full"
      style={{
        maxWidth: "640px",
        boxShadow: "0 8px 40px rgba(92,46,245,0.18)",
        background: "white",
        transition: "height 0.32s cubic-bezier(.4,0,.2,1)",
        height: open ? "min(calc((100vh - 74px) * 0.42), 360px)" : "68px",
      }}
    >
      {/* Header — Boni info + toggle */}
      {open && (
        <div
          className="shrink-0 flex items-center gap-3 px-5 border-b border-[#f0ecfa]"
          style={{ height: "64px", background: "#fdfcff" }}
        >
          <div className="w-[40px] h-[40px] rounded-full overflow-hidden bg-[#f0ecfa] flex items-center justify-center shrink-0">
            <img src={boniSrc} alt="Boni" className="w-full h-full object-contain scale-110" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-[#1a142e] leading-tight">Boni</p>
            <p className="text-[12px] text-[#9994ad]">AI 코스 어시스턴트</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-[7px] h-[7px] rounded-full bg-emerald-400 inline-block" />
            <span className="text-[12px] text-[#9994ad]">온라인</span>
            <button
              onClick={() => setOpen(false)}
              className="w-[32px] h-[32px] rounded-full flex items-center justify-center transition-colors hover:bg-[#ede9f5]"
              style={{ background: "#f0ecfa" }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 4.5L6 8L10 4.5"
                  stroke="#5c2ef5"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      {open && (
        <div
          ref={messagesRef}
          className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4"
          style={{ background: "#fdfcff" }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-2 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {msg.role === "boni" && (
                <div className="shrink-0 w-[32px] h-[32px] rounded-full overflow-hidden bg-[#f0ecfa] flex items-center justify-center">
                  <img src={boniSrc} alt="Boni" className="w-full h-full object-contain scale-110" />
                </div>
              )}
              <div
                className="max-w-[75%] rounded-[18px] px-5 py-[11px] text-[14px] leading-relaxed"
                style={
                  msg.role === "boni"
                    ? { background: "#f0ecfa", color: "#1a142e", borderBottomLeftRadius: "4px" }
                    : { background: "#5c2ef5", color: "white", borderBottomRightRadius: "4px" }
                }
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input bar — always visible */}
      <div
        className="shrink-0 flex items-center gap-3 px-5"
        style={{
          height: "68px",
          borderTop: open ? "1px solid #f0ecfa" : "none",
          background: "white",
        }}
      >
        {!open && (
          <div className="w-[34px] h-[34px] rounded-full overflow-hidden bg-[#f0ecfa] flex items-center justify-center shrink-0">
            <img src={boniSrc} alt="Boni" className="w-full h-full object-contain scale-110" />
          </div>
        )}
        <input
          className="flex-1 text-[14px] text-[#1a142e] bg-transparent outline-none placeholder-[#ccc8d8]"
          style={{ outline: "none" }}
          placeholder="Boni에게 코스 수정을 요청해보세요"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onFocus={() => !open && setOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="w-[32px] h-[32px] rounded-full flex items-center justify-center shrink-0 transition-all hover:bg-[#f0ecfa]"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 8L6 4L10 8"
                stroke="#5c2ef5"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <button
          onClick={sendMessage}
          className="w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0 transition-all hover:scale-105 active:scale-95"
          style={{ background: chatInput.trim() ? "#5c2ef5" : "#e8e4f5" }}
        >
          <ArrowRight
            size={13}
            className={chatInput.trim() ? "text-white" : "text-[#9994ad]"}
          />
        </button>
      </div>
    </div>
  );
}
