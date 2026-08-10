import { create } from "zustand";

const localeByCountry = {
  US: "en",
  JP: "ja",
  CN: "zh-CN",
};

export const usePreferenceStore = create((set) => ({
  countryCode: "US",
  locale: localeByCountry.US,
  setCountryCode: (countryCode) =>
    set({
      countryCode,
      locale: localeByCountry[countryCode] ?? localeByCountry.US,
    }),
}));
