"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  attachPlaceIdsToCourseDataset,
  loadCourseRoutingDataset,
  getFallbackPlaceImage,
} from "@/lib/navigation/course-routing-service";
import { getNavigablePlaces } from "@/lib/api/place-navigation";

function SpotDetailModal({ stop, index, onClose }) {
  if (!stop) return null;

  const floorText = stop.floor ? `${stop.floor}` : "1F";
  const image =
    stop.image ||
    stop.imageUrl ||
    stop.placeImg ||
    getFallbackPlaceImage(stop);

  const destinationParam = stop.navigationKey || stop.placeId || "";

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex w-full max-w-[440px] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh]"
      >
        {/* Top Image Banner */}
        <div className="relative h-48 w-full bg-slate-900 shrink-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={stop.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="absolute right-3.5 top-3.5 flex size-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/70 cursor-pointer"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Floor & Spot Badge */}
          <div className="absolute bottom-3.5 left-4 flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-lg bg-brand text-[11px] font-black text-white shadow-xs">
              {index + 1}
            </span>
            <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-black text-ink shadow-xs">
              {floorText}
            </span>
            {stop.category && (
              <span className="rounded-full bg-black/50 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-xs">
                {stop.category}
              </span>
            )}
          </div>
        </div>

        {/* Info Content */}
        <div className="flex flex-col gap-4 p-5 sm:p-6 overflow-y-auto">
          <div>
            <h3 className="text-xl font-black text-ink">
              {stop.name || `스팟 #${index + 1}`}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-brand">
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>더현대 서울 {floorText}</span>
            </p>
          </div>

          {/* Note / Description */}
          {stop.description && (
            <div className="rounded-2xl bg-surface-soft p-4 border border-line/60">
              <p className="text-[11px] font-bold text-ink-muted mb-1">코스 추천 팁</p>
              <p className="text-sm font-medium text-ink leading-relaxed">
                {stop.description}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-2 flex items-center gap-2.5">
            <Link
              href={destinationParam ? `/scan-map?destination=${destinationParam}` : "/scan-map"}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-brand py-3 text-xs font-black text-white shadow-xs transition hover:bg-brand-dark cursor-pointer text-center"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span>실내 지도에서 위치 보기</span>
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-line bg-surface-soft px-5 py-3 text-xs font-bold text-ink hover:bg-line transition cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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

      {/* Spot Info Modal */}
      {selectedSpot ? (
        <SpotDetailModal
          stop={selectedSpot}
          index={selectedSpot.index}
          onClose={() => setSelectedSpot(null)}
        />
      ) : null}
    </section>
  );
}
