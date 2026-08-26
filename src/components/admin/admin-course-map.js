"use client";

import { useEffect, useMemo, useState } from "react";
import {
  attachPlaceIdsToCourseDataset,
  calculateCourseRoute,
  loadCourseRoutingDataset,
} from "@/lib/navigation/course-routing-service";
import { getNavigablePlaces } from "@/lib/api/place-navigation";

// 관리자 코스 편집기 **둘이 같이 쓰는** 지도 재료. 셀럽 편집기(초안·캐시)와 기본 추천
// 코스 편집기가 같은 원장·같은 경로 계산을 봐야 한다 — 둘이 다른 것을 보면 같은 코스를
// 열었는데 동선이 다르게 그려진다.

/**
 * 코스의 실내 경로. 자리가 바뀔 때마다 다시 계산한다 — 관리자가 동선을 고치는 것이
 * 편집기의 요지라, 지도가 그 결과를 바로 보여 주지 않으면 고쳐도 알 수가 없다.
 *
 * 계산은 전부 브라우저에서 돈다(`course-routing-service` 가 로컬 원장 JSON 을 읽는다).
 * 백엔드도 람다도 안 부른다.
 *
 * @param {string} routeKey `navigation_key` 를 `>` 로 이은 것. **문자열 하나로 받는다** —
 *   배열을 넣으면 사유 한 글자를 칠 때마다 새 배열이 만들어져 경로를 다시 판다.
 */
export function useCourseRoute(routeKey) {
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!routeKey) return undefined;

    let active = true;
    calculateCourseRoute(routeKey.split(">").map((navigationKey) => ({ navigationKey })))
      .then((next) => {
        if (active) setResult({ key: routeKey, ...next, error: null });
      })
      .catch((error) => {
        if (active) setResult({ key: routeKey, error });
      });

    return () => {
      active = false;
    };
  }, [routeKey]);

  const fresh = result?.key === routeKey;
  return {
    itinerary: fresh ? result.itinerary : null,
    graph: fresh ? result.graph : null,
    error: fresh ? result.error : null,
    loading: Boolean(routeKey) && !fresh,
  };
}

/**
 * 고를 수 있는 매장 전부. <b>`/ai-course` 의 '장소 추가'와 같은 것을 쓴다.</b>
 *
 * 로컬 원장(`loadCourseRoutingDataset`)이 147곳의 진짜 목록이고, 백엔드
 * `/places/navigation` 이 사진과 place_id 를 얹는다. 백엔드가 없어도 원장만으로 돌아간다.
 *
 * 원장은 모듈 안에서 한 번만 받아 두므로(`datasetPromise`) 지도가 이미 올려 둔 것을
 * 그대로 쓴다 — 이 화면이 목록 때문에 따로 왕복하는 일이 없다.
 *
 * `byPlaceId`·`byName` 은 기본 추천 코스 편집기가 쓴다. 그쪽은 백엔드에서 `placeId` 만
 * 받아 오는데 지도는 `navigationKey` 로만 그려지므로, 여기서 옮겨야 한다.
 */
export function usePlaceCatalog() {
  const [state, setState] = useState({ rows: [], loading: true, error: null });

  useEffect(() => {
    let active = true;
    Promise.all([
      loadCourseRoutingDataset(),
      getNavigablePlaces().catch(() => []),
    ])
      .then(([dataset, navigationPlaces]) => {
        if (!active) return;
        const hydrated = attachPlaceIdsToCourseDataset(dataset, navigationPlaces || []);
        setState({ rows: hydrated.places, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ rows: [], loading: false, error });
      });
    return () => {
      active = false;
    };
  }, []);

  const byPlaceId = useMemo(
    () =>
      new Map(
        state.rows
          .filter((place) => place.placeId !== null && place.placeId !== undefined)
          .map((place) => [String(place.placeId), place]),
      ),
    [state.rows],
  );

  // **이름으로도 한 번 더 맞춰 본다.** place_id 는 `/places/navigation` 이 얹어 주는데
  // 위에서 그 실패를 삼키고 있어(원장만으로도 목록은 그려져야 한다), 창구가 죽으면
  // placeId 가 하나도 없다. 그때 이름으로라도 이으면 지도가 통째로 비지는 않는다.
  const byName = useMemo(
    () => new Map(state.rows.map((place) => [normalizeName(place.name), place])),
    [state.rows],
  );

  return { ...state, byPlaceId, byName };
}

/** 공백·가운뎃점을 털어 낸 이름. DB 와 원장이 띄어쓰기만 다른 경우가 있다. */
function normalizeName(value) {
  return String(value || "").replace(/[\s·・]/g, "").toLowerCase();
}

/**
 * 백엔드가 준 자리(`placeId`·`name`)를 원장의 `navigationKey` 로 옮긴다.
 * 못 옮긴 자리는 `navigationKey` 가 null 로 남는다 — 지도에서 빠질 뿐 목록에는 남는다.
 */
export function resolveNavigationKey(catalog, place) {
  const byId = catalog.byPlaceId.get(String(place?.placeId));
  if (byId) return byId.navigationKey;
  const byName = catalog.byName.get(normalizeName(place?.name));
  return byName ? byName.navigationKey : null;
}
