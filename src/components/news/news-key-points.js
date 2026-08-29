"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { getNavigablePlaces } from "@/lib/api/place-navigation";
import { PlaceModal } from "@/components/ai-course/recommend/place-modal";

export function NewsKeyPoints({
  summaryPoints = [],
  summaryTitle,
  news,
  initialPlace = null,
}) {
  const newsT = useTranslations("news");
  const aiCourseT = useTranslations("aiCourse");
  const [place, setPlace] = useState(initialPlace || news?.place || null);
  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {
    if (place) return;
    let active = true;

    async function loadPlaceFromDb() {
      try {
        const dbPlaces = await getNavigablePlaces();
        if (!active || !Array.isArray(dbPlaces) || dbPlaces.length === 0) return;

        // 1. news.placeId 또는 news.navigationKey 확인
        if (news?.placeId) {
          const directMatch = dbPlaces.find(
            (p) => Number(p.placeId) === Number(news.placeId),
          );
          if (directMatch && active) {
            setPlace(directMatch);
            return;
          }
        }

        if (news?.navigationKey) {
          const directMatch = dbPlaces.find(
            (p) => p.navigationKey === news.navigationKey,
          );
          if (directMatch && active) {
            setPlace(directMatch);
            return;
          }
        }

        // 2. 3번째 요약문 또는 3번째 본문 문단에서 DB 매장명 검색
        const searchTargets = [
          summaryPoints?.[2],
          Array.isArray(news?.body) ? news.body[2] : null,
          ...(summaryPoints || []),
          ...(Array.isArray(news?.body) ? news.body : []),
        ].filter(Boolean);

        // 긴 매장명 우선 매칭 (예: "프라다 뷰티" > "프라다")
        const sortedDbPlaces = [...dbPlaces].sort(
          (a, b) => (b.name?.length || 0) - (a.name?.length || 0),
        );

        for (const target of searchTargets) {
          const normalizedTarget = target.replace(/\s+/g, "").toLowerCase();

          for (const dbPlace of sortedDbPlaces) {
            if (!dbPlace.name) continue;
            const normalizedName = dbPlace.name.replace(/\s+/g, "").toLowerCase();
            if (normalizedName.length < 2) continue;

            if (normalizedTarget.includes(normalizedName)) {
              if (active) {
                setPlace(dbPlace);
              }
              return;
            }
          }
        }
      } catch {
        // fallback
      }
    }

    loadPlaceFromDb();
    return () => {
      active = false;
    };
  }, [news, summaryPoints, place]);

  const displayPlace = formatDbPlace(place, aiCourseT);

  return (
    <>
      <div className="flex flex-col gap-4 lg:sticky lg:top-[116px]">
        {/* 1. 기사 요약 (KEY POINTS) 카드 */}
        <aside className="h-fit rounded-[16px] border border-line bg-white p-4 shadow-card transition-all lg:rounded-[28px] lg:p-7">
          <div className="flex items-center justify-between gap-2 border-b border-line pb-3 lg:gap-3 lg:pb-5">
            <div className="flex items-center gap-2 lg:gap-3">
              <span className="size-2 rounded-full bg-brand lg:size-3" />
              <h2 className="text-base font-black text-ink lg:text-2xl">{summaryTitle || newsT("summary")}</h2>
            </div>
            <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[10px] font-black text-brand lg:px-3.5 lg:py-1 lg:text-xs">
              KEY POINTS
            </span>
          </div>

          <ol className="mt-3.5 flex flex-col gap-3.5 lg:mt-6 lg:gap-5">
            {summaryPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2.5 lg:gap-3.5">
                <span className="mt-0.5 flex size-5 flex-none items-center justify-center rounded-full bg-brand text-[10px] font-black text-white lg:size-7 lg:text-xs">
                  {index + 1}
                </span>
                <p className="text-[13px] font-bold leading-relaxed text-ink break-keep lg:text-[17px]">
                  {point}
                </p>
              </li>
            ))}
          </ol>
        </aside>

        {/* 2. 기사 요약 밖으로 분리된 블랙 테마 광고(AD) 스타일 매장 카드 */}
        {displayPlace ? (
          <div
            onClick={() => setSelectedPlace(place)}
            className="group relative cursor-pointer overflow-hidden rounded-[20px] border border-white/10 bg-[#121018] p-4.5 text-white shadow-[0_16px_40px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-brand/70 hover:shadow-[0_20px_50px_rgba(92,46,245,0.25)] sm:rounded-[24px] sm:p-5.5"
          >
            {/* 은은한 배경 그라데이션 글로우 */}
            <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-brand/25 blur-2xl transition-opacity group-hover:opacity-100" />

            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="flex min-w-0 flex-1 flex-col items-start justify-center">
                {/* 상단 AD 뱃지 & 위치 안내 */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-[6px] bg-brand px-2 py-0.5 text-[10px] font-black tracking-wider text-white uppercase shadow-xs">
                    AD
                  </span>
                  <span className="text-[11px] font-bold text-white/60">
                    {aiCourseT("store")} · {displayPlace.floor || "1F"}
                  </span>
                </div>

                {/* 매장명 */}
                <h4 className="mt-2.5 truncate text-[18px] font-black tracking-tight text-white transition-colors group-hover:text-brand-light sm:text-[20px]">
                  {displayPlace.name}
                </h4>

                {/* 서브 문구 */}
                <p className="mt-1 text-xs font-medium leading-snug text-white/75 break-keep sm:text-[13px]">
                  {displayPlace.description}
                </p>

                {/* CTA 안내 버튼 */}
                <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-black text-brand-light transition-all group-hover:text-white sm:text-xs">
                  <span>{newsT("storeDetailsAndDirections")}</span>
                  <svg
                    aria-hidden="true"
                    className="size-3.5 transition-transform duration-200 group-hover:translate-x-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* 우측 매장 대표 이미지 썸네일 */}
              <div className="relative size-20 shrink-0 overflow-hidden rounded-[16px] border border-white/15 bg-white/5 shadow-md sm:size-[88px] sm:rounded-[18px]">
                {displayPlace.imageUrl || displayPlace.image ? (
                  <Image
                    src={displayPlace.imageUrl || displayPlace.image}
                    alt={displayPlace.name}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-brand/30 text-xs font-black text-white">
                    {displayPlace.name}
                  </div>
                )}
                {/* 썸네일 오버레이 링 */}
                <div className="absolute inset-0 rounded-[16px] ring-1 ring-inset ring-white/10 sm:rounded-[18px]" />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* 매장 클릭 시 상세 모달 오픈 */}
      {selectedPlace ? (
        <PlaceModal
          place={formatDbPlace(selectedPlace, aiCourseT)}
          onClose={() => setSelectedPlace(null)}
        />
      ) : null}
    </>
  );
}

function formatDbPlace(dbPlace, t) {
  if (!dbPlace) return null;
  const name = dbPlace.name || dbPlace.placeName || dbPlace.place_name || "";
  const floor =
    dbPlace.floorCode || dbPlace.floor_code || dbPlace.floor || "1F";
  const desc = t("compactStoreDescription", { location: floor, name });
  const image =
    dbPlace.imageUrl ||
    dbPlace.image_url ||
    dbPlace.image ||
    dbPlace.placeImg ||
    null;

  return {
    id: dbPlace.navigationKey || dbPlace.placeId || name,
    placeId: dbPlace.placeId ?? null,
    navigationKey: dbPlace.navigationKey ?? null,
    name,
    floor,
    floorCode: floor,
    category: t("store"),
    description: desc,
    desc,
    imageUrl: image,
    image,
    location: `${t("departmentStore")} ${floor}`.trim(),
    modalMode: "standard",
    isNewsModal: true,
    hideFloorSelector: true,
    source: "news",
  };
}
