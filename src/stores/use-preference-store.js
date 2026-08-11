import { create } from "zustand";

export const usePreferenceStore = create((set) => ({
  countryCode: "US",
  setCountryCode: (countryCode) => set({ countryCode }),
}));
