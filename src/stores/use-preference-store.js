import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  DEFAULT_COUNTRY_CODE,
  DEFAULT_LANGUAGE_CODE,
  isSupportedCountryCode,
  isSupportedLanguageCode,
} from "@/lib/fixtures/countries";

/**
 * Country/language are non-sensitive preferences, so guest choices are persisted.
 * Authentication/session information must never be added to this store.
 */
export const usePreferenceStore = create(
  persist(
    (set) => ({
      countryCode: DEFAULT_COUNTRY_CODE,
      languageCode: DEFAULT_LANGUAGE_CODE,
      setCountryCode: (countryCode) => {
        if (isSupportedCountryCode(countryCode)) {
          set({ countryCode });
        }
      },
      setLanguageCode: (languageCode) => {
        if (isSupportedLanguageCode(languageCode)) {
          set({ languageCode });
        }
      },
      setPreferences: ({ countryCode, languageCode }) =>
        set((state) => ({
          countryCode: isSupportedCountryCode(countryCode)
            ? countryCode
            : state.countryCode,
          languageCode: isSupportedLanguageCode(languageCode)
            ? languageCode
            : state.languageCode,
        })),
    }),
    {
      name: "ditto-preferences-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ countryCode, languageCode }) => ({
        countryCode,
        languageCode,
      }),
      skipHydration: true,
    },
  ),
);
