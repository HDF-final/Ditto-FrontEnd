"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LANGUAGES } from "@/lib/fixtures/countries";
import { updateMyPreferences } from "@/lib/api/users";
import { normalizePreferences } from "@/lib/preferences/preference-policy";
import { useAuthStore } from "@/stores/use-auth-store";
import { usePreferenceStore } from "@/stores/use-preference-store";

function GlobeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 lg:size-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.4 2.45 3.65 5.45 3.65 9S14.4 18.55 12 21c-2.4-2.45-3.65-5.45-3.65-9S9.6 5.45 12 3Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m4 10 3.5 3.5L16 5.5" />
    </svg>
  );
}

export function HeaderLanguageSwitcher() {
  const router = useRouter();
  const t = useTranslations("preferences");
  const menuId = useId();
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const countryCode = usePreferenceStore((state) => state.countryCode);
  const languageCode = usePreferenceStore((state) => state.languageCode);
  const languageWasManuallySelected = usePreferenceStore(
    (state) => state.languageWasManuallySelected,
  );
  const setLanguageCode = usePreferenceStore((state) => state.setLanguageCode);
  const hydratePreferences = usePreferenceStore(
    (state) => state.hydratePreferences,
  );
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const currentPreferences = {
    countryCode,
    languageCode,
    languageWasManuallySelected,
  };

  async function handleLanguageChange(nextLanguageCode) {
    if (
      isSaving ||
      (nextLanguageCode === languageCode && languageWasManuallySelected)
    ) {
      setIsOpen(false);
      return;
    }

    const nextPreferences = normalizePreferences(
      {
        languageCode: nextLanguageCode,
        languageWasManuallySelected: true,
      },
      currentPreferences,
    );

    setIsSaving(true);
    setError("");
    setLanguageCode(nextLanguageCode);
    setIsOpen(false);
    router.refresh();

    try {
      if (isAuthenticated) {
        await updateMyPreferences(nextPreferences);
      }
    } catch (requestError) {
      hydratePreferences(currentPreferences);
      setError(requestError?.message || t("saveError"));
      setIsOpen(true);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-label={t("languageLabel")}
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => {
          setError("");
          setIsOpen((open) => !open);
        }}
        className="inline-flex size-9 items-center justify-center rounded-full text-ink transition hover:bg-brand-soft hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-50 lg:size-11"
        disabled={isSaving}
      >
        <GlobeIcon />
      </button>

      {isOpen ? (
        <div
          id={menuId}
          aria-label={t("languageLabel")}
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-44 overflow-hidden rounded-2xl border border-line bg-white p-2 shadow-xl"
        >
          <p className="px-3 pb-2 pt-1 text-xs font-bold text-ink-muted">
            {t("languageLabel")}
          </p>
          <div className="grid gap-1">
            {LANGUAGES.map((language) => {
              const isSelected = language.code === languageCode;

              return (
                <button
                  key={language.code}
                  type="button"
                  aria-pressed={isSelected}
                  disabled={isSaving}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand disabled:cursor-wait ${
                    isSelected
                      ? "bg-brand-soft text-brand"
                      : "text-ink hover:bg-surface-soft"
                  }`}
                >
                  <span>{language.nativeName}</span>
                  {isSelected ? <CheckIcon /> : null}
                </button>
              );
            })}
          </div>
          {error ? (
            <p className="px-3 pb-1 pt-2 text-xs font-medium text-danger" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
