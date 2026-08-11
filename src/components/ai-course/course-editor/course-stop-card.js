"use client";

import { PlaceThumbnail } from "./place-thumbnail";
import { CourseStopControls } from "./course-stop-controls";

export function CourseStopCard({
  stop,
  order,
  selected,
  onToggle,
  onOpenDetail,
  onDelete,
  dragging = false,
  dropTarget = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}) {
  return (
    <li
      className={["relative flex gap-4 transition-opacity", dragging ? "opacity-45" : ""]
        .filter(Boolean)
        .join(" ")}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={selected}
        aria-label={`${order}번 장소 ${stop.name} ${selected ? "완료 해제" : "완료 표시"}`}
        className={[
          "relative z-10 flex size-11 flex-none items-center justify-center rounded-full border-[3px] text-base font-bold transition",
          selected
            ? "border-brand-accent bg-brand-accent text-white shadow-control"
            : "border-line-strong bg-surface text-ink-muted hover:border-brand",
        ].join(" ")}
      >
        {selected ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
            aria-hidden="true"
          >
            <path d="m5 13 4 4L19 7" />
          </svg>
        ) : (
          order
        )}
      </button>

      <div className="flex-1">
        <article
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          aria-roledescription="드래그하여 순서를 바꿀 수 있는 장소"
          className={[
            "flex cursor-grab items-center gap-3 rounded-card border bg-surface p-5 shadow-card transition active:cursor-grabbing",
            dropTarget
              ? "outline outline-2 outline-offset-2 outline-dashed outline-brand"
              : "",
            selected ? "border-brand-accent" : "border-line hover:border-line-strong",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <button
            type="button"
            onClick={onOpenDetail}
            className="min-w-0 flex-1 text-left"
            aria-label={`${stop.name} 상세보기`}
          >
            <span className="inline-block rounded-control bg-brand-dark px-3 py-1 text-xs font-bold text-brand-soft">
              {stop.category}
            </span>
            <h3 className="mt-2.5 truncate text-base font-bold text-ink">
              {stop.name}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-ink-muted">
              {stop.description}
            </p>
          </button>

          <button
            type="button"
            onClick={onOpenDetail}
            aria-label={`${stop.name} 상세보기`}
            className="relative size-20 flex-none overflow-hidden rounded-full bg-surface-muted shadow-card max-[640px]:hidden"
          >
            <PlaceThumbnail src={stop.image} alt={stop.name} sizes="92px" />
          </button>

          {/* delete — vertically centered on the right */}
          <CourseStopControls onDelete={onDelete} />
        </article>
      </div>
    </li>
  );
}
