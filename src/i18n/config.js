export const SUPPORTED_LOCALES = Object.freeze(["ko", "zh", "ja", "en"]);
export const DEFAULT_LOCALE = "ko";

export function isSupportedLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale);
}

export function resolveLocale(locale) {
  return isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
}
