"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useScanLocationStore } from "@/stores/use-scan-location-store";

function MapLoadingState() {
  const t = useTranslations("aiCourse");
  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center bg-[#F7F3EF]">
      <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-[#8C817A] shadow-sm">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#00815a]" />
        {t("mapLoading")}
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
  initialView,
  variant = "course",
  showUserLocation = true,
  showFloorSelector = true,
  showControls = true,
  fitPreset,
}) {
  const t = useTranslations("aiCourse");
  const storedLocation = useScanLocationStore((state) => state.location);
  const hydrateLocation = useScanLocationStore((state) => state.hydrate);
  useEffect(() => {
    hydrateLocation();
  }, [hydrateLocation]);
  const userLocation = showUserLocation ? storedLocation : null;
  return (
    <section
      aria-label={t("mapLabel")}
      className={`relative z-0 h-full min-h-0 w-full overflow-hidden bg-[#F7F3EF] ${className}`}
    >
      <IndoorMap
        route={route}
        routeFloorIds={routeFloorIds}
        routeGraph={routeGraph}
        placeLogos={placeLogos}
        overlayOccluderRef={overlayOccluderRef}
        showFloorSelector={showFloorSelector}
        showControls={showControls}
        userLocation={userLocation}
        initialView={initialView}
        variant={variant}
        fitPreset={fitPreset}
      />
    </section>
  );
}
