"use client";

import { buttonClassName } from "@/components/common/button";
import { useCourseEditorStore } from "@/stores/use-course-editor-store";

export function CourseActionBar() {
  const openAdd = useCourseEditorStore((state) => state.openAdd);
  const undo = useCourseEditorStore((state) => state.undo);
  const canUndo = useCourseEditorStore((state) => state.history.length > 0);
  const openOptimize = useCourseEditorStore((state) => state.openOptimize);
  const openSave = useCourseEditorStore((state) => state.openSave);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={undo}
        disabled={!canUndo}
        className={buttonClassName({ variant: "neutral", size: "sm" })}
      >
        ↩ 이전으로 돌아가기
      </button>
      <button
        type="button"
        onClick={openAdd}
        className={buttonClassName({ variant: "secondary", size: "sm" })}
      >
        + 장소 추가
      </button>
      <button
        type="button"
        onClick={openOptimize}
        className={buttonClassName({ variant: "secondary", size: "sm" })}
      >
        ⚡ 코스 최적화
      </button>
      <button
        type="button"
        onClick={openSave}
        className={buttonClassName({ variant: "primary", size: "sm" })}
      >
        ⊕ 코스 저장
      </button>
    </div>
  );
}
