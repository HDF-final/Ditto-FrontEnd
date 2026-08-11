"use client";

import Link from "next/link";
import { useState } from "react";

export function PersonaForm({ copy }) {
  const [selectedId, setSelectedId] = useState(copy.personas[0]?.id);

  return (
    <div className="grid gap-5 md:grid-cols-[1fr_280px]">
      <div className="grid gap-3 sm:grid-cols-3">
        {copy.personas.map((persona) => (
          <button
            key={persona.id}
            type="button"
            onClick={() => setSelectedId(persona.id)}
            className={[
              "rounded-card border bg-white p-5 text-left transition",
              selectedId === persona.id
                ? "border-brand shadow-card"
                : "border-line hover:border-line-strong",
            ].join(" ")}
          >
            <span className="text-3xl">{persona.icon}</span>
            <span className="mt-4 block text-base font-black text-ink">
              {persona.name}
            </span>
            <span className="mt-2 block text-sm leading-6 text-ink-muted">
              {persona.description}
            </span>
          </button>
        ))}
      </div>
      <aside className="rounded-card bg-surface-soft p-5">
        <p className="text-sm font-bold text-ink">{copy.helperTitle}</p>
        <p className="mt-2 text-sm leading-6 text-ink-muted">{copy.helperText}</p>
        <Link
          href="/ai-course"
          className="mt-5 inline-flex w-full items-center justify-center rounded-control bg-brand px-4 py-3 text-sm font-bold text-white shadow-control transition hover:bg-brand-dark"
        >
          {copy.cta}
        </Link>
      </aside>
    </div>
  );
}
