import {
  FLOOR_ORDER,
  loadFloorNavigation,
  loadNavigationManifest,
  loadStoreNavigationKeys,
} from "./navigation-dataset";
import {
  buildBuildingGraph,
  buildItineraryRoute,
  optimizeOpenItinerary,
} from "./routing-engine";
import { resolvePlaceCategory } from "./place-category";
import { STORE_CATEGORY_BY_NAVIGATION_KEY } from "./store-categories";
import { getImageUrl } from "../courses/image-url";

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
  const img = getImageUrl(record);
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
  // 지도(`indoor-map`)와 **같은 매니페스트**를 본다. 원장을 만든 쪽이 층 목록과
  // 매장 수를 거기 적어 두는데, 지도만 그걸 검사하고 경로는 코드에 박힌 숫자를
  // 보고 있었다. 둘이 다른 원장을 보면 지도에 그려진 매장으로 길이 안 나오거나
  // 그 반대가 되고, 그때 어느 쪽이 낡은 것인지 알 방법이 없다.
  const [manifest, records, ...floors] = await Promise.all([
    loadNavigationManifest(options),
    loadStoreNavigationKeys(options),
    ...FLOOR_ORDER.map((floorId) => loadFloorNavigation(floorId, options)),
  ]);

  const floorOrder = manifest.floorOrder ?? FLOOR_ORDER;
  if (
    floorOrder.length !== FLOOR_ORDER.length ||
    floorOrder.some((floorId, index) => floorId !== FLOOR_ORDER[index])
  ) {
    throw new Error(
      `Navigation manifest floor order mismatch: ${floorOrder.join(",")} vs ${FLOOR_ORDER.join(",")}.`,
    );
  }

  const graph = buildBuildingGraph(floors, floorOrder);
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

  // 매장 수도 매니페스트가 정한다. 147 을 코드에 박아 두면 매장이 하나 들어오는 날
  // 원장은 맞는데 경로만 통째로 죽는다 — 지도는 이미 이 값으로 검사하고 있다.
  const expectedStoreCount = manifest.summary?.storePlaceCount;
  if (expectedStoreCount !== undefined && places.length !== expectedStoreCount) {
    throw new Error(
      `Expected ${expectedStoreCount} navigable stores, received ${places.length}.`,
    );
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
      .filter((place) => place.navigationKey && getImageUrl(place))
      .map((place) => [place.navigationKey, getImageUrl(place)]),
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
  const places = dataset.places.map((place) => ({
    ...place,
    ...resolvePlaceCategory(
      categoryByNavigationKey.get(place.navigationKey) ?? place.category,
      { placeName: place.name },
    ),
    placeId: placeIdByNavigationKey.get(place.navigationKey) ?? null,
    desc: descriptionByNavigationKey.get(place.navigationKey) ?? place.desc,
    description:
      descriptionByNavigationKey.get(place.navigationKey) ?? place.description,
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

/**
 * `preserveEndpoints` 는 첫 자리와 마지막 자리를 둘 다 그 자리에 묶는다. 손님 화면은
 * 출발과 도착을 손대지 않는 것이 맞아서 기본이 참이다.
 *
 * 관리자 화면은 **시작만 고정하고 나머지를 전부 다시 배치**하므로 거짓으로 부른다 —
 * 배치가 짜 준 순서가 최선이라는 보장이 없고, 마지막 자리까지 옮길 수 있어야 층
 * 이동이 실제로 줄어든다.
 */
export async function optimizeCourseRoute(
  places,
  preferences,
  { lockedIndexes = [], preserveEndpoints = true } = {},
) {
  const dataset = await loadCourseRoutingDataset();
  const inputPlacesByNavigationKey = new Map(
    places.map((place) => [place.navigationKey, place]),
  );
  const optimized = optimizeOpenItinerary(
    dataset.graph,
    places.map((place) => place.navigationKey),
    routeOptions(preferences),
    { lockedIndexes, preserveEndpoints },
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
