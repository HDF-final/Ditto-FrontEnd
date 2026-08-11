export function optimizeOrder(stops) {
  return [...stops].sort((first, second) => {
    const firstPriority = resolvePriority(first.category);
    const secondPriority = resolvePriority(second.category);

    if (firstPriority !== secondPriority) {
      return firstPriority - secondPriority;
    }

    return first.name.localeCompare(second.name, "ko");
  });
}

function resolvePriority(category = "") {
  if (/식당|한식|다이닝|카페|디저트/.test(category)) {
    return 0;
  }
  if (/K-pop|패션|뷰티/.test(category)) {
    return 1;
  }
  if (/팝업/.test(category)) {
    return 2;
  }
  return 3;
}
