"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  attachPlaceIdsToCourseDataset,
  loadCourseRoutingDataset,
} from "@/lib/navigation/course-routing-service";
import { getNavigablePlaces } from "@/lib/api/place-navigation";
import { PlaceModal } from "@/components/ai-course/recommend/place-modal";
import { getFallbackPlaceImage } from "@/lib/navigation/course-routing-service";

export function CommunityStopList({ stops = [], courseId }) {
  const t = useTranslations("community");
  const [hydratedStops, setHydratedStops] = useState(stops);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [prevStops, setPrevStops] = useState(stops);

  if (stops !== prevStops) {
    setPrevStops(stops);
    setHydratedStops(stops || []);
  }

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
          let catalogPlace = placeCatalog.find(
            (candidate) =>
              (stop.navigationKey && candidate.navigationKey === stop.navigationKey) ||
              (stop.placeId && Number(candidate.placeId) === Number(stop.placeId)) ||
              (stop.name &&
                candidate.name?.trim().toLowerCase() ===
                  stop.name?.trim().toLowerCase()) ||
              (stop.name &&
                candidate.name?.replace(/\s+/g, "").toLowerCase() ===
                  stop.name?.replace(/\s+/g, "").toLowerCase()),
          );

          if (!catalogPlace && stop.floor) {
            const normalizedFloor = stop.floor.replace(/[^0-9BF]/gi, "").toUpperCase();
            catalogPlace = placeCatalog.find(
              (p) => p.floor === normalizedFloor || p.floor === stop.floor,
            );
          }

          if (!catalogPlace) {
            catalogPlace = placeCatalog[idx % placeCatalog.length];
          }

          if (catalogPlace) {
            const hasRealName = stop.name && !stop.name.includes("추천 장소 #");
            return {
              ...catalogPlace,
              ...stop,
              name: hasRealName ? stop.name : catalogPlace.name,
              floor: catalogPlace.floor || stop.floor || stop.floorCode || "1F",
              description:
                stop.description ||
                catalogPlace.desc ||
                "더현대 서울 내 추천 방문 스팟",
              placeId: catalogPlace.placeId || stop.placeId,
              navigationKey: catalogPlace.navigationKey || stop.navigationKey,
              image: catalogPlace.image || catalogPlace.imageUrl || stop.image,
              category: catalogPlace.category || stop.category || "쇼핑/패션",
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
    <section className="flex h-full min-w-0 flex-col rounded-[22px] bg-surface-soft p-4 sm:rounded-[28px] sm:p-6 lg:p-7">
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
                key={`stop-${stop.navigationKey || stop.placeId || stop.name || index}-${index}`}
                onClick={() => setSelectedSpot({ ...stop, index })}
                className="relative flex items-center gap-4 rounded-[18px] bg-white px-4 py-3.5 shadow-xs border border-line/40 transition hover:shadow-md hover:border-brand/40 cursor-pointer group"
              >
                {/* 다음 스팟 번호로 이어지는 수직 점선 (다음 번호 배지 내부까지 완전 연결) */}
                {!isLast && (
                  <div
                    className="pointer-events-none absolute top-7 -bottom-[36px] left-[25.5px] z-10 w-0 border-l-2 border-dashed border-brand/50 sm:left-[29.5px]"
                    aria-hidden="true"
                  />
                )}

                <span className="relative z-20 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white shadow-xs group-hover:scale-105 transition-transform">
                  {index + 1}
                </span>
                <div className="relative z-20 size-12 shrink-0 overflow-hidden rounded-[12px] bg-surface-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={stop.image || getFallbackPlaceImage(stop)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-ink group-hover:text-brand transition-colors">
                    {stop.floor ? `${stop.floor} ` : ""}{stop.name || `스팟 #${index + 1}`}
                  </p>
                  {stop.description ? (
                    <p className="mt-1 text-xs font-medium text-ink-muted line-clamp-1">
                      {stop.description}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSpot({ ...stop, index });
                  }}
                  className="text-sm font-black text-brand transition hover:text-brand-dark px-2 py-1 rounded-lg hover:bg-brand-soft/50 cursor-pointer shrink-0"
                >
                  {t.has("view") ? t("view") : "보기"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spot Info Modal — ai-course 상세 모달 재사용 (매장 안내 + 더현대Hi 상품 + 매장 사진) */}
      {selectedSpot ? (
        <PlaceModal
          place={selectedSpot}
          onClose={() => setSelectedSpot(null)}
        />
      ) : null}
    </section>
  );
}
