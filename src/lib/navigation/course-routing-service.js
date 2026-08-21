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
import { resolvePlaceCategory } from "./place-category";
import { STORE_CATEGORY_BY_NAVIGATION_KEY } from "./store-categories";

const DEFAULT_COURSE_KEYS = [
  "B2_STORE_0031",
  "1F_STORE_0031",
  "4F_STORE_0044",
  "6F_STORE_0033",
];

let datasetPromise;

function toCoursePlace(record) {
  const name = record.place_name ?? record.name;
  const navigationKey = record.navigation_key ?? record.navigationKey;
  // 원장 JSON에는 카테고리 필드가 없어서 로컬 분류표로 채웁니다.
  const { category, categoryStyle, accentColor } = resolvePlaceCategory(
    record.category ?? STORE_CATEGORY_BY_NAVIGATION_KEY[navigationKey],
    { placeName: name },
  );
  const img =
    record.image_url ??
    record.imageUrl ??
    record.img_url ??
    record.place_img ??
    record.placeImg ??
    record.image ??
    null;
  return {
    id: navigationKey ?? record.place_id ?? record.id,
    placeId: record.place_id ?? null,
    navigationKey,
    floor: record.floor_code ?? record.floor,
    name,
    category,
    categoryStyle,
    desc: record.desc ?? `${record.floor_code ?? record.floor ?? ""} ${name} · 실내 길찾기 지원 매장`,
    image: img,
    imageUrl: img,
    placeImg: img,
    accentColor,
    location: `더현대서울 ${record.floor_code ?? record.floor ?? ""}`.trim(),
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

  if (places.length !== 147) {
    throw new Error(`Expected 147 navigable stores, received ${places.length}.`);
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
  // 장소 사진(presigned URL)은 로컬 원장에 없고 장소 목록 API에만 있으므로
  // navigationKey로 이어 붙인다. 사진이 없는 장소는 기존 값(null)을 유지한다.
  const imageUrlByNavigationKey = new Map(
    navigationPlaces
      .filter((place) => place.navigationKey && place.imageUrl)
      .map((place) => [place.navigationKey, place.imageUrl]),
  );
  // 로컬 원장에는 카테고리 필드가 아예 없어 전부 "매장"으로 채워집니다.
  // 장소 목록 API가 카테고리를 주면 그걸로 덮어써야 태그 색이 구분됩니다.
  const categoryByNavigationKey = new Map(
    navigationPlaces
      .filter((place) => place.navigationKey && place.category)
      .map((place) => [place.navigationKey, place.category]),
  );
  const places = dataset.places.map((place) => ({
    ...place,
    ...resolvePlaceCategory(
      categoryByNavigationKey.get(place.navigationKey) ?? place.category,
      { placeName: place.name },
    ),
    placeId: placeIdByNavigationKey.get(place.navigationKey) ?? null,
    image: imageUrlByNavigationKey.get(place.navigationKey) ?? place.image,
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

export async function optimizeCourseRoute(
  places,
  preferences,
  { lockedIndexes = [] } = {},
) {
  const dataset = await loadCourseRoutingDataset();
  const inputPlacesByNavigationKey = new Map(
    places.map((place) => [place.navigationKey, place]),
  );
  const optimized = optimizeOpenItinerary(
    dataset.graph,
    places.map((place) => place.navigationKey),
    routeOptions(preferences),
    { lockedIndexes, preserveEndpoints: true },
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
