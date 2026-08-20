import {
  DEFAULT_COUNTRY_CODE,
  DEFAULT_LANGUAGE_CODE,
  getDefaultLanguageForCountry,
  isSupportedCountryCode,
  isSupportedLanguageCode,
} from "@/lib/fixtures/countries";

export const PREFERENCE_COOKIE_NAMES = Object.freeze({
  country: "ditto-country",
  language: "ditto-language",
  manualLanguage: "ditto-language-manual",
});

export const PREFERENCE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function parseAcceptLanguage(acceptLanguage) {
  if (typeof acceptLanguage !== "string") return [];

  return acceptLanguage
    .split(",")
    .map((entry, index) => {
      const [tag, ...parameters] = entry.trim().split(";");
      const qualityParameter = parameters.find((parameter) =>
        parameter.trim().startsWith("q="),
      );
      const quality = qualityParameter
        ? Number.parseFloat(qualityParameter.trim().slice(2))
        : 1;

      return {
        tag: tag.toLowerCase(),
        quality: Number.isFinite(quality) ? quality : 0,
        index,
      };
    })
    .filter(({ tag, quality }) => tag && quality > 0)
    .sort((left, right) => right.quality - left.quality || left.index - right.index);
}

export function resolvePreferredLanguage(acceptLanguage) {
  for (const { tag } of parseAcceptLanguage(acceptLanguage)) {
    const baseLanguage = tag.split("-")[0];
    if (isSupportedLanguageCode(baseLanguage)) {
      return baseLanguage;
    }
  }

  return DEFAULT_LANGUAGE_CODE;
}

export function normalizePreferences(preferences = {}, fallback = {}) {
  const fallbackCountryCode = isSupportedCountryCode(fallback.countryCode)
    ? fallback.countryCode
    : DEFAULT_COUNTRY_CODE;
  const fallbackLanguageCode = isSupportedLanguageCode(fallback.languageCode)
    ? fallback.languageCode
    : DEFAULT_LANGUAGE_CODE;

  return {
    countryCode: isSupportedCountryCode(preferences.countryCode)
      ? preferences.countryCode
      : fallbackCountryCode,
    languageCode: isSupportedLanguageCode(preferences.languageCode)
      ? preferences.languageCode
      : fallbackLanguageCode,
    languageWasManuallySelected:
      typeof preferences.languageWasManuallySelected === "boolean"
        ? preferences.languageWasManuallySelected
        : Boolean(fallback.languageWasManuallySelected),
  };
}

export function resolveInitialPreferences({
  countryCookie,
  languageCookie,
  manualLanguageCookie,
  acceptLanguage,
} = {}) {
  const hasStoredLanguage = isSupportedLanguageCode(languageCookie);

  return {
    countryCode: isSupportedCountryCode(countryCookie)
      ? countryCookie
      : DEFAULT_COUNTRY_CODE,
    languageCode: hasStoredLanguage
      ? languageCookie
      : resolvePreferredLanguage(acceptLanguage),
    languageWasManuallySelected:
      hasStoredLanguage && manualLanguageCookie === "1",
  };
}

export function getPreferencesAfterCountryChange(
  currentPreferences,
  nextCountryCode,
) {
  const current = normalizePreferences(currentPreferences);
  if (!isSupportedCountryCode(nextCountryCode)) return current;

  return {
    countryCode: nextCountryCode,
    languageCode: current.languageWasManuallySelected
      ? current.languageCode
      : getDefaultLanguageForCountry(nextCountryCode),
    languageWasManuallySelected: current.languageWasManuallySelected,
  };
}
