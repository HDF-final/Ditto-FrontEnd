/**
 * 장소 카테고리 → 태그 색상 한 곳 정리.
 *
 * 카테고리 출처가 두 군데라 색이 어긋나기 쉽습니다.
 * - Boni 추천 응답의 `category`: 음식점 / 카페 / 여가 / 매장 …
 * - 실내 지도 원장(`store-navigation-keys.json`): 카테고리 필드 자체가 없어
 *   모든 장소가 기본값("매장")으로 채워집니다.
 *
 * 결과 카드·장소 모달·장소 추가 모달이 전부 `categoryStyle`을 그대로 렌더하므로
 * 표를 여기 하나만 두고 모든 매핑 지점에서 이 함수를 거치게 합니다.
 */

/** 원장에 카테고리가 없을 때 쓰는 값. */
export const DEFAULT_PLACE_CATEGORY = "매장";

export const PLACE_CATEGORY_STYLES = {
  매장: { categoryStyle: "bg-[#ede9f8] text-[#5c2ef5]", accentColor: "#5c2ef5" },
  음식점: { categoryStyle: "bg-[#ffe7d6] text-[#c2410c]", accentColor: "#c2410c" },
  카페: { categoryStyle: "bg-[#fce7f3] text-[#be185d]", accentColor: "#be185d" },
  여가: { categoryStyle: "bg-[#d7f2e8] text-[#0f766e]", accentColor: "#0f766e" },
  팝업: { categoryStyle: "bg-[#1a142e] text-white", accentColor: "#1a142e" },
  패션: { categoryStyle: "bg-[#dbeeff] text-[#1a6cb8]", accentColor: "#1a6cb8" },
  뷰티: { categoryStyle: "bg-[#f6e6ff] text-[#8b2fd6]", accentColor: "#8b2fd6" },
  편의시설: { categoryStyle: "bg-[#eceff4] text-[#4b5563]", accentColor: "#4b5563" },
};

/** 표에 없는 카테고리가 새로 내려와도 태그가 깨지지 않도록. */
const FALLBACK_STYLE = {
  categoryStyle: "bg-[#f0ecfa] text-[#6b6685]",
  accentColor: "#6b6685",
};

/**
 * 장소 추가 모달의 필터 칩 순서.
 * 147개 원장에 실제로 존재하는 카테고리만 둡니다(빈 결과 칩 방지).
 */
export const PLACE_CATEGORY_FILTERS = [
  "매장",
  "음식점",
  "카페",
  "여가",
  "팝업",
  "편의시설",
];

/**
 * 카테고리 문자열을 정규화하고 색까지 함께 돌려줍니다.
 *
 * 카테고리가 비어 있거나 일반값("매장")인데 이름에 "팝업"이 들어가면 팝업으로 봅니다.
 * 원장에는 카테고리가 없어서 이름이 유일한 단서이기 때문입니다.
 *
 * @returns {{ category: string, categoryStyle: string, accentColor: string }}
 */
export function resolvePlaceCategory(rawCategory, { placeName } = {}) {
  const named = typeof rawCategory === "string" ? rawCategory.trim() : "";
  const looksLikePopup =
    typeof placeName === "string" && placeName.includes("팝업");
  const category =
    looksLikePopup && (!named || named === DEFAULT_PLACE_CATEGORY)
      ? "팝업"
      : named || DEFAULT_PLACE_CATEGORY;

  return { category, ...(PLACE_CATEGORY_STYLES[category] ?? FALLBACK_STYLE) };
}
