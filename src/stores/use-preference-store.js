"use client";

import { createContext, useContext, useState } from "react";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import { writePreferenceCookies } from "@/lib/preferences/preference-cookies";
import {
  getPreferencesAfterCountryChange,
  normalizePreferences,
} from "@/lib/preferences/preference-policy";
import {
  isSupportedCountryCode,
  isSupportedLanguageCode,
} from "@/lib/fixtures/countries";

const PreferenceStoreContext = createContext(null);
const identitySelector = (state) => state;

/**
 * A store is created per provider so server-rendered requests never share state.
 * Country/language are non-sensitive preferences persisted as SSR-readable cookies.
 */
export function createPreferenceStore(initialPreferences) {
  const initialState = normalizePreferences(initialPreferences);

  return createStore((set, get) => ({
    ...initialState,
    setCountryCode: (countryCode) => {
      if (!isSupportedCountryCode(countryCode)) return;

      const nextPreferences = getPreferencesAfterCountryChange(
        get(),
        countryCode,
      );
      set(nextPreferences);
      writePreferenceCookies(nextPreferences);
    },
    setLanguageCode: (languageCode) => {
      if (!isSupportedLanguageCode(languageCode)) return;

      const nextPreferences = normalizePreferences(
        {
          languageCode,
          languageWasManuallySelected: true,
        },
        get(),
      );
      set(nextPreferences);
      writePreferenceCookies(nextPreferences);
    },
    hydratePreferences: (preferences) => {
      const nextPreferences = normalizePreferences(preferences, get());
      set(nextPreferences);
      writePreferenceCookies(nextPreferences);
    },
  }));
}

export function PreferenceStoreProvider({ initialPreferences, children }) {
  const [store] = useState(() => createPreferenceStore(initialPreferences));

  return (
    <PreferenceStoreContext.Provider value={store}>
      {children}
    </PreferenceStoreContext.Provider>
  );
}

export function usePreferenceStore(selector = identitySelector) {
  const store = useContext(PreferenceStoreContext);

  if (!store) {
    throw new Error(
      "usePreferenceStore must be used inside PreferenceStoreProvider.",
    );
  }

  return useStore(store, selector);
}
