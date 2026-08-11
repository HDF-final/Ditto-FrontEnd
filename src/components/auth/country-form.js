"use client";

import Link from "next/link";

import { countries } from "@/lib/fixtures/countries";
import { usePreferenceStore } from "@/stores/use-preference-store";

export function CountryForm() {
  const countryCode = usePreferenceStore((state) => state.countryCode);
  const setCountryCode = usePreferenceStore((state) => state.setCountryCode);
  const selected = countries.find((country) => country.code === countryCode) ?? countries[0];

  return (
    <div className="grid gap-5 md:grid-cols-[1fr_280px]">
      <div className="grid gap-3 sm:grid-cols-3">
        {countries.map((country) => (
          <button
            key={country.code}
            type="button"
            onClick={() => setCountryCode(country.code)}
            className={[
              "rounded-card border p-5 text-left transition",
              country.code === countryCode
                ? "border-brand bg-brand-soft text-brand"
                : "border-line bg-white text-ink hover:border-line-strong",
            ].join(" ")}
          >
            <span className="text-2xl">{country.flag}</span>
            <span className="mt-4 block text-base font-black">{country.name}</span>
            <span className="mt-1 block text-xs font-semibold text-ink-muted">
              {country.languageLabel}
            </span>
          </button>
        ))}
      </div>
      <aside className="rounded-card bg-surface-soft p-5">
        <p className="text-sm font-bold text-ink">{selected.name} 기준</p>
        <p className="mt-2 text-sm leading-6 text-ink-muted">{selected.description}</p>
        <Link
          href={`/persona?lang=${selected.lang}`}
          className="mt-5 inline-flex w-full items-center justify-center rounded-control bg-brand px-4 py-3 text-sm font-bold text-white shadow-control transition hover:bg-brand-dark"
        >
          다음
        </Link>
      </aside>
    </div>
  );
}
