function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[11px]">
      <polyline
        points="20 6 9 17 4 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Circular consent checkbox styled like the HTML mock.
 */
export function TermsCheckbox({
  id,
  name,
  checked,
  onChange,
  children,
  required = false,
  error = "",
}) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className="flex cursor-pointer select-none items-center gap-2.5 text-xs text-ink-muted"
      >
        <span className="relative inline-flex shrink-0">
          <input
            id={id}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className="peer absolute size-0 opacity-0"
          />
          <span
            className={[
              "flex size-[18px] items-center justify-center rounded-full border-[1.5px] text-white",
              "transition-[background,border-color] duration-150",
              "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand",
              checked
                ? "border-brand bg-brand"
                : error
                  ? "border-danger bg-white"
                  : "border-line bg-white",
            ].join(" ")}
            aria-hidden="true"
          >
            <span className={checked ? "opacity-100" : "opacity-0"}>
              <CheckIcon />
            </span>
          </span>
        </span>
        <span>{children}</span>
      </label>
      {error ? (
        <p
          id={`${id}-error`}
          className="mt-1.5 pl-7 text-xs font-medium text-danger"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
