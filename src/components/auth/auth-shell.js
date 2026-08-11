import Link from "next/link";

export function AuthShell({ title, description, wide = false, children }) {
  return (
    <main className="bg-surface-soft px-5 py-12">
      <section
        className={[
          "mx-auto rounded-card border border-line bg-surface p-6 shadow-card sm:p-8",
          wide ? "max-w-4xl" : "max-w-md",
        ].join(" ")}
      >
        <Link href="/" className="text-sm font-black text-brand">
          DITTO
        </Link>
        <div className="mt-6">
          <h1 className="text-3xl font-black text-ink">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-ink-muted">{description}</p>
        </div>
        <div className="mt-7">{children}</div>
      </section>
    </main>
  );
}
