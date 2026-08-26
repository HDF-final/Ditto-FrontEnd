export function CourseDetailStats({
  spotCount = 0,
  floorLabel = "-",
  spotLabel = "스팟",
  floorLabelTitle = "층",
}) {
  return (
    <dl className="mt-5 grid grid-cols-2 gap-2 sm:gap-3 lg:max-w-sm">
      <div className="rounded-[16px] bg-surface-soft px-3 py-3">
        <dt className="text-[11px] font-black text-brand">{spotLabel}</dt>
        <dd className="mt-1 text-sm font-black text-ink sm:text-base">
          {spotCount}
        </dd>
      </div>
      <div className="rounded-[16px] bg-surface-soft px-3 py-3">
        <dt className="text-[11px] font-black text-brand">{floorLabelTitle}</dt>
        <dd className="mt-1 truncate text-sm font-black text-ink sm:text-base">
          {floorLabel}
        </dd>
      </div>
    </dl>
  );
}
