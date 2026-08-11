"use client";

import { useState } from "react";

import { topCourses } from "@/lib/fixtures/top-courses";
import { TopCourseChip } from "./top-course-chip";

export function TopCourseSection({ onSelect }) {
  const [activeId, setActiveId] = useState(null);

  return (
    <div className="border-b border-line px-5 py-4">
      <h2 className="mb-3 text-sm font-bold text-ink">TOP COURSES</h2>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {topCourses.map((course) => (
          <TopCourseChip
            key={course.id}
            label={course.label}
            active={activeId === course.id}
            onClick={() => {
              setActiveId(course.id);
              onSelect?.(`${course.label} 코스가 궁금해`);
            }}
          />
        ))}
      </div>
    </div>
  );
}
