"use client";

import {
  PREFERENCE_COOKIE_MAX_AGE,
  PREFERENCE_COOKIE_NAMES,
  normalizePreferences,
} from "@/lib/preferences/preference-policy";

function writeCookie(name, value) {
  if (typeof document === "undefined") return;

  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";

  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${PREFERENCE_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

export function writePreferenceCookies(preferences) {
  if (typeof document === "undefined") return;

  const normalized = normalizePreferences(preferences);

  document.documentElement.lang = normalized.languageCode;
  writeCookie(PREFERENCE_COOKIE_NAMES.country, normalized.countryCode);
  writeCookie(PREFERENCE_COOKIE_NAMES.language, normalized.languageCode);
  writeCookie(
    PREFERENCE_COOKIE_NAMES.manualLanguage,
    normalized.languageWasManuallySelected ? "1" : "0",
  );
}
