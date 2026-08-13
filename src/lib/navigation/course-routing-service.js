import {
  FLOOR_ORDER,
  loadFloorNavigation,
  loadStoreNavigationKeys,
} from "./navigation-dataset";
import {
  buildBuildingGraph,
  buildItineraryRoute,
  optimizeOpenItinerary,
} from "./routing-engine";

const CATEGORY_STYLES = {
  매장: "bg-[#ede9f8] text-[#5c2ef5]",
  팝업: "bg-[#1a142e] text-white",
};

const DEFAULT_COURSE_KEYS = [
  "B2_STORE_0032",
  "1F_STORE_0031",
  "4F_STORE_0044",
  "6F_STORE_0033",
];

let datasetPromise;

function toCoursePlace(record) {
  const category = record.place_name.includes("팝업") ? "팝업" : "매장";
  return {
    id: record.navigation_key,
    placeId: record.place_id ?? null,
    navigationKey: record.navigation_key,
    floor: record.floor_code,
    name: record.place_name,
    category,
    categoryStyle: CATEGORY_STYLES[category],
    desc: `${record.floor_code} ${record.place_name} · 실내 길찾기 지원 매장`,
    image: record.image_url ?? null,
    accentColor: category === "팝업" ? "#1a142e" : "#5c2ef5",
    location: `더현대서울 ${record.floor_code}`,
  };
}

async function loadDataset(options) {
  const [records, ...floors] = await Promise.all([
    loadStoreNavigationKeys(options),
    ...FLOOR_ORDER.map((floorId) => loadFloorNavigation(floorId, options)),
  ]);
  const graph = buildBuildingGraph(floors, FLOOR_ORDER);
  const places = records.map(toCoursePlace);
  const placesByNavigationKey = new Map(
    places.map((place) => [place.navigationKey, place]),
  );
  const placesByPlaceId = new Map(
    places
      .filter((place) => place.placeId !== null)
      .map((place) => [String(place.placeId), place]),
  );
  const defaults = DEFAULT_COURSE_KEYS.map((key) =>
    placesByNavigationKey.get(key),
  ).filter(Boolean);

  if (places.length !== 124) {
    throw new Error(`Expected 124 navigable stores, received ${places.length}.`);
  }

  return {
    graph,
    floors,
    places,
    defaults,
    placesByNavigationKey,
    placesByPlaceId,
  };
}

export function loadCourseRoutingDataset(options) {
  if (options?.signal) return loadDataset(options);
  datasetPromise ??= loadDataset();
  return datasetPromise;
}

export function attachPlaceIdsToCourseDataset(dataset, navigationPlaces) {
  const placeIdByNavigationKey = new Map(
    navigationPlaces
      .filter((place) => place.navigationKey && place.placeId !== null)
      .map((place) => [place.navigationKey, place.placeId]),
  );
  const places = dataset.places.map((place) => ({
    ...place,
    placeId: placeIdByNavigationKey.get(place.navigationKey) ?? null,
  }));
  const placesByNavigationKey = new Map(
    places.map((place) => [place.navigationKey, place]),
  );
  const placesByPlaceId = new Map(
    places
      .filter((place) => place.placeId !== null)
      .map((place) => [String(place.placeId), place]),
  );

  return {
    ...dataset,
    places,
    defaults: dataset.defaults
      .map((place) => placesByNavigationKey.get(place.navigationKey))
      .filter(Boolean),
    placesByNavigationKey,
    placesByPlaceId,
    unmappedPlaceCount: places.filter((place) => place.placeId === null).length,
  };
}

/** Backend/Boni integration boundary: place_id -> navigation_key. */
export async function resolveCoursePlace({ placeId, navigationKey }) {
  const dataset = await loadCourseRoutingDataset();
  if (navigationKey) return dataset.placesByNavigationKey.get(navigationKey) ?? null;
  if (placeId === undefined || placeId === null) return null;
  return dataset.placesByPlaceId.get(String(placeId)) ?? null;
}

function routeOptions({ excludeElevator = false, excludeEscalator = false } = {}) {
  const excludeConnectorTypes = [];
  if (excludeElevator) excludeConnectorTypes.push("elevator");
  if (excludeEscalator) excludeConnectorTypes.push("escalator");
  return { excludeConnectorTypes };
}

export async function calculateCourseRoute(places, preferences) {
  const dataset = await loadCourseRoutingDataset();
  return {
    graph: dataset.graph,
    floors: dataset.floors,
    itinerary: buildItineraryRoute(
      dataset.graph,
      places.map((place) => place.navigationKey),
      routeOptions(preferences),
    ),
  };
}

export async function optimizeCourseRoute(places, preferences) {
  const dataset = await loadCourseRoutingDataset();
  const inputPlacesByNavigationKey = new Map(
    places.map((place) => [place.navigationKey, place]),
  );
  const optimized = optimizeOpenItinerary(
    dataset.graph,
    places.map((place) => place.navigationKey),
    routeOptions(preferences),
  );
  if (!optimized) return null;
  return {
    itinerary: optimized.itinerary,
    places: optimized.stopPlaceIds
      .map(
        (key) =>
          inputPlacesByNavigationKey.get(key) ??
          dataset.placesByNavigationKey.get(key),
      )
      .filter(Boolean),
  };
}
