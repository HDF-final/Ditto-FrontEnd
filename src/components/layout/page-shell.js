export const appPadClassName = "px-5 lg:px-52 xl:px-60 2xl:px-72";
export const appSectionClassName = "px-5 py-8 lg:px-52 lg:py-16 xl:px-60 2xl:px-72";

export function PageShell({ children, className = "" }) {
  return (
    <main
      className={[
        "w-full px-5 py-8 lg:mx-auto lg:max-w-7xl lg:px-52 lg:py-16 xl:px-60 2xl:px-72",
        className,
      ]
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
    : "w-full px-5 py-8 lg:mx-auto lg:max-w-7xl lg:px-52 lg:py-[72px] xl:px-60 2xl:px-72";

  return (
    <section className={[baseClassName, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </section>
  );
}

export function SectionInner({ children, className = "" }) {
  return (
    <div
      className={[
        "w-full px-5 py-8 lg:mx-auto lg:max-w-7xl lg:px-52 lg:py-[72px] xl:px-60 2xl:px-72",
        className,
      ]
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
        "flex flex-col gap-3 lg:gap-4",
        centered
          ? "items-center text-center"
          : "lg:flex-row lg:items-end lg:justify-between",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand lg:text-xs lg:tracking-[0.2em]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1.5 text-[22px] font-black tracking-tight text-ink lg:mt-3 lg:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-ink-muted lg:mt-3 lg:max-w-2xl lg:text-base">
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
    two: "lg:grid-cols-2",
    three: "lg:grid-cols-3",
    four: "lg:grid-cols-4",
  }[columns];

  return (
    <div
      className={["mt-5 grid gap-3 lg:mt-8 lg:gap-4", columnClassName, className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
