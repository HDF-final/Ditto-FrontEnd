import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
const FLOOR_ORDER = ["B2", "B1", "1F", "2F", "3F", "4F", "5F", "6F"];
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
}

const engineSource = await readFile(
  path.join(root, "src/lib/navigation/routing-engine.js"),
  "utf8",
);
const {
  buildBuildingGraph,
  buildItineraryRoute,
  findShortestPath,
  optimizeOpenItinerary,
} = await import(
  `data:text/javascript;base64,${Buffer.from(engineSource).toString("base64")}`
);

const floors = await Promise.all(
  FLOOR_ORDER.map((floorId) =>
    readJson(`public/navigation/v2/${floorId.toLowerCase()}.json`),
  ),
);
const graph = buildBuildingGraph(floors, FLOOR_ORDER);

test("navigation graph preserves all 124 selectable stores", async () => {
  const catalog = await readJson("public/navigation/v2/store-navigation-keys.json");
  const storePlaces = graph.places.filter((place) => place.placeType === "STORE");
  assert.equal(catalog.length, 124);
  assert.equal(storePlaces.length, 124);
  assert.equal(new Set(catalog.map((place) => place.navigation_key)).size, 124);
});

test("cross-floor course can use elevator-only and escalator-only routes", () => {
  const start = "B2_STORE_0032";
  const destination = "6F_STORE_0033";
  const elevatorOnly = findShortestPath(graph, start, destination, {
    excludeConnectorTypes: ["escalator"],
  });
  const escalatorOnly = findShortestPath(graph, start, destination, {
    excludeConnectorTypes: ["elevator"],
  });

  assert.ok(elevatorOnly);
  assert.ok(escalatorOnly);
  assert.ok(
    elevatorOnly.connectorSteps.every((step) => step.connectorType === "elevator"),
  );
  assert.ok(
    escalatorOnly.connectorSteps.every(
      (step) => step.connectorType === "escalator",
    ),
  );
});

test("excluding both connector types blocks a cross-floor course", () => {
  assert.equal(
    findShortestPath(graph, "B2_STORE_0032", "6F_STORE_0033", {
      excludeConnectorTypes: ["elevator", "escalator"],
    }),
    null,
  );
});

test("itinerary keeps the dragged order and classifies floor transitions", () => {
  const stops = ["B2_STORE_0032", "1F_STORE_0031", "6F_STORE_0033"];
  const itinerary = buildItineraryRoute(graph, stops);
  assert.deepEqual(itinerary.stopPlaceIds, stops);
  assert.equal(itinerary.legs.length, 2);
  assert.ok(itinerary.connectorSteps.length >= 2);
  assert.deepEqual(new Set(itinerary.floorIds), new Set(["B2", "1F", "6F"]));
});

test("open-course optimizer visits the same stops at no greater cost", () => {
  const stops = [
    "4F_STORE_0044",
    "B2_STORE_0032",
    "6F_STORE_0033",
    "1F_STORE_0031",
  ];
  const original = buildItineraryRoute(graph, stops);
  const optimized = optimizeOpenItinerary(graph, stops);
  assert.ok(optimized);
  assert.deepEqual(new Set(optimized.stopPlaceIds), new Set(stops));
  assert.ok(optimized.itinerary.totalWeight <= original.totalWeight);
});
