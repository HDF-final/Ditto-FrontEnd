"use client";

// Reordering is drag-only; this control keeps just the delete action.
export function CourseStopControls({ onDelete }) {
  return (
    <button
      type="button"
      aria-label="장소 삭제"
      title="장소 삭제"
      onClick={(event) => {
        event.stopPropagation();
        onDelete?.();
      }}
      className="flex size-7 flex-none items-center justify-center text-ink-subtle transition hover:text-danger"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
        aria-hidden="true"
      >
        <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6" />
        <path d="M10 11v6M14 11v6" />
      </svg>
    </button>
  );
}
