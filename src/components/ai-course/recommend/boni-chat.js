"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "./recommend-icons";
import { BONI_IMAGE } from "./recommend-data";
import { useTransparentBg } from "./use-transparent-bg";

const GREETING = "안녕하세요! 코스에 대해 궁금한 게 있으면 뭐든 물어보세요 🐾";

// Boni가 응답을 만드는 동안 대화창에 남는 말줄임 표시.
function TypingDots() {
  return (
    <span className="flex items-center gap-[4px] py-[3px]">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-[6px] w-[6px] animate-bounce rounded-full bg-[#5c2ef5]"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "1s" }}
        />
      ))}
    </span>
  );
}

/**
 * Docked chat used inside the result screen's map panel. Collapses to a single
 * input bar and expands to a full message thread on focus.
 *
 * 메시지와 전송은 상위(useCourseChat)에서 내려받습니다. 프롬프트 화면에서 보낸
 * 첫 질문도 같은 세션의 대화라 여기 스레드에 그대로 이어집니다.
 */
export function PanelChat({ messages = [], pending = null, onSend }) {
  const [open, setOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [seenCount, setSeenCount] = useState(0);
  const messagesRef = useRef(null);
  const boniSrc = useTransparentBg(BONI_IMAGE);

  const isPending = Boolean(pending);
  const thread = messages.length > 0 ? messages : [{ role: "boni", text: GREETING }];

  // 대화가 오갈 때마다 펼쳐서 방금 오간 내용을 바로 보여줍니다.
  // 접어둔 상태에서도 새 메시지가 오면 다시 열립니다.
  if (messages.length !== seenCount) {
    setSeenCount(messages.length);
    if (messages.length > 0) setOpen(true);
  }

  const sendMessage = () => {
    const text = chatInput.trim();
    if (!text || isPending) return;
    setChatInput("");
    onSend?.(text);
  };

  useEffect(() => {
    const container = messagesRef.current;
    if (open && container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [messages, open, isPending]);

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
            {boniSrc ? (
              <img src={boniSrc} alt="Boni" className="w-full h-full object-contain scale-110" />
            ) : null}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-[#1a142e] leading-tight">Boni</p>
            <p className="text-[12px] text-[#9994ad]">AI 코스 어시스턴트</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`w-[7px] h-[7px] rounded-full inline-block ${
                isPending ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
              }`}
            />
            <span className="text-[12px] text-[#9994ad]">
              {isPending ? "작성 중" : "온라인"}
            </span>
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
          {thread.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-2 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {msg.role === "boni" && (
                <div className="shrink-0 w-[32px] h-[32px] rounded-full overflow-hidden bg-[#f0ecfa] flex items-center justify-center">
                  {boniSrc ? (
                    <img src={boniSrc} alt="Boni" className="w-full h-full object-contain scale-110" />
                  ) : null}
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

          {isPending && (
            <div className="flex items-end gap-2">
              <div className="shrink-0 w-[32px] h-[32px] rounded-full overflow-hidden bg-[#f0ecfa] flex items-center justify-center">
                {boniSrc ? (
                  <img src={boniSrc} alt="Boni" className="w-full h-full object-contain scale-110" />
                ) : null}
              </div>
              <div
                className="rounded-[18px] px-5 py-[11px]"
                style={{ background: "#f0ecfa", borderBottomLeftRadius: "4px" }}
              >
                <TypingDots />
              </div>
            </div>
          )}
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
            {boniSrc ? (
              <img src={boniSrc} alt="Boni" className="w-full h-full object-contain scale-110" />
            ) : null}
          </div>
        )}
        <input
          className="flex-1 text-[14px] text-[#1a142e] bg-transparent outline-none placeholder-[#ccc8d8] disabled:cursor-not-allowed"
          style={{ outline: "none" }}
          placeholder={
            isPending
              ? "Boni가 코스를 짜는 중이에요…"
              : "Boni에게 코스 수정을 요청해보세요"
          }
          value={chatInput}
          disabled={isPending}
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
          disabled={isPending || !chatInput.trim()}
          aria-label="Boni에게 보내기"
          className="w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0 transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:cursor-not-allowed"
          style={{ background: chatInput.trim() && !isPending ? "#5c2ef5" : "#e8e4f5" }}
        >
          <ArrowRight
            size={13}
            className={chatInput.trim() && !isPending ? "text-white" : "text-[#9994ad]"}
          />
        </button>
      </div>
    </div>
  );
}
