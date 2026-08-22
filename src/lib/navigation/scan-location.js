/**
 * OCR 스캔 결과를 실내 지도 매장에 붙이기 위한 순수 매칭 헬퍼.
 * Axios/브랜드 API에 의존하지 않아 노드 테스트에서도 그대로 쓸 수 있습니다.
 */

export function normalizeScanName(name) {
  return String(name ?? "")
    .replace(/\s+/g, "")
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

function matchTermsFor(name) {
  const target = normalizeScanName(name);
  if (!target) return [];
  const aliases = BRAND_ALIASES[target] ?? [];
  return [target, ...aliases.map(normalizeScanName)];
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
