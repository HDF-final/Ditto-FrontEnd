"use client";

import { useState } from "react";

import { useCourseEditorStore } from "@/stores/use-course-editor-store";
import { CourseStopCard } from "./course-stop-card";
import { CourseEmptyState } from "./course-empty-state";

export function CourseTimeline() {
  const stops = useCourseEditorStore((state) => state.stops);
  const selectedIds = useCourseEditorStore((state) => state.selectedIds);
  const toggleSelected = useCourseEditorStore((state) => state.toggleSelected);
  const reorderStop = useCourseEditorStore((state) => state.reorderStop);
  const requestDelete = useCourseEditorStore((state) => state.requestDelete);
  const openDetail = useCourseEditorStore((state) => state.openDetail);

  const [dragIndex, setDragIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);

  function handleDragStart(index, event) {
    setDragIndex(index);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
    }
  }

  function handleDragOver(index, event) {
    event.preventDefault();
    if (dragIndex === null || dragIndex === index) {
      return;
    }
    setDropIndex(index);
  }

  function handleDrop(index, event) {
    event.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      reorderStop(dragIndex, index);
    }
    resetDrag();
  }

  function resetDrag() {
    setDragIndex(null);
    setDropIndex(null);
  }

  if (stops.length === 0) {
    return <CourseEmptyState />;
  }

  return (
    <div className="relative">
      {/* vertical connector behind the stop nodes */}
      <span
        aria-hidden="true"
        className="absolute bottom-2 left-[21px] top-11 w-0.5 bg-line"
      />
      <ol className="flex flex-col gap-5">
        {stops.map((stop, index) => (
          <CourseStopCard
            key={stop.id}
            stop={stop}
            order={index + 1}
            selected={selectedIds.includes(stop.id)}
            onToggle={() => toggleSelected(stop.id)}
            onOpenDetail={() => openDetail(stop)}
            onDelete={() => requestDelete(stop.id)}
            dragging={dragIndex === index}
            dropTarget={dropIndex === index}
            onDragStart={(event) => handleDragStart(index, event)}
            onDragEnd={resetDrag}
            onDragOver={(event) => handleDragOver(index, event)}
            onDrop={(event) => handleDrop(index, event)}
          />
        ))}
      </ol>
    </div>
  );
}
