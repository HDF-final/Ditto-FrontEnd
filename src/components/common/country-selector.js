"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { COUNTRIES, LANGUAGES } from "@/lib/fixtures/countries";
import {
  getPreferencesAfterCountryChange,
  normalizePreferences,
} from "@/lib/preferences/preference-policy";
import { updateMyPreferences } from "@/lib/api/users";
import { useAuthStore } from "@/stores/use-auth-store";
import { usePreferenceStore } from "@/stores/use-preference-store";

export function CountrySelector({ showCountry = true, variant = "default" }) {
  const router = useRouter();
  const t = useTranslations("preferences");
  const countryCode = usePreferenceStore((state) => state.countryCode);
  const languageCode = usePreferenceStore((state) => state.languageCode);
  const languageWasManuallySelected = usePreferenceStore(
    (state) => state.languageWasManuallySelected,
  );
  const setCountryCode = usePreferenceStore((state) => state.setCountryCode);
  const setLanguageCode = usePreferenceStore((state) => state.setLanguageCode);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function savePreferences(nextPreferences, commit) {
    setIsSaving(true);
    setError("");

    try {
      if (isAuthenticated) {
        await updateMyPreferences(nextPreferences);
      }
      commit();
      router.refresh();
    } catch (requestError) {
      setError(requestError?.message || t("saveError"));
    } finally {
      setIsSaving(false);
    }
  }

  const currentPreferences = {
    countryCode,
    languageCode,
    languageWasManuallySelected,
  };
  const languageSelectClassName =
    variant === "profile"
      ? "w-full rounded-xl border border-line bg-surface-soft px-4 py-3 text-sm font-bold text-ink outline-none transition focus:border-brand focus:bg-white"
      : "max-w-28 rounded-full border border-line bg-white px-2.5 py-2 font-bold text-ink outline-none transition focus:border-brand";

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
      {showCountry ? (
        <label>
          <span className="sr-only">{t("countryLabel")}</span>
          <select
            className="max-w-32 rounded-full border border-line bg-white px-2.5 py-2 font-bold text-ink outline-none transition focus:border-brand"
            value={countryCode}
            disabled={isSaving}
            onChange={(event) => {
              const nextCountryCode = event.target.value;
              const nextPreferences = getPreferencesAfterCountryChange(
                currentPreferences,
                nextCountryCode,
              );
              savePreferences(nextPreferences, () =>
                setCountryCode(nextCountryCode),
              );
            }}
          >
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label>
        <span className="sr-only">{t("languageLabel")}</span>
        <select
          className={languageSelectClassName}
          value={languageCode}
          disabled={isSaving}
          onChange={(event) => {
            const nextLanguageCode = event.target.value;
            const nextPreferences = normalizePreferences(
              {
                languageCode: nextLanguageCode,
                languageWasManuallySelected: true,
              },
              currentPreferences,
            );
            savePreferences(nextPreferences, () =>
              setLanguageCode(nextLanguageCode),
            );
          }}
        >
          {LANGUAGES.map((language) => (
            <option key={language.code} value={language.code}>
              {language.nativeName}
            </option>
          ))}
        </select>
      </label>
      {error ? (
        <span className="basis-full text-xs font-medium text-danger" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
