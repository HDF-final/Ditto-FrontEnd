export function CourseDetailStats({
  spotCount = 0,
  floorLabel = "-",
  spotLabel = "스팟",
  floorLabelTitle = "층",
}) {
  return (
    <dl className="mt-4 grid grid-cols-2 gap-2 sm:gap-3 lg:mt-5 lg:max-w-sm">
      <div className="rounded-[12px] bg-surface-soft px-3 py-1.5 lg:rounded-[16px] lg:px-3 lg:py-3">
        <dt className="text-[10px] font-black text-brand lg:text-[11px]">{spotLabel}</dt>
        <dd className="mt-0.5 text-xs font-black text-ink sm:text-base lg:mt-1">
          {spotCount}
        </dd>
      </div>
      <div className="rounded-[12px] bg-surface-soft px-3 py-1.5 lg:rounded-[16px] lg:px-3 lg:py-3">
        <dt className="text-[10px] font-black text-brand lg:text-[11px]">{floorLabelTitle}</dt>
        <dd className="mt-0.5 truncate text-xs font-black text-ink sm:text-base lg:mt-1">
          {floorLabel}
        </dd>
      </div>
    </dl>
  );
}
