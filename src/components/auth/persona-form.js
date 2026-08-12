"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authButtonClassName } from "@/components/auth/auth-shell";
import { DEFAULT_PERSONA_ID } from "@/lib/fixtures/personas";

/**
 * Temporary success policy (UI-only):
 * selected shopping type → navigate to home (`/`).
 * Selection is not written to browser storage or a fake session.
 */
const PERSONA_SUCCESS_HREF = "/";

export function PersonaForm({ copy }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(DEFAULT_PERSONA_ID);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const selected = copy.personas.find((persona) => persona.id === selectedId);

    if (!selected) {
      setError(copy.selectError);
      return;
    }

    setError("");
    router.push(PERSONA_SUCCESS_HREF);
  }

  return (
    <form className="flex flex-col gap-[22px]" onSubmit={handleSubmit} noValidate>
      <div
        className="grid grid-cols-1 gap-3.5 sm:grid-cols-2"
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
              onClick={() => {
                setSelectedId(persona.id);
                setError("");
              }}
              className={[
                "flex items-center gap-3.5 overflow-visible rounded-2xl border-0 p-4 text-left",
                "font-sans transition-[background,transform] duration-150",
                "hover:-translate-y-0.5",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                selected ? "bg-brand-soft" : "bg-white",
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
        <p className="text-center text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <p className="-mt-1 text-center text-xs text-ink-subtle">{copy.hint}</p>

      <button type="submit" className={authButtonClassName()}>
        {copy.start} <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
