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
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleShare}
        className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-control px-7 text-sm font-black transition cursor-pointer ${
          copied
            ? "bg-brand-dark text-white shadow-lg scale-105"
            : "bg-brand text-white shadow-control hover:bg-brand-dark"
        }`}
      >
        {copied ? (
          <>
            <svg
              aria-hidden="true"
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {t("copied")}
          </>
        ) : (
          <>
            <svg
              aria-hidden="true"
              className="size-4"
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
            {t("share")}
          </>
        )}
      </button>

      {/* Floating Toast Notification */}
      {copied ? (
        <div className="fixed bottom-10 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-brand/40 bg-[#161324]/95 px-6 py-3.5 text-sm font-bold text-white shadow-2xl backdrop-blur-md transition-all animate-bounce">
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
