"use client";

import { useEffect } from "react";

// Reusable centered modal overlay. Closes on Escape and backdrop click.
export function Modal({ open, onClose, labelledBy, className = "", children }) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    function onKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-strong/45 p-5"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={[
          "relative w-full max-w-md rounded-card bg-surface p-6 shadow-card",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-3.5 top-3 text-2xl leading-none text-ink-subtle transition hover:text-ink"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}
