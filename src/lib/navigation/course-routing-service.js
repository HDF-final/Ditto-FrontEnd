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
  "B2_STORE_0031",
  "1F_STORE_0031",
  "4F_STORE_0044",
  "6F_STORE_0033",
];

let datasetPromise;

function toCoursePlace(record) {
  const category = record.place_name?.includes("팝업") ? "팝업" : (record.category ?? "매장");
  const img =
    record.image_url ??
    record.imageUrl ??
    record.img_url ??
    record.place_img ??
    record.placeImg ??
    record.image ??
    null;
  return {
    id: record.navigation_key ?? record.place_id ?? record.id,
    placeId: record.place_id ?? null,
    navigationKey: record.navigation_key,
    floor: record.floor_code ?? record.floor,
    name: record.place_name ?? record.name,
    category,
    categoryStyle: CATEGORY_STYLES[category] ?? "bg-[#f0ecfa] text-[#5c2ef5]",
    desc: record.desc ?? `${record.floor_code ?? record.floor ?? ""} ${record.place_name ?? record.name} · 실내 길찾기 지원 매장`,
    image: img,
    imageUrl: img,
    placeImg: img,
    accentColor: category === "팝업" ? "#1a142e" : "#5c2ef5",
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

export function getFallbackPlaceImage(place) {
  if (place?.image) return place.image;
  if (place?.imageUrl) return place.imageUrl;
  if (place?.placeImg) return place.placeImg;
  if (place?.aiImage) return place.aiImage;

  const name = String(place?.name || place?.place_name || "").toLowerCase();
  const cat = String(place?.category || "").toLowerCase();

  // Beauty & Cosmetics
  if (
    cat.includes("뷰티") ||
    cat.includes("화장품") ||
    name.includes("헤라") ||
    name.includes("뷰티") ||
    name.includes("향수") ||
    name.includes("라보") ||
    name.includes("딥디크") ||
    name.includes("조 말론") ||
    name.includes("키엘") ||
    name.includes("록시땅") ||
    name.includes("바이레도") ||
    name.includes("에스티로더") ||
    name.includes("오휘")
  ) {
    return "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop";
  }

  // F&B / Cafe / Food
  if (
    cat.includes("음식") ||
    cat.includes("카페") ||
    cat.includes("식당") ||
    name.includes("김밥") ||
    name.includes("떡볶이") ||
    name.includes("냉면") ||
    name.includes("비빔") ||
    name.includes("샤브") ||
    name.includes("가야") ||
    name.includes("이탈리")
  ) {
    return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop";
  }

  // Popups
  if (cat.includes("팝업") || name.includes("팝업")) {
    return "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=800&auto=format&fit=crop";
  }

  // Fashion / Store
  return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop";
}

export function attachPlaceIdsToCourseDataset(dataset, navigationPlaces) {
  const placeIdByNavigationKey = new Map(
    navigationPlaces
      .filter((place) => place.navigationKey && place.placeId !== null)
      .map((place) => [place.navigationKey, place.placeId]),
  );
  // 장소 사진(presigned URL)은 로컬 원장에 없고 장소 목록 API에만 있으므로
  // navigationKey로 이어 붙인다. 사진이 없는 장소는 카테고리 기반 폴백 이미지를 제공한다.
  const imageUrlByNavigationKey = new Map(
    navigationPlaces
      .filter((place) => place.navigationKey && place.imageUrl)
      .map((place) => [place.navigationKey, place.imageUrl]),
  );
  const descriptionByNavigationKey = new Map(
    navigationPlaces
      .filter((place) => place.navigationKey && (place.description || place.desc))
      .map((place) => [place.navigationKey, place.description || place.desc]),
  );
  const categoryByNavigationKey = new Map(
    navigationPlaces
      .filter((place) => place.navigationKey && place.category)
      .map((place) => [place.navigationKey, place.category]),
  );

  const places = dataset.places.map((place) => {
    const rawCategory =
      categoryByNavigationKey.get(place.navigationKey) ?? place.category;
    const category = place.name?.includes("팝업") ? "팝업" : rawCategory;
    const rawImage =
      imageUrlByNavigationKey.get(place.navigationKey) ?? place.image;
    const resolvedImage = rawImage || getFallbackPlaceImage({ ...place, category });
    const desc =
      descriptionByNavigationKey.get(place.navigationKey) ?? place.desc;

    return {
      ...place,
      placeId: placeIdByNavigationKey.get(place.navigationKey) ?? null,
      image: resolvedImage,
      imageUrl: resolvedImage,
      placeImg: resolvedImage,
      desc,
      category,
      categoryStyle: CATEGORY_STYLES[category] ?? "bg-[#f0ecfa] text-[#5c2ef5]",
    };
  });
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
