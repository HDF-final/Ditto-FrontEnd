export const FLOOR_ORDER = ["B2", "B1", "1F", "2F", "3F", "4F", "5F", "6F"];

const FLOOR_TITLES = {
  B2: "Creative Ground",
  B1: "Tasty Seoul",
  "1F": "Exclusive Label",
  "2F": "Modern Mood",
  "3F": "About Fashion",
  "4F": "Life & Balance",
  "5F": "Sounds Forest",
  "6F": "Dining & Art",
};

// The registration values were fitted from common elevator/escalator anchors.
// Keeping them beside the asset metadata lets the renderer share one building
// coordinate system without coupling the UI to the CVAT converter.
const FLOOR_REGISTRATIONS = {
  B2: { offsetX: 2.620021, offsetZ: 9.878701, scale: 0.951333 },
  B1: { offsetX: -6.046003, offsetZ: -0.110784, scale: 1.062235 },
  "1F": { offsetX: 0, offsetZ: 0, scale: 1 },
  "2F": { offsetX: -0.87604, offsetZ: -0.098394, scale: 0.95868 },
  "3F": { offsetX: -1.728033, offsetZ: 0.368791, scale: 0.985264 },
  "4F": { offsetX: -1.260227, offsetZ: 0.233409, scale: 0.955134 },
  "5F": { offsetX: -1.112091, offsetZ: -0.061711, scale: 0.97434 },
  "6F": { offsetX: -1.268548, offsetZ: 0.657307, scale: 0.972451 },
};

/**
 * 실내 지도 원장(JSON 588KB)과 층 텍스처(PNG 2.2MB)가 놓인 곳.
 *
 * CloudFront 의 `course-resource/*` 동작이 S3 `hdf-ditto-images` 를 내보냅니다. 한 번
 * 만들어지면 바뀌지 않는 파일이라 오브젝트에 3주짜리 `Cache-Control` 이 붙어 있고,
 * 중국·일본·미국 손님에게는 엣지에서 나가는 것이 EC2 를 거치는 것보다 훨씬 가깝습니다.
 *
 * **비워 두면 `public/` 안의 사본으로 떨어집니다.** 사본을 지우지 않은 것이 CDN 이
 * 막혔을 때의 안전장치입니다.
 *
 * 값은 백엔드의 `ditto.map-assets.base-url` 과 같은 곳을 가리켜야 합니다. 그쪽이
 * `GET /api/v1/places/navigation/assets` 로 같은 주소를 돌려주며, 주소를 옮길 때는
 * 두 곳을 같이 바꿉니다.
 */
const CDN_BASE = (process.env.NEXT_PUBLIC_CDN_BASE || "").trim().replace(/\/+$/, "");

export const NAVIGATION_ASSET_BASE = CDN_BASE ? `${CDN_BASE}/navigation/v2` : "/navigation/v2";
export const MAP_IMAGE_BASE = CDN_BASE ? `${CDN_BASE}/maps` : "/maps";
export const USING_CDN_ASSETS = Boolean(CDN_BASE);

export const FLOOR_DEFINITIONS = FLOOR_ORDER.map((floorId, index) => ({
  id: floorId,
  slug: floorId.toLowerCase(),
  title: FLOOR_TITLES[floorId],
  imageUrl: `${MAP_IMAGE_BASE}/floor-${floorId.toLowerCase()}.png`,
  navigationUrl: `${NAVIGATION_ASSET_BASE}/${floorId.toLowerCase()}.json`,
  y: index * 8.7,
  cutout: floorId === "B1",
  ...FLOOR_REGISTRATIONS[floorId],
}));

export const NAVIGATION_MANIFEST_URL = `${NAVIGATION_ASSET_BASE}/manifest.json`;
export const STORE_NAVIGATION_KEYS_URL = `${NAVIGATION_ASSET_BASE}/store-navigation-keys.json`;
export const FLOOR_ROOMS_URL = `${NAVIGATION_ASSET_BASE}/floor-rooms.json`;

async function loadJson(url, options = {}) {
  const response = await fetch(url, {
    cache: "force-cache",
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Navigation asset request failed: ${response.status}`);
  }

  return response.json();
}

export function loadNavigationManifest(options) {
  return loadJson(NAVIGATION_MANIFEST_URL, options);
}

export function loadFloorNavigation(floorId, options) {
  const floor = FLOOR_DEFINITIONS.find((entry) => entry.id === floorId);

  if (!floor) {
    return Promise.reject(new Error(`Unknown floor: ${floorId}`));
  }

  return loadJson(floor.navigationUrl, options);
}

export function loadStoreNavigationKeys(options) {
  return loadJson(STORE_NAVIGATION_KEYS_URL, options);
}
