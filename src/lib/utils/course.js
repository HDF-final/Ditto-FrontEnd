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

// Nearest-neighbor ordering by each stop's [x, y] coord, starting from the
// first stop. Returns a new array; input is left untouched. Used to suggest an
// optimized route — it never mutates the course on its own.
export function optimizeOrder(stops) {
  if (stops.length < 2) {
    return stops.slice();
  }
  const remaining = stops.slice();
  const route = [remaining.shift()];
  while (remaining.length) {
    const [lastX, lastY] = route[route.length - 1].coord || [0, 0];
    let bestIndex = 0;
    let bestDistance = Infinity;
    remaining.forEach((stop, index) => {
      const [x, y] = stop.coord || [0, 0];
      const distance = Math.hypot(x - lastX, y - lastY);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    route.push(remaining.splice(bestIndex, 1)[0]);
  }
  return route;
}
