"use client";

import { useTransparentBg } from "@/components/ai-course/recommend/use-transparent-bg";

const BONI_IMAGE = "/assets/ai-course/boni-profile.png";

export function BoniAvatar({ size = "profile" }) {
  const boniSrc = useTransparentBg(BONI_IMAGE);
  const boxClassName = size === "note" ? "size-12" : "size-13";
  const frameClassName =
    size === "note"
      ? "shadow-xs ring-2 ring-brand/20"
      : "shadow-sm ring-2 ring-brand/20";

  return (
    <div
      className={`flex ${boxClassName} shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ${frameClassName}`}
    >
      {boniSrc ? (
        <img
          src={boniSrc}
          alt="Boni"
          className={`${boxClassName} object-contain`}
        />
      ) : (
        <span className={boxClassName} aria-hidden="true" />
      )}
    </div>
  );
}
