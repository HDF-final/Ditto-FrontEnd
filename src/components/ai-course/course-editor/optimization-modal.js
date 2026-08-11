"use client";

import { useMemo } from "react";

import { Modal } from "@/components/common/modal";
import { optimizeOrder } from "@/lib/utils/course";
import { useCourseEditorStore } from "@/stores/use-course-editor-store";

export function OptimizationModal() {
  const open = useCourseEditorStore((state) => state.optimizeOpen);
  const close = useCourseEditorStore((state) => state.closeOptimize);
  const stops = useCourseEditorStore((state) => state.stops);
  const setStops = useCourseEditorStore((state) => state.setStops);

  const proposed = useMemo(() => optimizeOrder(stops), [stops]);
  const changed = useMemo(
    () => proposed.some((stop, index) => stop.id !== stops[index]?.id),
    [proposed, stops],
  );

  // The suggestion is only applied on this explicit action.
  function apply() {
    setStops(proposed);
    close();
  }

  return (
    <Modal open={open} onClose={close} labelledBy="optimize-title">
      <h3 id="optimize-title" className="mb-1 text-lg font-black text-ink">
        코스 최적화
      </h3>
      <p className="mb-4 text-sm leading-6 text-ink-muted">
        Boni가 이동 동선을 기준으로 추천하는 순서예요.{" "}
        {changed
          ? "‘적용하기’를 누르면 코스 순서가 이렇게 바뀝니다."
          : "지금도 이미 최적 순서예요."}
      </p>
      {proposed.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-muted">
          최적화할 장소가 없어요.
        </p>
      ) : (
        <ol className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
          {proposed.map((stop, index) => (
            <li
              key={stop.id}
              className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3"
            >
              <span className="flex size-7 flex-none items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">{stop.name}</p>
                <p className="truncate text-xs text-ink-muted">{stop.category}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={close}
          className="flex-1 rounded-full border border-line bg-surface px-4 py-3 text-sm font-bold text-ink-muted transition hover:border-line-strong"
        >
          닫기
        </button>
        <button
          type="button"
          onClick={apply}
          disabled={!changed}
          className="flex-1 rounded-full bg-brand px-4 py-3 text-sm font-bold text-white shadow-control transition hover:bg-brand-dark disabled:pointer-events-none disabled:opacity-50"
        >
          적용하기
        </button>
      </div>
    </Modal>
  );
}
