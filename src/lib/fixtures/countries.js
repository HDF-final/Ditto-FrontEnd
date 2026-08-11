export const countries = [
  {
    code: "US",
    name: "United States",
    flag: "US",
    lang: "en",
    languageLabel: "English",
    description: "English copy and K-culture shopping routes are prioritized.",
  },
  {
    code: "CN",
    name: "China",
    flag: "CN",
    lang: "zh",
    languageLabel: "中文",
    description: "중국 여행자에게 익숙한 쇼핑 동선과 인기 브랜드를 우선해요.",
  },
  {
    code: "JP",
    name: "Japan",
    flag: "JP",
    lang: "ja",
    languageLabel: "日本語",
    description: "일본 여행자에게 맞춘 짧은 이동 동선과 트렌드 코스를 추천해요.",
  },
];

export function resolveLang(lang) {
  return ["ko", "en", "zh", "ja"].includes(lang) ? lang : "ko";
}
