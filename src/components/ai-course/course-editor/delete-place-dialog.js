"use client";

import { Modal } from "@/components/common/modal";
import { useCourseEditorStore } from "@/stores/use-course-editor-store";

export function DeletePlaceDialog() {
  const deleteId = useCourseEditorStore((state) => state.deleteId);
  const stops = useCourseEditorStore((state) => state.stops);
  const cancelDelete = useCourseEditorStore((state) => state.cancelDelete);
  const confirmDelete = useCourseEditorStore((state) => state.confirmDelete);

  const target = stops.find((stop) => stop.id === deleteId);

  return (
    <Modal open={Boolean(deleteId)} onClose={cancelDelete} labelledBy="delete-place-title">
      <h3 id="delete-place-title" className="mb-2 text-lg font-black text-ink">
        장소를 삭제할까요?
      </h3>
      <p className="text-sm leading-6 text-ink-muted">
        <b className="text-ink">{target?.name}</b> 을(를) 코스에서 제거합니다. 이
        작업은 &lsquo;이전으로 돌아가기&rsquo;로 되돌릴 수 있어요.
      </p>
      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={cancelDelete}
          className="flex-1 rounded-control border border-line bg-surface px-4 py-3 text-sm font-bold text-ink-muted transition hover:border-line-strong"
        >
          취소
        </button>
        <button
          type="button"
          onClick={confirmDelete}
          className="flex-1 rounded-control bg-danger px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
        >
          삭제
        </button>
      </div>
    </Modal>
  );
}
