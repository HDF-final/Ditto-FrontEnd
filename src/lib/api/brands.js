import apiClient from "./client";
import { requestData } from "./api-response";

/**
 * 브랜드 로고 API.
 *
 * `GET /api/v1/brands` 는 활성 브랜드 목록을 로고 presigned URL과 함께 돌려줍니다.
 * 응답 항목은 `{ brandId, name, logoUrl }` 형태이며, 지도 핑(출발·도착 등)에 브랜드
 * 로고를 붙일 때 사용합니다.
 */
export function getBrands() {
  return requestData(apiClient.get("/brands"));
}

/**
 * 간판 OCR은 `src/lib/api/ocr.js` 의 `POST /ocr/locations/recognize` 를 씁니다.
 * `/brands/scan` 은 백엔드에 없어 POST 시 "지원하지 않는 HTTP 메서드"가 납니다.
 */

/**
 * 스캔 API가 돌려준 값을 브랜드 매칭 객체로 정규화합니다.
 * `{ name }` 뿐 아니라 `{ brandName }`, `{ brand: { name } }` 도 허용합니다.
 */
export function normalizeBrandMatch(result) {
  if (!result || typeof result !== "object") return null;
  const nested =
    result.brand && typeof result.brand === "object" ? result.brand : null;
  const name =
    nested?.name ||
    nested?.brandName ||
    result.name ||
    result.brandName ||
    null;
  const text = result.text || result.ocrText || result.recognizedText || name;
  if (!name && !text) return null;
  return {
    brandId:
      nested?.brandId ??
      nested?.id ??
      result.brandId ??
      result.id ??
      null,
    name: name || text,
    logoUrl: nested?.logoUrl ?? result.logoUrl ?? null,
    text,
  };
}

/** 서버 응답이 브랜드 객체인지(name 보유) 판별합니다. */
export function isBrandMatch(result) {
  return Boolean(normalizeBrandMatch(result)?.name);
}

/** 브랜드/장소 이름을 매칭용으로 정규화합니다(공백 제거 + 소문자). */
export function normalizeBrandName(name) {
  return String(name ?? "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

/**
 * 인식 텍스트를 브랜드 목록과 매칭합니다. 서버가 브랜드 대신 인식 텍스트만
 * 돌려줄 때(예: `{ text }`)를 위한 클라이언트 대비책이며, 정규화된 이름이
 * 서로를 포함하면 매칭으로 봅니다.
 */
export function matchBrandByText(text, brands) {
  const target = normalizeBrandName(text);
  if (!target) return null;
  for (const brand of brands ?? []) {
    if (!brand?.name) continue;
    const key = normalizeBrandName(brand.name);
    if (key && (target.includes(key) || key.includes(target))) return brand;
  }
  return null;
}

/**
 * 브랜드 목록을 `정규화된 이름 -> logoUrl` 조회 맵으로 만듭니다.
 * 장소 이름으로 로고를 찾을 때 사용합니다. logoUrl이 없는 항목은 건너뜁니다.
 */
export function buildBrandLogoMap(brands) {
  const map = {};
  for (const brand of brands ?? []) {
    if (!brand?.name || !brand.logoUrl) continue;
    map[normalizeBrandName(brand.name)] = brand.logoUrl;
  }
  return map;
}
