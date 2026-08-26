/**
 * OCR 스캔 결과를 실내 지도 매장에 붙이기 위한 순수 매칭 헬퍼.
 * Axios/브랜드 API에 의존하지 않아 노드 테스트에서도 그대로 쓸 수 있습니다.
 */

export function normalizeScanName(name) {
  return String(name ?? "")
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .toLowerCase();
}

/**
 * 간판 영문 표기 → 지도 카탈로그(한글) 상호.
 * OCR은 SYSTEM 을 읽지만 원장의 매장명은 "시스템" 이다.
 */
const BRAND_ALIASES = {
  system: ["시스템"],
  nike: ["나이키"],
  adidas: ["아디다스"],
  starbucks: ["스타벅스"],
  gucci: ["구찌"],
  prada: ["프라다"],
  dior: ["디올"],
  celine: ["셀린느"],
  loewe: ["로에베"],
  fendi: ["펜디"],
  burberry: ["버버리"],
  moncler: ["몽클레르"],
  tamburins: ["템버린즈"],
  aesop: ["이솝"],
  sulwhasoo: ["설화수"],
  eataly: ["이탈리"],
  popmart: ["팝마트"],
  northface: ["노스페이스"],
  thenorthface: ["노스페이스"],
  lululemon: ["룰루레몬"],
  acne: ["아크네"],
  acnestudios: ["아크네"],
  stoneisland: ["스톤아일랜드"],
  maisonkitsune: ["메종키츠네"],
  newbalance: ["뉴발란스"],
  mlb: ["mlb"],
};

function addAliasTerms(terms, latin) {
  terms.add(latin);
  for (const local of BRAND_ALIASES[latin] ?? []) {
    const normalized = normalizeScanName(local);
    if (normalized) terms.add(normalized);
  }
}

function matchTermsFor(name) {
  const target = normalizeScanName(name);
  if (!target) return [];
  const terms = new Set([target]);

  if (BRAND_ALIASES[target]) addAliasTerms(terms, target);

  // "EATALY SEOUL" / "이탈리점" 처럼 간판 앞뒤 글자가 붙어도 별칭을 씁니다.
  // 한 글자 OCR 오인식이 "eataly".includes("e") 로 이탈리에 붙지 않게,
  // 별칭 쪽이 검색어에 포함될 때만 확장합니다.
  for (const [latin, locals] of Object.entries(BRAND_ALIASES)) {
    if (latin.length >= 4 && target.includes(latin)) addAliasTerms(terms, latin);
    for (const local of locals) {
      const normalized = normalizeScanName(local);
      if (normalized.length >= 2 && target.includes(normalized)) {
        addAliasTerms(terms, latin);
      }
    }
  }

  return [...terms];
}

/**
 * 인식된 브랜드/텍스트를 지도 매장 목록과 대조합니다.
 * 영문 간판(SYSTEM)은 한글 상호(시스템) 별칭으로도 찾습니다.
 * 정확 일치가 있으면 그걸 쓰고, 없으면 서로를 포함하는 이름 중 더 짧은 쪽을 고릅니다.
 */
export function matchPlaceByName(name, places) {
  const terms = matchTermsFor(name);
  if (terms.length === 0) return null;

  for (const term of terms) {
    for (const place of places ?? []) {
      const key = normalizeScanName(place?.name);
      if (key && key === term) return place;
    }
  }

  let fuzzy = null;
  let fuzzyLength = Infinity;
  for (const term of terms) {
    for (const place of places ?? []) {
      const key = normalizeScanName(place?.name);
      if (!key) continue;
      if (key.includes(term) || term.includes(key)) {
        if (key.length < fuzzyLength) {
          fuzzy = place;
          fuzzyLength = key.length;
        }
      }
    }
  }

  return fuzzy;
}

export function buildScanLocation(place, brand) {
  if (!place?.navigationKey) return null;
  return {
    navigationKey: place.navigationKey,
    name: place.name,
    floor: place.floor,
    placeId: place.placeId ?? null,
    logoUrl: brand?.logoUrl ?? null,
  };
}

/**
 * OCR "내 위치"는 스캔 직후 지도와 그 코스 생성 화면에서만 유지합니다.
 * 다른 경로로 나가면 store/sessionStorage 를 비웁니다.
 */
export function isScanLocationFlowRoute(pathname, search = "") {
  const path = String(pathname ?? "");
  if (path === "/scan-map" || path.startsWith("/scan-map/")) return true;
  if (path === "/ai-course" || path.startsWith("/ai-course/")) {
    const query = String(search ?? "");
    const params = new URLSearchParams(
      query.startsWith("?") ? query.slice(1) : query,
    );
    return params.get("from") === "scan";
  }
  return false;
}

/**
 * OCR 후보의 키·이름 중 하나로 실내 지도 매장을 찾습니다.
 * 백엔드 navigationKey 가 원장에 없어도 한글/영문 상호로 다시 찾습니다.
 */
export function resolvePlaceFromScan({
  places,
  placesByNavigationKey,
  placesByPlaceId,
  navigationKey,
  placeId,
  names = [],
} = {}) {
  const byKey =
    navigationKey && placesByNavigationKey
      ? placesByNavigationKey.get(navigationKey)
      : null;
  if (byKey) return byKey;

  const byId =
    placeId != null && placesByPlaceId
      ? placesByPlaceId.get(String(placeId))
      : null;
  if (byId) return byId;

  for (const name of names) {
    const matched = matchPlaceByName(name, places);
    if (matched) return matched;
  }

  return null;
}
