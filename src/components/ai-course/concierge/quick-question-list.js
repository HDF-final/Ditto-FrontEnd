"use client";

import { quickQuestions } from "@/lib/fixtures/concierge";

export function QuickQuestionList({ onAsk }) {
  return (
    <div className="flex flex-col gap-1.5 px-4 py-2">
      {quickQuestions.map((question) => (
        <button
          key={question}
          type="button"
          onClick={() => onAsk(question)}
          className="rounded-xl border border-brand-soft bg-surface px-3 py-1.5 text-left text-xs font-medium text-brand transition hover:bg-brand-soft"
        >
          {question}
        </button>
      ))}
    </div>
  );
}
