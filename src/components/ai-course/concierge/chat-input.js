"use client";

import { useState } from "react";

export function ChatInput({ onSend }) {
  const [value, setValue] = useState("");
  const canSend = value.trim().length > 0;

  function submit() {
    if (!canSend) {
      return; // prevent empty messages
    }
    onSend(value.trim());
    setValue("");
  }

  return (
    <div className="px-4 pb-4 pt-1">
      <div className="flex items-center gap-2 rounded-2xl border border-brand-soft bg-surface px-3 py-2">
        <label htmlFor="concierge-input" className="sr-only">
          Boni에게 물어보기
        </label>
        <input
          id="concierge-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="Boni에게 물어보세요..."
          className="flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-ink-subtle"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          aria-label="메시지 전송"
          className="flex size-7 flex-none items-center justify-center rounded-full bg-brand text-sm text-white transition hover:bg-brand-dark disabled:opacity-40"
        >
          ↑
        </button>
      </div>
    </div>
  );
}
