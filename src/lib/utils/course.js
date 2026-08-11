// Pure helpers for course-stop ordering and identity.
// Kept free of React/Zustand so they can be unit-reasoned in isolation.

// Swap two stops by index and return a new array.
export function swapStops(stops, indexA, indexB) {
  const next = stops.slice();
  [next[indexA], next[indexB]] = [next[indexB], next[indexA]];
  return next;
}

// Move a stop from one index to another and return a new array.
export function reorderStops(stops, from, to) {
  const next = stops.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

// Whether a place with the given id is already in the course.
export function hasStop(stops, id) {
  return stops.some((stop) => stop.id === id);
}

// Recompute the 1-based order number for each stop.
export function renumberStops(stops) {
  return stops.map((stop, index) => ({ ...stop, number: index + 1 }));
}
