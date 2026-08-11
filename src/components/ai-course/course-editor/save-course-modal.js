"use client";

import { useState } from "react";

import { Modal } from "@/components/common/modal";
import { sampleShareCode } from "@/lib/fixtures/concierge";
import { useCourseEditorStore } from "@/stores/use-course-editor-store";

export function SaveCourseModal() {
  const open = useCourseEditorStore((state) => state.saveOpen);
  const close = useCourseEditorStore((state) => state.closeSave);
  const title = useCourseEditorStore((state) => state.title);
  const count = useCourseEditorStore((state) => state.stops.length);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(sampleShareCode);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function handleClose() {
    setCopied(false);
    close();
  }

  return (
    <Modal open={open} onClose={handleClose} labelledBy="save-title">
      <h3 id="save-title" className="mb-2 text-lg font-black text-ink">
        코스가 저장됐어요 🎉
      </h3>
      <p className="text-sm text-ink">
        <b>{title || "나의 코스"}</b> · {count}곳
      </p>
      <p className="mt-1 text-sm leading-6 text-ink-muted">
        아래 코드로 앱에서 이 코스를 불러올 수 있어요.
      </p>
      <div className="my-4 rounded-2xl bg-brand-soft px-4 py-3 text-center text-2xl font-black tracking-[0.25em] text-brand-dark">
        {sampleShareCode}
      </div>
      <p className="mb-4 text-center text-[11px] text-ink-subtle">
        * 예시용 샘플 코드입니다 (실제 저장/발급 값이 아니에요)
      </p>
      <button
        type="button"
        onClick={copy}
        className="w-full rounded-full bg-brand px-5 py-3 text-sm font-bold text-white shadow-control transition hover:bg-brand-dark"
      >
        {copied ? "복사됐어요!" : "코드 복사"}
      </button>
    </Modal>
  );
}
