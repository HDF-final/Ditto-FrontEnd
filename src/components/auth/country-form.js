"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authButtonClassName } from "@/components/auth/auth-shell";
import {
  COUNTRIES,
  DEFAULT_COUNTRY_CODE,
  DEFAULT_LANGUAGE_CODE,
  LANGUAGES,
  getDefaultLanguageForCountry,
  getCountryByCode,
} from "@/lib/fixtures/countries";
import { updateMyPreferences } from "@/lib/api/users";
import { useAuthStore } from "@/stores/use-auth-store";
import { usePreferenceStore } from "@/stores/use-preference-store";
import { useSignupStore } from "@/stores/use-signup-store";

export function CountryForm() {
  const router = useRouter();
  const storedCountryCode = usePreferenceStore((state) => state.countryCode);
  const storedLanguageCode = usePreferenceStore((state) => state.languageCode);
  const storedLanguageWasManuallySelected = usePreferenceStore(
    (state) => state.languageWasManuallySelected,
  );
  const hydratePreferences = usePreferenceStore(
    (state) => state.hydratePreferences,
  );
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setSignupDraft = useSignupStore((state) => state.setDraft);
  const signupDraft = useSignupStore((state) => state.draft);

  const [selectedCodeOverride, setSelectedCode] = useState(null);
  const [selectedLanguageOverride, setSelectedLanguage] = useState(null);
  const [languageWasManuallySelected, setLanguageWasManuallySelected] =
    useState(storedLanguageWasManuallySelected);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedCode =
    selectedCodeOverride ||
    (signupDraft.isSignedUp ? signupDraft.country : storedCountryCode) ||
    DEFAULT_COUNTRY_CODE;
  const selectedLanguage =
    selectedLanguageOverride ||
    (signupDraft.isSignedUp ? signupDraft.language : storedLanguageCode) ||
    DEFAULT_LANGUAGE_CODE;

  async function handleSubmit(event) {
    event.preventDefault();

    const selected = getCountryByCode(selectedCode);

    if (!selected) {
      setError("국가를 선택해 주세요.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      if (isAuthenticated) {
        await updateMyPreferences({
          countryCode: selected.code,
          languageCode: selectedLanguage,
        });
      }

      hydratePreferences({
        countryCode: selected.code,
        languageCode: selectedLanguage,
        languageWasManuallySelected,
      });
      setSignupDraft({
        country: selected.code,
        language: selectedLanguage,
      });
      router.push(`/persona?lang=${selectedLanguage}`);
    } catch (requestError) {
      setError(
        requestError?.message ||
          "국가·언어 설정을 저장하지 못했습니다. 다시 시도해주세요.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="flex flex-col gap-[22px]" onSubmit={handleSubmit} noValidate>
      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        role="radiogroup"
        aria-label="국가 선택"
      >
        {COUNTRIES.map((country) => {
          const selected = country.code === selectedCode;

          return (
            <button
              key={country.code}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={isLoading}
              onClick={() => {
                setSelectedCode(country.code);
                if (!languageWasManuallySelected) {
                  setSelectedLanguage(
                    getDefaultLanguageForCountry(country.code),
                  );
                }
                setError("");
              }}
              className={[
                "flex h-16 items-center gap-3 rounded-[14px] border-[1.5px] px-4 text-left",
                "font-sans transition-[border-color,background] duration-150",
                "hover:border-line-hover",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                selected ? "border-brand bg-brand-soft" : "border-line bg-white",
              ].join(" ")}
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-lg leading-none"
                aria-hidden="true"
              >
                {country.flag}
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-bold text-ink">
                  {country.name}
                </span>
                <span className="text-xs font-normal text-ink-muted">
                  {country.language}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-bold text-ink">
          사용할 언어를 선택해 주세요
        </legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {LANGUAGES.map((language) => {
            const selected = language.code === selectedLanguage;
            return (
              <button
                key={language.code}
                type="button"
                aria-pressed={selected}
                disabled={isLoading}
                onClick={() => {
                  setSelectedLanguage(language.code);
                  setLanguageWasManuallySelected(true);
                  setError("");
                }}
                className={[
                  "rounded-[14px] border-[1.5px] px-3 py-3 text-center text-sm font-bold transition",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                  selected
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-line bg-white text-ink hover:border-line-hover",
                ].join(" ")}
              >
                <span className="block">{language.nativeName}</span>
                <span className="mt-0.5 block text-[10px] font-medium text-ink-muted">
                  {language.name}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {error ? (
        <p className="text-center text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className={authButtonClassName()}
      >
        {isLoading ? "저장 중..." : "계속하기"}{" "}
        {!isLoading ? <span aria-hidden="true">→</span> : null}
      </button>
    </form>
  );
}
