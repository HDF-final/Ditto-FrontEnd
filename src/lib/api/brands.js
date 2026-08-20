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

/** 브랜드/장소 이름을 매칭용으로 정규화합니다(공백 제거 + 소문자). */
export function normalizeBrandName(name) {
  return String(name ?? "")
    .replace(/\s+/g, "")
    .toLowerCase();
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
