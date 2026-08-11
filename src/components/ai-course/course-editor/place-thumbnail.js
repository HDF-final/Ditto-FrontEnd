"use client";

import Image from "next/image";
import { useState } from "react";

export function PlaceThumbnail({
  src,
  alt,
  sizes = "96px",
  iconClassName = "size-8",
}) {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    return (
      <div className="flex size-full items-center justify-center bg-surface-soft text-brand">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={iconClassName}
          aria-hidden="true"
        >
          <path d="M3 11h18M5 11l2-6h10l2 6M6 11v8M18 11v8M8 19h8" />
        </svg>
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}
