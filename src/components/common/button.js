import Link from "next/link";

const variants = {
  primary:
    "bg-brand text-white shadow-control hover:bg-brand-dark focus-visible:outline-brand",
  secondary:
    "border border-brand bg-white text-brand hover:bg-brand-soft focus-visible:outline-brand",
  neutral:
    "border border-line bg-white text-ink hover:border-line-strong hover:bg-surface-soft",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-3.5 text-base",
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  className = "",
} = {}) {
  return [
    "inline-flex min-h-10 items-center justify-center rounded-control font-bold transition",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  return (
    <Link
      href={href}
      className={buttonClassName({ variant, size, className })}
      {...props}
    >
      {children}
    </Link>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      className={buttonClassName({ variant, size, className })}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
