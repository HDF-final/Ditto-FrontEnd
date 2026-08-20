const SUPPORTED_API_LANGUAGES = new Set(["ko", "zh", "ja", "en"]);
const DEFAULT_API_LANGUAGE = "ko";
const LANGUAGE_COOKIE_NAME = "ditto-language";

export function normalizeApiLanguage(languageCode) {
  return SUPPORTED_API_LANGUAGES.has(languageCode)
    ? languageCode
    : DEFAULT_API_LANGUAGE;
}

export function getApiLanguageFromCookieString(cookieString) {
  if (typeof cookieString !== "string" || !cookieString.trim()) {
    return DEFAULT_API_LANGUAGE;
  }

  const languageCookie = cookieString
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${LANGUAGE_COOKIE_NAME}=`));

  if (!languageCookie) return DEFAULT_API_LANGUAGE;

  try {
    const value = decodeURIComponent(languageCookie.slice(languageCookie.indexOf("=") + 1));
    return normalizeApiLanguage(value);
  } catch {
    return DEFAULT_API_LANGUAGE;
  }
}

export function applyApiLanguageHeader(headers, cookieString) {
  if (!headers || typeof headers.get !== "function" || typeof headers.set !== "function") {
    return;
  }
  if (!headers.get("Accept-Language")) {
    headers.set(
      "Accept-Language",
      getApiLanguageFromCookieString(cookieString),
    );
  }
}
