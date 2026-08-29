"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

function shortFloor(floor) {
  const value = String(floor || "").trim();
  if (!value) return "-";
  return value.length > 4 ? value.slice(0, 4) : value;
}

function StopRow({ stop, idx, compact, placeFallback }) {
  return (
    <div
      className={
        compact
          ? "flex h-5 shrink-0 items-center gap-1.5"
          : "flex h-6 shrink-0 items-center gap-2 text-xs"
      }
    >
      <span
        className={
          compact
            ? "flex size-4 shrink-0 items-center justify-center rounded-md bg-surface-soft text-[9px] font-black text-ink-muted"
            : "flex size-5 shrink-0 items-center justify-center rounded-md bg-surface-soft text-[10px] font-black text-ink-muted"
        }
      >
        {idx + 1}
      </span>
      <span
        className={
          compact
            ? "max-w-[2.25rem] shrink-0 truncate rounded-md bg-[#f0ecfc] px-1 text-[9px] font-bold leading-4 text-brand"
            : "shrink-0 rounded-md bg-[#f0ecfc] px-1.5 py-0.5 text-[10px] font-bold text-brand"
        }
      >
        {compact ? shortFloor(stop.floor || "1F") : stop.floor || "1F"}
      </span>
      <span
        className={
          compact
            ? "min-w-0 flex-1 truncate text-[11px] font-semibold leading-4 text-ink"
            : "truncate font-semibold text-ink"
        }
      >
        {stop.name || placeFallback}
      </span>
    </div>
  );
}

export function MyCoursePrivateCard({ course }) {
  const t = useTranslations("mypage");
  const courseId = course?.courseId || course?.id;
  const href = `/ai-course?courseId=${courseId}&from=mypage`;
  const stops = Array.isArray(course?.stops) ? course.stops.filter(Boolean) : [];
  const previewStops = stops.slice(0, 3);
  const spotCountText =
    course?.spotCount ||
    (stops.length > 0
      ? t("spotCount", { count: stops.length })
      : t("spotInfoUnavailable"));

  return (
    <Link
      href={href}
      className="group relative flex aspect-[4/5] min-h-0 w-full cursor-pointer flex-col overflow-hidden rounded-[20px] border border-line bg-white p-3 shadow-[0_4px_20px_rgba(43,28,89,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_12px_28px_rgba(92,46,245,0.12)] lg:h-full lg:min-h-[232px] lg:max-h-[276px] lg:aspect-auto lg:rounded-[24px] lg:p-5"
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex min-w-0 items-center justify-between gap-1 lg:gap-2">
          <span className="inline-flex min-w-0 items-center gap-1 rounded-full bg-brand-soft px-1.5 py-0.5 text-[9px] font-black text-brand lg:gap-1.5 lg:px-2.5 lg:py-1 lg:text-xs">
            <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-brand" />
            <span className="truncate">{t("myCustomCourse")}</span>
          </span>
          <span className="shrink-0 rounded-full bg-surface-soft px-1.5 py-0.5 text-[9px] font-bold text-ink-muted lg:px-2.5 lg:py-1 lg:text-xs">
            {spotCountText}
          </span>
        </div>

        <h3 className="mt-1.5 truncate text-[13px] font-black text-ink transition-colors group-hover:text-brand lg:mt-3 lg:line-clamp-1 lg:text-lg">
          {course?.title || t("untitledCourse")}
        </h3>

        <div className="mt-2 flex min-h-0 flex-1 flex-col gap-1 lg:hidden">
          {stops.length > 0 ? (
            <>
              {previewStops.map((stop, idx) => (
                <StopRow
                  key={`${stop.name || "stop"}-${idx}`}
                  stop={stop}
                  idx={idx}
                  compact
                  placeFallback={t("placeNameFallback")}
                />
              ))}
              {stops.length > 3 ? (
                <p className="pl-0.5 text-[11px] font-black leading-none tracking-widest text-ink-muted">
                  ...
                </p>
              ) : null}
            </>
          ) : (
            <p className="py-1 text-[11px] text-ink-muted">
              {t("noSavedStops")}
            </p>
          )}
        </div>

        <div className="mt-2 hidden min-h-[84px] flex-1 flex-col gap-1.5 overflow-y-auto pr-1.5 lg:flex [scrollbar-color:#d4d0ec_transparent] [scrollbar-width:thin]">
          {stops.length > 0 ? (
            stops.map((stop, idx) => (
              <StopRow
                key={`${stop.name || "stop"}-desktop-${idx}`}
                stop={stop}
                idx={idx}
                placeFallback={t("placeNameFallback")}
              />
            ))
          ) : (
            <p className="py-1 text-xs text-ink-muted">
              {t("noSavedStops")}
            </p>
          )}
        </div>
      </div>

      <div className="mt-2 flex shrink-0 items-center justify-end border-t border-line/70 pt-2 lg:mt-3 lg:pt-2.5">
        <div className="inline-flex items-center gap-0.5 text-[11px] font-black text-brand transition-transform group-hover:translate-x-0.5 lg:gap-1 lg:text-xs">
          <span>{t("viewOnMap")}</span>
          <span>→</span>
        </div>
      </div>
    </Link>
  );
}
