import Link from "next/link";

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
  inverse = false,
}) {
  return (
    <div className="mb-4 lg:mb-6">
      <div className="flex items-end justify-between gap-3 lg:flex-row lg:gap-4">
        <div>
          <p
            className={`text-[11px] font-black uppercase lg:text-xs ${
              inverse ? "text-violet-200" : "text-brand"
            }`}
          >
            {eyebrow}
          </p>
          <h2
            className={`mt-1 text-[22px] font-black tracking-tight lg:text-[34px] ${
              inverse ? "text-white" : "text-ink"
            }`}
          >
            {title}
          </h2>
        </div>
        {href && linkLabel ? (
          <Link
            href={href}
            className={`inline-flex shrink-0 items-center gap-1 text-xs font-black lg:text-sm ${
              inverse ? "text-violet-100" : "text-brand"
            }`}
          >
            {linkLabel}
            <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>
      {description ? (
        <p
          className={`mt-1 text-[13px] leading-5 lg:text-sm ${
            inverse ? "text-violet-100" : "text-ink-muted"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
