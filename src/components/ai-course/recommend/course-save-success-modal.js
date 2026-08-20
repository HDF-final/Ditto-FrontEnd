"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Check } from "./recommend-icons";

export function CourseSaveSuccessModal({
  open,
  courseName,
  isUpdate = false,
  onClose,
}) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    closeButtonRef.current?.focus();
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const title = isUpdate ? "코스 수정 완료!" : "코스 저장 완료!";
  const description = isUpdate
    ? "의 변경사항을 마이페이지에 저장했어요."
    : "을(를) 마이페이지에 저장했어요.";

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#1a142e]/45 px-5 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-save-title"
        aria-describedby="course-save-description"
        className="w-full max-w-[390px] rounded-[28px] bg-white px-7 py-8 text-center shadow-[0_24px_80px_rgba(26,20,46,0.25)]"
      >
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#efeaff] text-[#5c2ef5]">
          <Check size={28} />
        </div>
        <h2
          id="course-save-title"
          className="mt-5 text-[22px] font-black text-[#1a142e]"
        >
          {title}
        </h2>
        <p
          id="course-save-description"
          className="mt-2 text-[13px] leading-relaxed text-[#6b6685]"
        >
          <strong className="font-bold text-[#1a142e]">
            {courseName || "이름 없는 코스"}
          </strong>
          {description}
        </p>
        <div className="mt-7 grid grid-cols-2 gap-2.5">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#d8d3e8] bg-white px-4 py-3 text-[12px] font-bold text-[#6b6685] transition-colors hover:border-[#5c2ef5] hover:text-[#5c2ef5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c2ef5]"
          >
            {t("continueEditing")}
          </button>
          <Link
            href="/mypage"
            className="rounded-full bg-[#5c2ef5] px-4 py-3 text-[12px] font-bold text-white transition-colors hover:bg-[#4a22d4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c2ef5]"
          >
            {t("viewMypage")}
          </Link>
        </div>
      </section>
    </div>
  );
}
