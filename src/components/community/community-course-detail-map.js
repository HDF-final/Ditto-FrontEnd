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

        // Map course stops to placeCatalog items
        const hydratedPlaces = (stops || []).map((stop, idx) => {
          const catalogPlace = placeCatalog.find(
            (candidate) =>
              (stop.placeId && Number(candidate.placeId) === Number(stop.placeId)) ||
              (stop.name &&
                candidate.name?.trim().toLowerCase() ===
                  stop.name?.trim().toLowerCase()) ||
              (stop.navigationKey &&
                candidate.navigationKey === stop.navigationKey),
          );

          return catalogPlace
            ? {
                ...catalogPlace,
                ...stop,
                id: catalogPlace.id || stop.placeId || `stop-${idx}`,
                placeId: catalogPlace.placeId || stop.placeId,
                floor: catalogPlace.floor || stop.floor || stop.floorCode || "1F",
              }
            : {
                id: stop.placeId || `stop-${idx}`,
                placeId: stop.placeId,
                name: stop.name || "장소",
                floor: stop.floor || stop.floorCode || "1F",
                category: stop.category || "쇼핑/패션",
                ...stop,
              };
        });

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
        className="h-full w-full"
      />
    </div>
  );
}
