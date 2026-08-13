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

export const FLOOR_DEFINITIONS = FLOOR_ORDER.map((floorId, index) => ({
  id: floorId,
  slug: floorId.toLowerCase(),
  title: FLOOR_TITLES[floorId],
  imageUrl: `/maps/floor-${floorId.toLowerCase()}.png`,
  navigationUrl: `/navigation/v2/${floorId.toLowerCase()}.json`,
  y: index * 8.7,
  cutout: floorId === "B1",
  ...FLOOR_REGISTRATIONS[floorId],
}));

export const NAVIGATION_MANIFEST_URL = "/navigation/v2/manifest.json";
export const STORE_NAVIGATION_KEYS_URL =
  "/navigation/v2/store-navigation-keys.json";

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
