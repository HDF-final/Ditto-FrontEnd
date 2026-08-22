"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { ArrowRight } from "./recommend-icons";
import { BONI_IMAGE } from "./recommend-data";
import { useTransparentBg } from "./use-transparent-bg";

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

export function PanelChat({ messages = [], pending = null, onSend }) {
  const t = useTranslations("aiCourse");
  const isDesktop = useIsDesktop();
  const [open, setOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const messagesRef = useRef(null);
  const boniSrc = useTransparentBg(BONI_IMAGE);

  const isPending = Boolean(pending);
  const thread =
    messages.length > 0 ? messages : [{ role: "boni", text: t("greeting") }];

  const sendMessage = () => {
    const text = chatInput.trim();
    if (!text || isPending) return;
    setChatInput("");
    onSend?.(text);
  };

  useEffect(() => {
    if (!isDesktop || !open) return;
    const container = messagesRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [isDesktop, messages, open, isPending]);

  if (!isDesktop) {
    return (
      <div
        className="panel-chat w-full overflow-hidden rounded-[20px] bg-white"
        style={{ boxShadow: "0 8px 28px rgba(92,46,245,0.14)" }}
      >
        <div className="flex items-center gap-2 px-3 py-2.5">
          <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f0ecfa]">
            {boniSrc ? (
              <img
                src={boniSrc}
                alt="Boni"
                className="h-full w-full object-contain scale-110"
              />
            ) : null}
          </div>
          <input
            className="min-w-0 flex-1 bg-transparent text-[14px] text-[#1a142e] outline-none placeholder-[#b8b0ca] disabled:cursor-not-allowed"
            placeholder={isPending ? t("building") : t("requestEdit")}
            value={chatInput}
            disabled={isPending}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          {isPending ? (
            <div className="shrink-0 rounded-full bg-[#f0ecfa] px-3 py-2">
              <TypingDots />
            </div>
          ) : (
            <button
              type="button"
              onClick={sendMessage}
              disabled={!chatInput.trim()}
              aria-label={t("sendToBoni")}
              className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full disabled:cursor-not-allowed"
              style={{
                background: chatInput.trim() ? "#5c2ef5" : "#e8e4f5",
              }}
            >
              <ArrowRight
                size={13}
                className={chatInput.trim() ? "text-white" : "text-[#9994ad]"}
              />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="panel-chat flex w-full max-w-[640px] flex-col overflow-hidden rounded-[24px]"
      style={{
        boxShadow: "0 8px 40px rgba(92,46,245,0.18)",
        background: "white",
        transition: "height 0.32s cubic-bezier(.4,0,.2,1)",
        height: open ? "min(calc((100vh - 74px) * 0.42), 360px)" : "68px",
      }}
    >
      {open ? (
        <div
          className="shrink-0 flex items-center gap-3 border-b border-[#f0ecfa] px-5"
          style={{ height: "64px", background: "#fdfcff" }}
        >
          <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f0ecfa]">
            {boniSrc ? (
              <img
                src={boniSrc}
                alt="Boni"
                className="h-full w-full object-contain scale-110"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold leading-tight text-[#1a142e]">
              Boni
            </p>
            <p className="text-[12px] text-[#9994ad]">{t("assistant")}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`inline-block h-[7px] w-[7px] rounded-full ${
                isPending ? "animate-pulse bg-amber-400" : "bg-emerald-400"
              }`}
            />
            <span className="text-[12px] text-[#9994ad]">
              {isPending ? t("writing") : t("online")}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-[32px] w-[32px] items-center justify-center rounded-full transition-colors hover:bg-[#ede9f5]"
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
      ) : null}

      {open ? (
        <div
          ref={messagesRef}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-4"
          style={{ background: "#fdfcff" }}
        >
          {thread.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-2 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {msg.role === "boni" ? (
                <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f0ecfa]">
                  {boniSrc ? (
                    <img
                      src={boniSrc}
                      alt="Boni"
                      className="h-full w-full object-contain scale-110"
                    />
                  ) : null}
                </div>
              ) : null}
              <div
                className="max-w-[75%] rounded-[18px] px-5 py-[11px] text-[14px] leading-relaxed"
                style={
                  msg.role === "boni"
                    ? {
                        background: "#f0ecfa",
                        color: "#1a142e",
                        borderBottomLeftRadius: "4px",
                      }
                    : {
                        background: "#5c2ef5",
                        color: "white",
                        borderBottomRightRadius: "4px",
                      }
                }
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isPending ? (
            <div className="flex items-end gap-2">
              <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f0ecfa]">
                {boniSrc ? (
                  <img
                    src={boniSrc}
                    alt="Boni"
                    className="h-full w-full object-contain scale-110"
                  />
                ) : null}
              </div>
              <div
                className="rounded-[18px] px-5 py-[11px]"
                style={{ background: "#f0ecfa", borderBottomLeftRadius: "4px" }}
              >
                <TypingDots />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        className="shrink-0 flex items-center gap-3 px-5"
        style={{
          height: "68px",
          borderTop: open ? "1px solid #f0ecfa" : "none",
          background: "white",
        }}
      >
        {!open ? (
          <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f0ecfa]">
            {boniSrc ? (
              <img
                src={boniSrc}
                alt="Boni"
                className="h-full w-full object-contain scale-110"
              />
            ) : null}
          </div>
        ) : null}
        <input
          className="flex-1 bg-transparent text-[14px] text-[#1a142e] outline-none placeholder-[#ccc8d8] disabled:cursor-not-allowed"
          placeholder={isPending ? t("building") : t("requestEdit")}
          value={chatInput}
          disabled={isPending}
          onChange={(e) => setChatInput(e.target.value)}
          onFocus={() => !open && setOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full transition-all hover:bg-[#f0ecfa]"
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
        ) : null}
        <button
          type="button"
          onClick={sendMessage}
          disabled={isPending || !chatInput.trim()}
          aria-label={t("sendToBoni")}
          className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            background:
              chatInput.trim() && !isPending ? "#5c2ef5" : "#e8e4f5",
          }}
        >
          <ArrowRight
            size={13}
            className={
              chatInput.trim() && !isPending
                ? "text-white"
                : "text-[#9994ad]"
            }
          />
        </button>
      </div>
    </div>
  );
}
