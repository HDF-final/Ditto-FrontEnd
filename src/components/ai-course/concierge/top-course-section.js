"use client";

import { topCourseQuestions } from "@/lib/fixtures/concierge";

export function TopCourseSection({ onSelect }) {
  return (
    <div className="border-b border-line px-4 py-3">
      <p className="mb-2 text-xs font-bold text-ink-muted">추천 질문</p>
      <div className="flex flex-col gap-1.5">
        {topCourseQuestions.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => onSelect(question)}
            className="rounded-xl bg-surface-soft px-3 py-2 text-left text-xs font-semibold text-ink transition hover:bg-brand-soft hover:text-brand"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
