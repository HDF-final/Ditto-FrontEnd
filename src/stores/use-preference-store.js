import { create } from "zustand";
import { DEFAULT_COUNTRY_CODE } from "@/lib/fixtures/countries";

/**
 * In-memory travel preferences shared by onboarding (`/country`) and
 * `CountrySelector`. Intentionally NOT persisted (no localStorage / persist).
 */
export const usePreferenceStore = create((set) => ({
  countryCode: DEFAULT_COUNTRY_CODE,
  setCountryCode: (countryCode) => set({ countryCode }),
}));
