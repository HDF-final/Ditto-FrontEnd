"use client";

import { Modal } from "@/components/common/modal";
import { useCourseEditorStore } from "@/stores/use-course-editor-store";

export function SaveCourseModal() {
  const open = useCourseEditorStore((state) => state.saveOpen);
  const close = useCourseEditorStore((state) => state.closeSave);
  const title = useCourseEditorStore((state) => state.title);
  const stops = useCourseEditorStore((state) => state.stops);

  return (
    <Modal open={open} onClose={close} labelledBy="save-course-title">
      <h3 id="save-course-title" className="mb-2 text-lg font-black text-ink">
        코스 저장
      </h3>
      <p className="text-sm leading-6 text-ink-muted">
        <b className="text-ink">{title || "이름 없는 코스"}</b>에 장소{" "}
        {stops.length}개가 담겨 있어요. 실제 저장 API가 연결되면 이 버튼에서
        서버 저장을 호출합니다.
      </p>
      <button
        type="button"
        onClick={close}
        className="mt-5 w-full rounded-control bg-brand px-4 py-3 text-sm font-bold text-white shadow-control transition hover:bg-brand-dark"
      >
        확인
      </button>
    </Modal>
  );
}
