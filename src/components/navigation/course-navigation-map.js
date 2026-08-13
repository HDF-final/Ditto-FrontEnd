"use client";

import dynamic from "next/dynamic";

function MapLoadingState() {
  return (
    <div className="flex h-full min-h-[260px] w-full items-center justify-center bg-[#f7f5ff]">
      <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-[#6b6685] shadow-sm">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#5c2ef5]" />
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

export function CourseNavigationMap({ className = "" }) {
  return (
    <section
      aria-label="더현대 서울 층별 실내 지도"
      className={`relative h-full min-h-[260px] w-full overflow-hidden bg-[#f7f5ff] ${className}`}
    >
      <IndoorMap />
    </section>
  );
}
