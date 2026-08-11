export function TopCourseChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "flex-none whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-bold transition",
        active
          ? "bg-brand text-white shadow-control"
          : "bg-brand-soft text-brand hover:bg-brand-soft/70",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
