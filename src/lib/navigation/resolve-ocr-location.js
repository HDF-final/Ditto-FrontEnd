"use client";

import { pickBestOcrCandidate, recognizeOcrLocation } from "@/lib/api/ocr";
import {
  getNavigablePlaces,
  getPlaceNavigation,
} from "@/lib/api/place-navigation";
import {
  attachPlaceIdsToCourseDataset,
  loadCourseRoutingDataset,
} from "@/lib/navigation/course-routing-service";
import { compressImage, dataUrlToBlob } from "@/lib/utils/image-compression";
import { buildScanLocation, matchPlaceByName } from "./scan-location";

function assertNotAborted(signal) {
  if (signal?.aborted) {
    const error = new Error("aborted");
    error.name = "AbortError";
    throw error;
  }
}

/**
 * 촬영본(data URL)을 OCR 한 뒤 실내 지도 매장으로 붙입니다.
 *
 * 매장 매칭은 백엔드 `POST /ocr/locations/recognize` 후보가 담당합니다.
 * 프론트는 후보의 placeId·navigationKey 로 지도 원장만 이어 붙입니다.
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

  const candidate = pickBestOcrCandidate(result);
  const recognizedName = result?.recognizedBrandName || null;
  if (!candidate && !recognizedName) {
    return { brand: null, place: null, location: null };
  }

  const [dataset, navigationPlaces] = await Promise.all([
    loadCourseRoutingDataset().catch(() => null),
    getNavigablePlaces().catch(() => []),
  ]);
  assertNotAborted(signal);

  const hydrated = dataset
    ? attachPlaceIdsToCourseDataset(dataset, navigationPlaces || [])
    : null;

  let navigationKey = candidate?.navigationKey || null;
  if (!navigationKey && candidate?.placeId != null) {
    const nav = await getPlaceNavigation(candidate.placeId).catch(() => null);
    assertNotAborted(signal);
    navigationKey = nav?.navigationKey || null;
    if (!candidate.floor && nav?.floorCode) candidate.floor = nav.floorCode;
    if (!candidate.name && nav?.name) candidate.name = nav.name;
  }

  let place = null;
  if (hydrated && navigationKey) {
    place = hydrated.placesByNavigationKey.get(navigationKey) ?? null;
  }
  if (!place && hydrated && candidate?.placeId != null) {
    place = hydrated.placesByPlaceId.get(String(candidate.placeId)) ?? null;
  }
  if (!place && hydrated) {
    place =
      matchPlaceByName(candidate?.name, hydrated.places) ||
      matchPlaceByName(recognizedName, hydrated.places);
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
