"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { authButtonClassName } from "@/components/auth/auth-shell";
import { DEFAULT_PERSONA_ID } from "@/lib/fixtures/personas";
import { signup, login } from "@/lib/api/auth";
import { updateMyProfile } from "@/lib/api/users";
import { useSignupStore } from "@/stores/use-signup-store";
import { useAuthStore } from "@/stores/use-auth-store";

/**
 * Valid shopping type selection → updates preferences → home (`/`).
 */
const PERSONA_SUCCESS_HREF = "/";

export function PersonaForm({ copy }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const draft = useSignupStore((state) => state.draft);
  const resetDraft = useSignupStore((state) => state.resetDraft);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [selectedId, setSelectedId] = useState(draft.persona || DEFAULT_PERSONA_ID);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const selected = copy.personas.find((persona) => persona.id === selectedId);

    if (!selected) {
      setError(copy.selectError);
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // 1. If already signed up in step 1, update preference and finalize
      if (draft.isSignedUp) {
        await updateMyProfile({ persona: selectedId });
        if (user) {
          setUser({
            ...user,
            persona: selectedId,
            countryCode: draft.country || user.countryCode,
            preferredLanguageCode:
              draft.language || user.preferredLanguageCode,
          });
        }
        resetDraft();
        router.push(PERSONA_SUCCESS_HREF);
        return;
      }

      // 2. Fallback: If not signed up yet but has credentials
      if (draft.email && draft.password) {
        const signupPayload = {
          email: draft.email,
          password: draft.password,
          nickname: draft.nickname || "디또러버",
          country: draft.country || "KR",
          languageCode: draft.language || "ko",
          persona: selectedId,
          marketingAgreed: Boolean(draft.marketingAccepted),
        };

        await signup(signupPayload);

        try {
          const loginResult = await login({
            email: draft.email,
            password: draft.password,
          });
          if (loginResult) {
            setUser(loginResult);
          }
        } catch {
          // Signup success does not establish an authenticated session.
        }

        resetDraft();
        router.push(PERSONA_SUCCESS_HREF);
        return;
      }

      // 3. If direct access with no draft
      resetDraft();
      router.push(PERSONA_SUCCESS_HREF);
    } catch (err) {
      setError(
        err?.message || t("finishSignupError"),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="flex flex-col gap-[22px]" onSubmit={handleSubmit} noValidate>
      <div
        className="grid grid-cols-1 gap-3.5"
        role="radiogroup"
        aria-label={copy.title}
      >
        {copy.personas.map((persona) => {
          const selected = persona.id === selectedId;

          return (
            <button
              key={persona.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={isLoading}
              onClick={() => {
                setSelectedId(persona.id);
                setError("");
              }}
              className={[
                "flex items-center gap-3.5 overflow-visible rounded-2xl border-0 p-4 text-left cursor-pointer",
                "font-sans transition-[background,transform] duration-150",
                "hover:-translate-y-0.5",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                selected ? "bg-brand-soft ring-2 ring-brand" : "bg-white",
              ].join(" ")}
            >
              <span className="relative flex size-[72px] shrink-0 items-center justify-center overflow-visible">
                <Image
                  src={persona.imageSrc}
                  alt=""
                  width={72}
                  height={72}
                  className="size-[72px] max-w-none object-contain"
                  unoptimized
                />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[15px] font-bold text-ink">
                  {persona.name}
                </span>
                <span className="text-[11px] font-bold tracking-[0.4px] text-brand">
                  {persona.nameEn}
                </span>
                <span className="text-xs leading-snug text-ink-muted">
                  {persona.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {error ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center text-xs font-medium text-red-600 animate-in fade-in"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <p className="-mt-1 text-center text-xs text-ink-subtle">{copy.hint}</p>

      <button
        type="submit"
        disabled={isLoading}
        className={authButtonClassName()}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            {t("finishingSignup")}
          </span>
        ) : (
          <>
            {copy.start} <span aria-hidden="true">→</span>
          </>
        )}
      </button>
    </form>
  );
}
