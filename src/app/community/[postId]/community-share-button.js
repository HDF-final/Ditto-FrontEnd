"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function CommunityShareButton() {
  const t = useTranslations("community");
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
    } catch (err) {
      console.error("[CommunityShare] Copy failed:", err);
    }
  };

  return (
    <div className="relative inline-flex min-w-0 flex-1 basis-[calc(50%-0.25rem)] items-center sm:flex-none sm:basis-auto">
      <button
        type="button"
        onClick={handleShare}
        className={`inline-flex h-11 w-full min-w-0 items-center justify-center gap-1.5 rounded-full border px-3 text-xs font-black transition cursor-pointer sm:h-12 sm:min-w-[142px] sm:gap-2 sm:px-8 sm:text-sm ${
          copied
            ? "border-brand bg-brand text-white shadow-control scale-102"
            : "border-line bg-white text-brand hover:border-brand/40 hover:bg-brand-soft/20 shadow-xs"
        }`}
      >
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
      </button>

      {/* Floating Toast Notification */}
      {copied ? (
        <div className="fixed bottom-[calc(var(--app-tabbar)+0.75rem)] left-1/2 z-50 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-2.5 rounded-full border border-brand/40 bg-[#161324]/95 px-4 py-3 text-xs font-bold text-white shadow-2xl backdrop-blur-md transition-all animate-bounce sm:bottom-10 sm:px-6 sm:py-3.5 sm:text-sm lg:bottom-10">
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
