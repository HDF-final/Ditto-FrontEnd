import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = await readFile(
  path.join(root, "src/lib/navigation/scan-location.js"),
  "utf8",
);
const {
  normalizeScanName,
  matchPlaceByName,
  buildScanLocation,
  resolvePlaceFromScan,
} = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
);

const catalog = JSON.parse(
  await readFile(
    path.join(root, "public/navigation/v2/store-navigation-keys.json"),
    "utf8",
  ),
);
const places = catalog.map((record) => ({
  navigationKey: record.navigation_key,
  name: record.place_name,
  floor: record.floor_code,
}));

test("normalizeScanName strips spaces and case", () => {
  assert.equal(normalizeScanName("나이키 라이즈"), "나이키라이즈");
  assert.equal(normalizeScanName("MLB"), "mlb");
});

test("exact store name maps to the indoor-map navigation key", () => {
  const matched = matchPlaceByName("구찌", places);
  assert.equal(matched?.name, "구찌");
  assert.equal(matched?.floor, "1F");
  assert.equal(matched?.navigationKey, "1F_STORE_0031");
});

test("partial brand names still map onto the floor plan", () => {
  assert.equal(matchPlaceByName("나이키", places)?.navigationKey, "B2_STORE_0021");
  assert.equal(matchPlaceByName("스타벅스", places)?.navigationKey, "B2_STORE_0027");
});

test("english signage aliases map onto Korean store names", () => {
  const matched = matchPlaceByName("SYSTEM", places);
  assert.equal(matched?.name, "시스템");
  assert.equal(matched?.floor, "3F");
  assert.equal(matched?.navigationKey, "3F_STORE_0035");
});

test("unknown brands do not invent a map pin", () => {
  assert.equal(matchPlaceByName("없는브랜드", places), null);
  assert.equal(matchPlaceByName("", places), null);
});

test("buildScanLocation keeps map identity separate from the brand payload", () => {
  const place = matchPlaceByName("MLB", places);
  const location = buildScanLocation(place, {
    name: "MLB",
    logoUrl: "https://example.com/mlb.png",
  });
  assert.deepEqual(location, {
    navigationKey: "B2_STORE_0031",
    name: "MLB",
    floor: "B2",
    placeId: null,
    logoUrl: "https://example.com/mlb.png",
  });
  assert.equal(buildScanLocation(null, { name: "MLB" }), null);
});

test("이탈리 maps to the 6F restaurant, not the market", () => {
  const matched = matchPlaceByName("이탈리", places);
  assert.equal(matched?.name, "이탈리");
  assert.equal(matched?.floor, "6F");
  assert.equal(matched?.navigationKey, "6F_STORE_0034");
});

test("Eataly signage aliases still pin 이탈리", () => {
  assert.equal(matchPlaceByName("EATALY", places)?.navigationKey, "6F_STORE_0034");
  assert.equal(matchPlaceByName("Eataly", places)?.navigationKey, "6F_STORE_0034");
  assert.equal(
    matchPlaceByName("EATALY SEOUL", places)?.navigationKey,
    "6F_STORE_0034",
  );
  assert.equal(
    matchPlaceByName("이탈리".normalize("NFD"), places)?.navigationKey,
    "6F_STORE_0034",
  );
});

test("resolvePlaceFromScan falls back to the store name when the OCR key is missing", () => {
  const placesByNavigationKey = new Map(
    places.map((place) => [place.navigationKey, place]),
  );
  const matched = resolvePlaceFromScan({
    places,
    placesByNavigationKey,
    placesByPlaceId: new Map(),
    navigationKey: "MISSING_KEY",
    placeId: 99,
    names: ["이탈리"],
  });
  assert.equal(matched?.navigationKey, "6F_STORE_0034");
});
