"use client";

import { useState } from "react";

import { CourseStopCard } from "./course-stop-card";
import { CourseEmptyState } from "./course-empty-state";

export function CourseTimeline({ stops = [] }) {
  const [orderedStops, setOrderedStops] = useState(stops);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [dragIndex, setDragIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);

  function toggleStop(id) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleDragStart(index, event) {
    setDragIndex(index);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
    }
  }

  function handleDragOver(index, event) {
    // Allow dropping and preview the target slot.
    event.preventDefault();
    if (dragIndex === null || dragIndex === index) {
      return;
    }
    setDropIndex(index);
  }

  function handleDrop(index, event) {
    event.preventDefault();
    if (dragIndex === null || dragIndex === index) {
      resetDrag();
      return;
    }
    setOrderedStops((current) => {
      const next = [...current];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    resetDrag();
  }

  function resetDrag() {
    setDragIndex(null);
    setDropIndex(null);
  }

  if (orderedStops.length === 0) {
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
        {orderedStops.map((stop, index) => (
          <CourseStopCard
            key={stop.id}
            stop={stop}
            order={index + 1}
            selected={selectedIds.has(stop.id)}
            onToggle={() => toggleStop(stop.id)}
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
