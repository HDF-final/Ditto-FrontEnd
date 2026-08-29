"use client";

import {
  normalizeOcrCandidate,
  pickBestOcrCandidate,
  recognizeOcrLocation,
} from "@/lib/api/ocr";
import {
  getNavigablePlaces,
  getPlaceNavigation,
  normalizePlaceNavigation,
} from "@/lib/api/place-navigation";
import {
  attachPlaceIdsToCourseDataset,
  loadCourseRoutingDataset,
} from "@/lib/navigation/course-routing-service";
import { loadStoreNavigationKeys } from "@/lib/navigation/navigation-dataset";
import { compressImage, dataUrlToBlob } from "@/lib/utils/image-compression";
import { buildScanLocation, resolvePlaceFromScan } from "./scan-location";

function assertNotAborted(signal) {
  if (signal?.aborted) {
    const error = new Error("aborted");
    error.name = "AbortError";
    throw error;
  }
}

function catalogPlacesFromRecords(records) {
  return (Array.isArray(records) ? records : []).map((record) => ({
    navigationKey: record.navigation_key ?? record.navigationKey ?? null,
    name: record.place_name ?? record.name,
    floor: record.floor_code ?? record.floor,
    placeId: record.place_id ?? record.placeId ?? null,
  }));
}

function indexPlaces(places) {
  return {
    places,
    placesByNavigationKey: new Map(
      places
        .filter((place) => place.navigationKey)
        .map((place) => [place.navigationKey, place]),
    ),
    placesByPlaceId: new Map(
      places
        .filter((place) => place.placeId != null)
        .map((place) => [String(place.placeId), place]),
    ),
  };
}

function nameFromNavigationPlaces(navigationPlaces, placeId) {
  if (placeId == null) return null;
  const match = (navigationPlaces || []).find(
    (place) => String(place?.placeId) === String(placeId),
  );
  return match?.name ?? null;
}

async function loadScanPlaces(signal) {
  const [dataset, navigationPlaces] = await Promise.all([
    loadCourseRoutingDataset().catch(() => null),
    getNavigablePlaces().catch(() => []),
  ]);
  assertNotAborted(signal);

  const normalizedPlaces = (Array.isArray(navigationPlaces) ? navigationPlaces : [])
    .map(normalizePlaceNavigation)
    .filter(Boolean);

  if (dataset) {
    return {
      ...attachPlaceIdsToCourseDataset(dataset, normalizedPlaces),
      navigationPlaces: normalizedPlaces,
    };
  }

  // 층 그래프가 깨져도 매장명 매칭은 되게, 키 원장만 따로 읽습니다.
  const records = await loadStoreNavigationKeys().catch(() => []);
  assertNotAborted(signal);
  return {
    ...indexPlaces(catalogPlacesFromRecords(records)),
    navigationPlaces: normalizedPlaces,
  };
}

/**
 * 고른(또는 자동 선택된) 후보 하나를 실내 지도 매장으로 붙입니다.
 *
 * 백엔드 후보의 placeId·navigationKey 를 우선하고, 원장에 없으면
 * 인식된 상호(이탈리 / EATALY)로 다시 찾습니다.
 */
async function resolveCandidateToLocation({
  candidate,
  candidates = [],
  recognizedName = null,
  signal,
}) {
  const hydrated = await loadScanPlaces(signal);

  if (candidate && !candidate.navigationKey && candidate.placeId != null) {
    const nav = normalizePlaceNavigation(
      await getPlaceNavigation(candidate.placeId).catch(() => null),
    );
    assertNotAborted(signal);
    if (nav?.navigationKey) candidate.navigationKey = nav.navigationKey;
    if (!candidate.floor && nav?.floorCode) candidate.floor = nav.floorCode;
    if (!candidate.name && nav?.name) candidate.name = nav.name;
  }

  let place = null;
  const lookupNames = [
    candidate?.name,
    recognizedName,
    nameFromNavigationPlaces(hydrated.navigationPlaces, candidate?.placeId),
    ...candidates.map((item) => item.name),
  ];

  for (const item of [candidate, ...candidates].filter(Boolean)) {
    place = resolvePlaceFromScan({
      ...hydrated,
      navigationKey: item.navigationKey,
      placeId: item.placeId,
      names: lookupNames,
    });
    if (place) break;
  }
  if (!place) {
    place = resolvePlaceFromScan({
      ...hydrated,
      names: lookupNames,
    });
  }

  const brand = {
    name: candidate?.name || place?.name || recognizedName,
    placeId: candidate?.placeId ?? place?.placeId ?? null,
  };
  return {
    brand,
    place,
    location: buildScanLocation(place, brand),
  };
}

/**
 * 촬영본(data URL)을 OCR 합니다.
 *
 * 백엔드가 `requiresSelection: true` 로 내려주면(같은 상호가 여러 층에 있는 등)
 * 자동 진행하지 않고 `{ requiresSelection: true, candidates }` 를 돌려줘 사용자가
 * 직접 고르게 합니다. 그 외에는 기존처럼 가장 신뢰도 높은 후보로 바로 위치를 붙입니다.
 */
export async function resolveOcrLocationFromDataUrl(dataUrl, { signal } = {}) {
  const blob = dataUrlToBlob(dataUrl);
  if (!blob) throw new Error("이미지를 읽을 수 없어요. 다시 촬영해주세요.");

  const original = new File([blob], "scan.jpg", { type: blob.type || "image/jpeg" });
  const compressedUrl = await compressImage(original, 1280, 0.82);
  assertNotAborted(signal);
  const uploadBlob = compressedUrl ? dataUrlToBlob(compressedUrl) : blob;
  if (!uploadBlob) throw new Error("이미지를 읽을 수 없어요. 다시 촬영해주세요.");
  const file = new File([uploadBlob], "scan.jpg", {
    type: uploadBlob.type || "image/jpeg",
  });

  const result = await recognizeOcrLocation(file);
  assertNotAborted(signal);

  const recognizedName =
    result?.recognizedBrandName || result?.recognized_brand_name || null;
  const candidates = (Array.isArray(result?.candidates) ? result.candidates : [])
    .map(normalizeOcrCandidate)
    .filter(Boolean)
    .sort((a, b) => (Number(b.confidence) || 0) - (Number(a.confidence) || 0));
  const requiresSelection = Boolean(
    result?.requiresSelection ?? result?.requires_selection,
  );

  // 백엔드가 선택을 요구하면 자동 진행 금지 — 후보만 넘겨 UI에서 고르게 합니다.
  if (requiresSelection && candidates.length > 0) {
    return { requiresSelection: true, candidates, recognizedName };
  }

  const candidate = candidates[0] || pickBestOcrCandidate(result);
  if (!candidate && !recognizedName) {
    return { requiresSelection: false, brand: null, place: null, location: null };
  }

  const resolved = await resolveCandidateToLocation({
    candidate,
    candidates,
    recognizedName,
    signal,
  });
  return { requiresSelection: false, ...resolved };
}

/**
 * 선택 UI에서 사용자가 탭한 후보 하나로 위치를 붙입니다.
 * `resolveOcrLocationFromDataUrl` 의 자동 진행과 같은 매칭 로직을 재사용합니다.
 */
export async function resolveOcrCandidate(candidate, { signal } = {}) {
  const normalized = normalizeOcrCandidate(candidate);
  if (!normalized) return { brand: null, place: null, location: null };
  return resolveCandidateToLocation({
    candidate: normalized,
    candidates: [normalized],
    recognizedName: normalized.name ?? null,
    signal,
  });
}
