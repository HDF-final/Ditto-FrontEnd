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
    <div className="mb-5 lg:mb-6">
      <div className="flex flex-col items-start gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
        <div className="min-w-0">
          <p
            className={`text-[11px] font-black uppercase lg:text-xs ${
              inverse ? "text-violet-200" : "text-brand"
            }`}
          >
            {eyebrow}
          </p>
          <h2
            className={`mt-2 whitespace-nowrap text-[22px] font-black leading-[1.32] tracking-normal lg:mt-1 lg:text-[34px] lg:leading-tight lg:tracking-tight ${
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
          className={`mt-3 text-[13px] leading-6 lg:mt-1 lg:text-sm lg:leading-5 ${
            inverse ? "text-violet-100" : "text-ink-muted"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
