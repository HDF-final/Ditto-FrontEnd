"use client";

import { useState } from "react";
import { COUNTRIES, LANGUAGES } from "@/lib/fixtures/countries";
import { updateMyPreferences } from "@/lib/api/users";
import { useAuthStore } from "@/stores/use-auth-store";
import { usePreferenceStore } from "@/stores/use-preference-store";

export function CountrySelector() {
  const countryCode = usePreferenceStore((state) => state.countryCode);
  const languageCode = usePreferenceStore((state) => state.languageCode);
  const setPreferences = usePreferenceStore((state) => state.setPreferences);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function savePreferences(nextPreferences) {
    setIsSaving(true);
    setError("");

    try {
      if (isAuthenticated) {
        await updateMyPreferences(nextPreferences);
      }
      setPreferences(nextPreferences);
    } catch (requestError) {
      setError(requestError?.message || "환경설정을 저장하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
      <label>
        <span className="sr-only">서비스 국가 선택</span>
        <select
          className="rounded-full border border-line bg-white px-3 py-2 font-medium text-ink outline-none transition focus:border-brand"
          value={countryCode}
          disabled={isSaving}
          onChange={(event) =>
            savePreferences({
              countryCode: event.target.value,
              languageCode,
            })
          }
        >
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.flag} {country.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="sr-only">화면 언어 선택</span>
        <select
          className="rounded-full border border-line bg-white px-3 py-2 font-medium text-ink outline-none transition focus:border-brand"
          value={languageCode}
          disabled={isSaving}
          onChange={(event) =>
            savePreferences({
              countryCode,
              languageCode: event.target.value,
            })
          }
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
