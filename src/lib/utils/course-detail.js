export function getCourseStopMeta(stops = []) {
  const list = Array.isArray(stops) ? stops : [];
  const floors = [];
  const seen = new Set();

  for (const stop of list) {
    const floor = String(stop?.floor || stop?.floorCode || "").trim();
    if (!floor) continue;
    const key = floor.replace(/\s+/g, "").toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    floors.push(floor);
  }

  return {
    spotCount: list.length,
    floors,
    floorLabel: floors.join(" · ") || "-",
  };
}
