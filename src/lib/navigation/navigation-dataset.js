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
 * **기본값이 CDN 입니다** — 환경변수를 안 주면 아래 주소를 씁니다. 예전에는 기본값이
 * `public/` 사본이라 배포본이 **늘** 자기 오리진에서 588KB 를 퍼냈습니다:
 * `NEXT_PUBLIC_*` 는 `next build` 가 번들에 박아 넣는 값인데, 우리 배포는 Docker
 * 이미지를 만들 때 `.env` 를 안 넣고 컨테이너를 띄울 때만 넣습니다(`--env-file`).
 * 런타임에 값이 있어도 브라우저가 받는 코드에는 이미 폴백이 박힌 뒤입니다.
 * 그래서 "안 주면 CDN" 으로 뒤집었습니다 — CDN 을 쓰는 것이 평소이고, 안 쓰는 것이
 * 예외라야 배포가 조용히 틀리지 않습니다.
 *
 * **`NEXT_PUBLIC_CDN_BASE=` 를 빈 값으로 주면** `public/` 안의 사본으로 떨어집니다.
 * 사본을 지우지 않은 것이 CDN 이 막혔을 때의 안전장치입니다. 다른 버킷·배포로 옮길
 * 때는 그 주소를 값으로 주세요(`Dockerfile` 에 같은 이름의 `ARG` 가 있습니다 —
 * 빌드할 때 줘야 번들에 닿습니다).
 *
 * 값은 백엔드의 `ditto.map-assets.base-url` 과 같은 곳을 가리켜야 합니다. 그쪽이
 * `GET /api/v1/places/navigation/assets` 로 같은 주소를 돌려주며, 주소를 옮길 때는
 * 두 곳을 같이 바꿉니다.
 */
const CDN_BASE_DEFAULT = "https://d1bxld598du04o.cloudfront.net/course-resource";

// 빈 문자열("public/ 로 떨어져라")과 미지정("기본값을 써라")을 **구분해야** 합니다.
// `||` 로 쓰면 둘이 같아져서, 값을 안 준 배포가 곧 폴백이 됩니다.
const CDN_BASE_OVERRIDE = process.env.NEXT_PUBLIC_CDN_BASE;

const CDN_BASE = (
  typeof CDN_BASE_OVERRIDE === "string" ? CDN_BASE_OVERRIDE : CDN_BASE_DEFAULT
)
  .trim()
  .replace(/\/+$/, "");

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
