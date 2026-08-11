/**
 * Country / language options from the HTML mock (country.html).
 * Single source for onboarding country cards and shared country selectors.
 */

export const COUNTRIES = [
  {
    code: "KR",
    name: "한국",
    language: "한국어",
    flag: "🇰🇷",
    lang: "ko",
  },
  {
    code: "CN",
    name: "中国",
    language: "简体中文",
    flag: "🇨🇳",
    lang: "zh",
  },
  {
    code: "JP",
    name: "日本",
    language: "日本語",
    flag: "🇯🇵",
    lang: "ja",
  },
  {
    code: "US",
    name: "United States",
    language: "English",
    flag: "🇺🇸",
    lang: "en",
  },
];

export const DEFAULT_COUNTRY_CODE = "KR";

export function getCountryByCode(code) {
  return COUNTRIES.find((country) => country.code === code) ?? COUNTRIES[0];
}

export function resolveLang(lang) {
  return COUNTRIES.some((country) => country.lang === lang) ? lang : "ko";
}
