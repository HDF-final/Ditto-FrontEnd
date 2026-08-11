"use client";

import { useState } from "react";
import Image from "next/image";

function StopThumbnail({ src, alt }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className="flex size-full items-center justify-center bg-brand-soft text-brand"
        role="img"
        aria-label={`${alt} 이미지를 불러오지 못했습니다`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-8"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <circle cx="8.5" cy="9.5" r="1.5" />
          <path d="m4 17 4.5-4.5a2 2 0 0 1 2.8 0L20 21" />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="104px"
      className="pointer-events-none object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export function CourseStopCard({
  stop,
  order,
  selected,
  onToggle,
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
            "flex cursor-grab items-center gap-4 rounded-card border bg-surface p-4 shadow-card transition active:cursor-grabbing",
            dropTarget
              ? "outline outline-2 outline-offset-2 outline-dashed outline-brand-accent"
              : "",
            selected ? "border-brand-accent" : "border-line hover:border-line-strong",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="min-w-0 flex-1">
            <span className="inline-block rounded-control bg-brand-dark px-3 py-1 text-xs font-bold text-brand-soft">
              {stop.category}
            </span>
            <h3 className="mt-2.5 truncate text-base font-bold text-ink">
              {stop.name}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-ink-muted">
              {stop.description}
            </p>
          </div>
          <div className="relative size-[104px] flex-none overflow-hidden rounded-full bg-surface-muted shadow-card max-[640px]:hidden">
            <StopThumbnail src={stop.image} alt={stop.name} />
          </div>
        </article>
      </div>
    </li>
  );
}
