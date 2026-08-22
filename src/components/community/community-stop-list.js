"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  attachPlaceIdsToCourseDataset,
  loadCourseRoutingDataset,
} from "@/lib/navigation/course-routing-service";
import { getNavigablePlaces } from "@/lib/api/place-navigation";

export function CommunityStopList({ stops = [], courseId }) {
  const t = useTranslations("community");
  const [hydratedStops, setHydratedStops] = useState(stops);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const [dataset, navigationPlaces] = await Promise.all([
          loadCourseRoutingDataset(),
          getNavigablePlaces().catch(() => []),
        ]);

        if (!active) return;

        const hydratedDataset = attachPlaceIdsToCourseDataset(
          dataset,
          navigationPlaces || [],
        );
        const placeCatalog = hydratedDataset.places;

        const matched = (stops || []).map((stop, idx) => {
          const catalogPlace = placeCatalog.find(
            (candidate) =>
              (stop.placeId && Number(candidate.placeId) === Number(stop.placeId)) ||
              (stop.name &&
                candidate.name?.trim().toLowerCase() ===
                  stop.name?.trim().toLowerCase()) ||
              (stop.navigationKey &&
                candidate.navigationKey === stop.navigationKey),
          );

          if (catalogPlace) {
            const hasRealName = stop.name && !stop.name.includes("추천 장소 #");
            return {
              ...stop,
              name: hasRealName ? stop.name : catalogPlace.name,
              floor: catalogPlace.floor || stop.floor || stop.floorCode || "1F",
              description:
                catalogPlace.desc ||
                stop.description ||
                "더현대 서울 내 추천 방문 스팟",
              placeId: catalogPlace.placeId || stop.placeId,
            };
          }
          return stop;
        });

        if (active) setHydratedStops(matched);
      } catch {
        // fallback to server stops
      }
    }

    hydrate();
    return () => {
      active = false;
    };
  }, [stops]);

  const list = hydratedStops.length > 0 ? hydratedStops : stops;

  return (
    <section className="flex min-w-0 flex-col justify-between rounded-[22px] bg-surface-soft p-4 sm:rounded-[28px] sm:p-6 lg:p-7">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-ink">
            {t.has("coursePlaces") ? t("coursePlaces") : "코스 장소"}
          </h2>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-ink-muted shadow-xs">
            총 {list.length}개 스팟
          </span>
        </div>
        <div className="mt-4 flex flex-col gap-3.5 relative">
          {list.map((stop, index) => {
            const isLast = index === list.length - 1;
            return (
              <div
                key={`stop-${stop.placeId || stop.name || index}-${index}`}
                className="relative flex min-w-0 items-center gap-3 rounded-[18px] border border-line/40 bg-white px-3 py-3 shadow-xs transition hover:shadow-md sm:gap-4 sm:px-4 sm:py-3.5"
              >
                {/* 다음 스팟 번호로 이어지는 수직 점선 (다음 번호 배지 내부까지 완전 연결) */}
                {!isLast && (
                  <div
                    className="pointer-events-none absolute top-7 -bottom-[36px] left-[25.5px] z-10 w-0 border-l-2 border-dashed border-brand/50 sm:left-[29.5px]"
                    aria-hidden="true"
                  />
                )}

                <span className="relative z-20 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white shadow-xs">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-ink">
                    {stop.floor ? `${stop.floor} ` : ""}{stop.name || `스팟 #${index + 1}`}
                  </p>
                  {stop.description ? (
                    <p className="mt-1 text-xs font-medium text-ink-muted line-clamp-1">
                      {stop.description}
                    </p>
                  ) : null}
                </div>
                <Link
                  href={courseId ? `/ai-course?courseId=${courseId}` : "/ai-course"}
                  className="shrink-0 text-sm font-black text-brand transition hover:text-brand-dark"
                >
                  {t.has("view") ? t("view") : "보기"}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
