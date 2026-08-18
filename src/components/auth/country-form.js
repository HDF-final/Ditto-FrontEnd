"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authButtonClassName } from "@/components/auth/auth-shell";
import {
  COUNTRIES,
  DEFAULT_COUNTRY_CODE,
  getCountryByCode,
} from "@/lib/fixtures/countries";
import { usePreferenceStore } from "@/stores/use-preference-store";
import { useSignupStore } from "@/stores/use-signup-store";

export function CountryForm() {
  const router = useRouter();
  const storedCountryCode = usePreferenceStore((state) => state.countryCode);
  const setCountryCode = usePreferenceStore((state) => state.setCountryCode);
  const setSignupDraft = useSignupStore((state) => state.setDraft);
  const signupCountry = useSignupStore((state) => state.draft.country);

  const [selectedCode, setSelectedCode] = useState(
    () => signupCountry || storedCountryCode || DEFAULT_COUNTRY_CODE,
  );
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const selected = getCountryByCode(selectedCode);

    if (!selected) {
      setError("국가를 선택해 주세요.");
      return;
    }

    setError("");
    setCountryCode(selected.code);
    setSignupDraft({ country: selected.code });
    router.push(`/persona?lang=${selected.lang}`);
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
              onClick={() => {
                setSelectedCode(country.code);
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

      {error ? (
        <p className="text-center text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className={authButtonClassName()}>
        계속하기 <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
