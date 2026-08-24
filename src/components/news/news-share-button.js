"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function NewsShareButton() {
  const t = useTranslations("news");
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof window === "undefined") return;

    const url = window.location.href;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="relative inline-flex min-w-0 flex-1 items-center lg:w-auto lg:flex-none">
      <button
        type="button"
        onClick={handleShare}
        className={`inline-flex min-h-9 w-full cursor-pointer items-center justify-center gap-1 rounded-control px-1.5 text-center text-[10px] font-black leading-tight transition lg:min-h-12 lg:w-auto lg:gap-2 lg:px-7 lg:text-sm lg:leading-normal ${
          copied
            ? "bg-brand-dark text-white shadow-lg scale-105"
            : "bg-brand text-white shadow-control hover:bg-brand-dark"
        }`}
      >
        {copied ? (
          <>
            <svg
              aria-hidden="true"
              className="hidden size-4 lg:block"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="truncate">{t("copied")}</span>
          </>
        ) : (
          <>
            <svg
              aria-hidden="true"
              className="hidden size-4 lg:block"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span className="truncate">{t("share")}</span>
          </>
        )}
      </button>

      {/* Floating Toast Notification */}
      {copied ? (
        <div className="fixed bottom-[calc(var(--app-tabbar)+0.75rem)] left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-brand/40 bg-[#161324]/95 px-4 py-2.5 text-[11px] font-bold text-white shadow-2xl backdrop-blur-md transition-all animate-bounce lg:bottom-10 lg:gap-2.5 lg:px-6 lg:py-3.5 lg:text-sm">
          <span className="flex size-6 items-center justify-center rounded-full bg-brand text-white">
            <svg
              aria-hidden="true"
              className="size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          {t("copyToast")}
        </div>
      ) : null}
    </div>
  );
}
