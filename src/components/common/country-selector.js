"use client";

import { COUNTRIES } from "@/lib/fixtures/countries";
import { usePreferenceStore } from "@/stores/use-preference-store";

export function CountrySelector() {
  const countryCode = usePreferenceStore((state) => state.countryCode);
  const setCountryCode = usePreferenceStore((state) => state.setCountryCode);

  return (
    <label className="flex items-center gap-2 text-sm text-ink-muted">
      <span className="sr-only">서비스 국가 선택</span>
      <select
        className="rounded-full border border-line bg-white px-3 py-2 font-medium text-ink outline-none transition focus:border-brand"
        value={countryCode}
        onChange={(event) => setCountryCode(event.target.value)}
      >
        {COUNTRIES.map((country) => (
          <option key={country.code} value={country.code}>
            {country.flag} {country.language}
          </option>
        ))}
      </select>
    </label>
  );
}
