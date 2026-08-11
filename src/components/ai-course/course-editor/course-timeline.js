"use client";

import { useState } from "react";

import { CourseStopCard } from "./course-stop-card";
import { CourseEmptyState } from "./course-empty-state";

export function CourseTimeline({ stops = [] }) {
  const [selectedIds, setSelectedIds] = useState(() => new Set());

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
            selected={selectedIds.has(stop.id)}
            onToggle={() => toggleStop(stop.id)}
          />
        ))}
      </ol>
    </div>
  );
}
