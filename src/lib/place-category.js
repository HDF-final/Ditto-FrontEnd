// 장소 분류 한 곳. 배지 글자와 색이 여기서만 정해진다.
//
// 예전에는 카테고리 어휘가 세 갈래로 갈려 있었다 — 정적 카탈로그는 팝업/패션/뷰티,
// 길찾기 서비스는 매장/팝업, AI 응답 폴백은 "쇼핑/패션". 색 표에 없는 값이 오면
// 스프레드가 조용히 아무것도 안 넣어서 배지에 색만 빠진 채로 나갔다.
//
// AI 엔진(ditto-chat-v2)이 이 넷으로 내려주므로 화면도 같은 넷으로 맞춘다.

export const PLACE_CATEGORIES = ["매장", "음식점", "카페", "여가"];

const FALLBACK = "매장";

// 예전 값 → 4분류. 정적 카탈로그와 옛 API 응답이 아직 이 이름들을 쓴다.
const ALIASES = {
  매장: "매장",
  팝업: "매장",
  패션: "매장",
  뷰티: "매장",
  "디자이너 편집샵": "매장",
  "쇼핑/패션": "매장",
  "K-뷰티": "매장",
  쇼핑: "매장",

  음식점: "음식점",
  식당: "음식점",
  한식당: "음식점",

  카페: "카페",
  베이커리: "카페",
  디저트: "카페",
  "디저트·카페": "카페",

  여가: "여가",
  전시: "여가",
  "문화·체험": "여가",
  체험: "여가",
};

// 넷이 서로 다른 색상(hue)을 갖는다. 같은 톤의 옅은 배경 + 진한 글자로 형태를
// 통일해서, 배지끼리 비교할 때 색만 달라 보이게 한다.
//   매장 보라 · 음식점 주황 · 카페 분홍 · 여가 파랑
const STYLES = {
  매장: {
    categoryStyle: "bg-[#ede9f8] text-[#5c2ef5]",
    accentColor: "#5c2ef5",
    gradientFrom: "#5c2ef5",
    gradientTo: "#1a142e",
  },
  음식점: {
    categoryStyle: "bg-[#ffe9d8] text-[#c2410c]",
    accentColor: "#c2410c",
    gradientFrom: "#c2410c",
    gradientTo: "#2e1508",
  },
  카페: {
    categoryStyle: "bg-[#fce7f3] text-[#be185d]",
    accentColor: "#be185d",
    gradientFrom: "#be185d",
    gradientTo: "#1a142e",
  },
  여가: {
    categoryStyle: "bg-[#dbeeff] text-[#1a6cb8]",
    accentColor: "#1a6cb8",
    gradientFrom: "#1a6cb8",
    gradientTo: "#0d1a2e",
  },
};

/** 어떤 값이 와도 네 분류 중 하나로. 모르는 값은 매장으로 둔다. */
export function normalizeCategory(value) {
  if (!value) return FALLBACK;
  const key = String(value).trim();
  return ALIASES[key] ?? FALLBACK;
}

/**
 * 배지 색·강조색 묶음. 정규화까지 해주므로 호출부가 값을 먼저 다듬을 필요가 없다.
 * 표에 없는 값이 와도 undefined 가 아니라 매장 스타일이 나온다 —
 * 예전에는 여기서 undefined 가 나와 className 에 "undefined" 가 붙었다.
 */
export function categoryStyleOf(value) {
  return STYLES[normalizeCategory(value)];
}
