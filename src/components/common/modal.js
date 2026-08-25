"use client";

import { useEffect } from "react";

// `panelClassName` 은 관리자 코스 편집기가 쓴다. 편집기는 코스 다섯 자리를 한 번에
// 펼쳐야 해서 max-w-xl 로는 좁고 안쪽이 스크롤돼야 한다. 기본값은 지금 모습 그대로다.
const DEFAULT_PANEL =
  "w-full max-w-xl rounded-card border border-line bg-surface p-6 shadow-card";

export function Modal({ open, onClose, labelledBy, panelClassName, children }) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(10,8,20,0.58)] p-5 backdrop-blur-sm"
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
        className={panelClassName || DEFAULT_PANEL}
      >
        {children}
      </div>
    </div>
  );
}
