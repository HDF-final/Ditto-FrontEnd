import Image from "next/image";
import Link from "next/link";

/**
 * Shared auth card shell matching the HTML mock
 * (login / signup / country / persona).
 * Full-page lavender canvas + centered white card.
 */
export function AuthShell({
  title,
  description,
  children,
  footer,
  wide = false,
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-auth-canvas px-4 py-8 lg:min-h-screen lg:px-6 lg:py-12">
      <div
        className={[
          "flex w-full flex-col gap-[22px]",
          wide ? "max-w-[640px]" : "max-w-[480px]",
          "rounded-[24px] bg-white px-5 py-8 shadow-[0_24px_60px_rgba(43,28,89,0.10)]",
          "lg:rounded-[28px] lg:px-[61px] lg:py-14",
        ].join(" ")}
      >
        <Link
          href="/"
          className="flex flex-col items-center gap-1.5 no-underline"
        >
          <Image
            src="/assets/common/ditto-logo.svg"
            alt="DITTO"
            width={140}
            height={44}
            priority
            style={{ width: "auto", height: "auto" }}
          />
          <span className="text-[10px] font-semibold tracking-[0.4px] text-ink-muted">
            K-CULTURE SHOPPING MATE
          </span>
        </Link>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-[22px] font-bold leading-tight text-ink lg:text-[28px]">
            {title}
          </h1>
          {description ? (
            <p className="text-[13px] font-normal text-ink-muted">
              {description}
            </p>
          ) : null}
        </div>
        {children}
        {footer}
      </div>
    </main>
  );
}

export function authInputClassName(hasError = false) {
  return [
    "h-[47px] w-full rounded-xl border bg-white px-4 text-sm text-ink",
    "placeholder:text-ink-subtle",
    "transition-[border-color,box-shadow] duration-150",
    "focus:outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(92,46,245,0.12)]",
    hasError ? "border-danger" : "border-line",
  ].join(" ");
}

export function authButtonClassName() {
  return [
    "inline-flex h-[45px] w-full items-center justify-center gap-2",
    "rounded-full bg-brand text-[15px] font-bold text-white",
    "transition-[background,transform] duration-150",
    "hover:bg-brand-dark active:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
  ].join(" ");
}

export function AuthFieldError({ id, message }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="mt-1.5 text-xs font-medium text-danger" role="alert">
      {message}
    </p>
  );
}

export function AuthAltLink({ prompt, href, label }) {
  return (
    <p className="text-center text-[13px] text-ink-muted">
      {prompt}
      <Link
        href={href}
        className="ml-1.5 font-bold text-brand no-underline hover:underline"
      >
        {label}
      </Link>
    </p>
  );
}
