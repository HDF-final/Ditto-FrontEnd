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
    <div className="mb-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p
            className={`text-xs font-black uppercase ${
              inverse ? "text-violet-200" : "text-brand"
            }`}
          >
            {eyebrow}
          </p>
          <h2
            className={`mt-1 text-[30px] font-black tracking-tight sm:text-[34px] ${
              inverse ? "text-white" : "text-ink"
            }`}
          >
            {title}
          </h2>
        </div>
        {href && linkLabel ? (
          <Link
            href={href}
            className={`inline-flex shrink-0 items-center gap-1 text-sm font-black ${
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
          className={`mt-1 text-sm ${
            inverse ? "text-violet-100" : "text-ink-muted"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
