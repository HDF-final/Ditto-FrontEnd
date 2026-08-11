"use client";

import {
  COUNTRIES,
  DEFAULT_COUNTRY_CODE,
} from "@/lib/fixtures/countries";
import { usePreferenceStore } from "@/stores/use-preference-store";

/**
 * Compact country/language control shared across the app shell.
 * Options come from `lib/fixtures/countries` (same list as `/country`).
 */
export function CountrySelector() {
  const countryCode = usePreferenceStore((state) => state.countryCode);
  const setCountryCode = usePreferenceStore((state) => state.setCountryCode);

  const value = COUNTRIES.some((country) => country.code === countryCode)
    ? countryCode
    : DEFAULT_COUNTRY_CODE;

  return (
    <label className="flex items-center gap-2 text-sm text-ink-muted">
      <span className="sr-only">서비스 국가 선택</span>
      <select
        className="rounded-full border border-line bg-white px-3 py-2 font-medium text-ink outline-none transition focus:border-brand"
        value={value}
        onChange={(event) => setCountryCode(event.target.value)}
      >
        {COUNTRIES.map((country) => (
          <option key={country.code} value={country.code}>
            {country.language}
          </option>
        ))}
      </select>
    </label>
  );
}
