"use client";

import { useEffect, useState } from "react";
import { CourseNavigationMap } from "@/components/navigation/course-navigation-map";
import {
  attachPlaceIdsToCourseDataset,
  calculateCourseRoute,
  loadCourseRoutingDataset,
} from "@/lib/navigation/course-routing-service";
import { getNavigablePlaces } from "@/lib/api/place-navigation";

export function CommunityCourseDetailMap({ stops = [], className = "" }) {
  const [routeState, setRouteState] = useState({
    status: "loading",
    itinerary: null,
    graph: null,
    floors: [],
  });

  useEffect(() => {
    let active = true;

    async function loadRoute() {
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

        // Map course stops to placeCatalog items with robust fallbacks
        const hydratedPlaces = (stops || []).map((stop, idx) => {
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

          return {
            ...catalogPlace,
            ...stop,
            id: catalogPlace?.id || stop.placeId || `stop-${idx}`,
            placeId: catalogPlace?.placeId || stop.placeId,
            navigationKey: catalogPlace?.navigationKey || stop.navigationKey,
            floor: catalogPlace?.floor || stop.floor || stop.floorCode || "1F",
          };
        }).filter((p) => Boolean(p.navigationKey));

        if (hydratedPlaces.length === 0) {
          if (active) {
            setRouteState({
              status: "idle",
              itinerary: null,
              graph: null,
              floors: [],
            });
          }
          return;
        }

        const route = await calculateCourseRoute(hydratedPlaces, {
          excludeElevator: false,
          excludeEscalator: false,
        });

        if (!active) return;
        setRouteState({
          status: route.itinerary ? "ready" : "unavailable",
          ...route,
        });
      } catch (err) {
        if (active) {
          setRouteState({
            status: "error",
            itinerary: null,
            graph: null,
            floors: [],
          });
        }
      }
    }

    loadRoute();

    return () => {
      active = false;
    };
  }, [stops]);

  return (
    <div
      className={`relative min-h-[380px] h-[380px] sm:h-[440px] lg:h-full lg:min-h-[380px] w-full overflow-hidden rounded-[28px] bg-[#F7F3EF] shadow-sm border border-line ${className}`}
    >
      <CourseNavigationMap
        route={routeState.itinerary}
        routeFloorIds={routeState.itinerary?.floorIds}
        routeGraph={routeState.graph}
        showFloorSelector={false}
        showControls={false}
        className="h-full w-full"
      />
    </div>
  );
}
