"use client";

import dynamic from "next/dynamic";

function MapLoadingState() {
  return (
    <div className="flex h-full min-h-[260px] w-full items-center justify-center bg-[#F7F3EF]">
      <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-[#8C817A] shadow-sm">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#00815a]" />
        층별 지도를 불러오는 중
      </div>
    </div>
  );
}

const IndoorMap = dynamic(
  () => import("./indoor-map").then((module) => module.IndoorMap),
  {
    ssr: false,
    loading: MapLoadingState,
  },
);

export function CourseNavigationMap({
  className = "",
  route,
  routeFloorIds,
  routeGraph,
  placeLogos,
  overlayOccluderRef,
}) {
  return (
    <section
      aria-label="더현대 서울 층별 실내 지도"
      className={`relative z-0 h-full min-h-[260px] w-full overflow-hidden bg-[#F7F3EF] ${className}`}
    >
      <IndoorMap
        route={route}
        routeFloorIds={routeFloorIds}
        routeGraph={routeGraph}
        placeLogos={placeLogos}
        overlayOccluderRef={overlayOccluderRef}
      />
    </section>
  );
}
