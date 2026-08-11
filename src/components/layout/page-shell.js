export function PageShell({ children, className = "" }) {
  return (
    <main
      className={["mx-auto w-full max-w-7xl px-5 py-12 lg:px-8 lg:py-16", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </main>
  );
}

export function PageSection({
  children,
  className = "",
  bleed = false,
  ...props
}) {
  const baseClassName = bleed
    ? "border-y border-line bg-surface"
    : "mx-auto w-full max-w-7xl px-5 py-16 lg:px-8";

  return (
    <section className={[baseClassName, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </section>
  );
}

export function SectionInner({ children, className = "" }) {
  return (
    <div
      className={["mx-auto w-full max-w-7xl px-5 py-16 lg:px-8", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "start",
  action,
  className = "",
}) {
  const centered = align === "center";

  return (
    <div
      className={[
        "flex flex-col gap-4",
        centered ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div>
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-3 text-3xl font-black tracking-tight text-ink">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function ContentGrid({ children, className = "", columns = "four" }) {
  const columnClassName = {
    two: "md:grid-cols-2",
    three: "md:grid-cols-2 lg:grid-cols-3",
    four: "md:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div
      className={["mt-8 grid gap-4", columnClassName, className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
