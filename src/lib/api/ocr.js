import apiClient from "./client";
import { requestData } from "./api-response";

/**
 * OCR 현재 위치 인식.
 *
 * `POST /api/v1/ocr/locations/recognize` 로 간판 이미지를 멀티파트 업로드합니다.
 * 세션 없이 이미지만으로 동작하며, `{ recognitionId, recognizedBrandName, candidates }`
 * 를 돌려줍니다. 후보 항목은 `{ placeId, name, floor, confidence }` 입니다.
 *
 * @param {Blob|File} image 촬영/선택한 간판 이미지
 */
export function recognizeOcrLocation(image) {
  const form = new FormData();
  const file =
    image instanceof File
      ? image
      : new File([image], "scan.jpg", { type: image?.type || "image/jpeg" });
  form.append("image", file);
  return requestData(
    apiClient.post("/ocr/locations/recognize", form, {
      timeout: 60_000,
      headers: { "Content-Type": undefined },
    }),
  );
}

export function normalizeOcrCandidate(candidate) {
  if (!candidate || typeof candidate !== "object") return null;
  return {
    placeId: candidate.placeId ?? candidate.place_id ?? null,
    navigationKey: candidate.navigationKey ?? candidate.navigation_key ?? null,
    name: candidate.name ?? candidate.placeName ?? candidate.place_name ?? null,
    floor: candidate.floor ?? candidate.floorCode ?? candidate.floor_code ?? null,
    confidence: Number(candidate.confidence) || 0,
  };
}

/** 신뢰도가 가장 높은 장소 후보를 고릅니다. */
export function pickBestOcrCandidate(result) {
  const candidates = Array.isArray(result?.candidates) ? result.candidates : [];
  if (candidates.length === 0) return null;
  const best = candidates.reduce((currentBest, current) => {
    const bestScore = Number(currentBest?.confidence) || 0;
    const currentScore = Number(current?.confidence) || 0;
    return currentScore > bestScore ? current : currentBest;
  }, candidates[0]);
  return normalizeOcrCandidate(best);
}
