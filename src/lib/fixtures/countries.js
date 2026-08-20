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
export const DEFAULT_LANGUAGE_CODE = "ko";

export const LANGUAGES = [
  { code: "ko", name: "한국어", nativeName: "한국어" },
  { code: "zh", name: "중국어", nativeName: "简体中文" },
  { code: "ja", name: "일본어", nativeName: "日本語" },
  { code: "en", name: "영어", nativeName: "English" },
];

export function getCountryByCode(code) {
  return COUNTRIES.find((country) => country.code === code) ?? COUNTRIES[0];
}

export function getLanguageByCode(code) {
  return LANGUAGES.find((language) => language.code === code) ?? LANGUAGES[0];
}

export function getDefaultLanguageForCountry(countryCode) {
  return getCountryByCode(countryCode).lang;
}

export function isSupportedCountryCode(code) {
  return COUNTRIES.some((country) => country.code === code);
}

export function isSupportedLanguageCode(code) {
  return LANGUAGES.some((language) => language.code === code);
}

export function resolveLang(lang) {
  return isSupportedLanguageCode(lang) ? lang : DEFAULT_LANGUAGE_CODE;
}
