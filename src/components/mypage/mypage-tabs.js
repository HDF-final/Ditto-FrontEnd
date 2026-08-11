export function MypageTabs({ tabs }) {
  return (
    <div className="mb-6 flex gap-2 border-b border-line">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          type="button"
          className={[
            "-mb-px border-b-2 px-4 py-3 text-sm font-black transition",
            tab.active
              ? "border-brand text-brand"
              : "border-transparent text-ink-muted hover:text-ink",
          ].join(" ")}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
