"use client";

import { useState } from "react";
import Image from "next/image";

// Image with a graceful fallback when the source fails to load.
export function PlaceThumbnail({ src, alt, sizes = "104px", iconClassName = "size-8" }) {
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
          className={iconClassName}
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
      sizes={sizes}
      className="pointer-events-none object-cover"
      onError={() => setFailed(true)}
    />
  );
}
