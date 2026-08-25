const PERIODS = [
  {
    key: "short7",
    label: "7일",
    caption: "단기",
    barClass: "bg-gradient-to-r from-[#6d3df5] to-[#9d74ff]",
    dotClass: "bg-[#6d3df5]",
  },
  {
    key: "medium30",
    label: "30일",
    caption: "중기",
    barClass: "bg-gradient-to-r from-[#3576e8] to-[#74adff]",
    dotClass: "bg-[#4d8df4]",
  },
  {
    key: "long90",
    label: "90일",
    caption: "장기",
    barClass: "bg-gradient-to-r from-[#18a88b] to-[#67d8be]",
    dotClass: "bg-[#22b395]",
  },
];

function normalizeScore(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.min(100, Math.max(0, number));
}

function formatScore(value) {
  if (value === null) return "-";
  return value.toFixed(value % 1 ? 1 : 0);
}

export function PeriodChartLegend() {
  return (
    <div
      className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-[#7d8396]"
      aria-label="기간별 차트 범례"
    >
      {PERIODS.map((period) => (
        <span key={period.key} className="inline-flex items-center gap-1.5">
          <span className={["size-2 rounded-full", period.dotClass].join(" ")} />
          {period.label} {period.caption}
        </span>
      ))}
    </div>
  );
}

export function PeriodScoreMiniChart({ scores, name }) {
  const values = PERIODS.map((period) => ({
    ...period,
    value: normalizeScore(scores?.[period.key]),
  }));
  const description = values
    .map((period) => period.label + " " + formatScore(period.value))
    .join(", ");

  return (
    <div
      className="flex h-7 shrink-0 items-end gap-1 rounded-lg bg-white px-2 py-1.5 shadow-[0_2px_8px_rgba(31,36,66,0.05)]"
      role="img"
      aria-label={(name || "아티스트") + " 기간별 관심도: " + description}
      title={description}
    >
      {values.map((period) => (
        <span
          key={period.key}
          className={["w-1.5 rounded-full", period.barClass].join(" ")}
          style={{ height: period.value === null ? "3px" : Math.max(3, period.value * 0.16) + "px" }}
        />
      ))}
    </div>
  );
}

export function PeriodScoreChart({ scores, name }) {
  const values = PERIODS.map((period) => ({
    ...period,
    value: normalizeScore(scores?.[period.key]),
  }));
  const description = values
    .map((period) => period.label + " " + formatScore(period.value))
    .join(", ");

  return (
    <div
      className="w-full min-w-[300px] max-w-[470px] space-y-2"
      role="img"
      aria-label={(name || "아티스트") + " 기간별 관심도: " + description}
    >
      {values.map((period) => (
        <div
          key={period.key}
          className="grid grid-cols-[42px_minmax(180px,1fr)_36px] items-center gap-2.5"
        >
          <span className="text-[11px] font-black text-[#697087]">{period.label}</span>
          <div className="relative h-2.5 overflow-hidden rounded-full bg-[#edf0f6]">
            <span className="absolute inset-y-0 left-1/4 w-px bg-white/80" aria-hidden="true" />
            <span className="absolute inset-y-0 left-1/2 w-px bg-white/80" aria-hidden="true" />
            <span className="absolute inset-y-0 left-3/4 w-px bg-white/80" aria-hidden="true" />
            {period.value !== null ? (
              <span
                className={[
                  "block h-full rounded-full shadow-[0_2px_8px_rgba(73,52,170,0.18)] transition-[width] duration-700 ease-out",
                  period.barClass,
                ].join(" ")}
                style={{ width: period.value + "%" }}
              />
            ) : null}
          </div>
          <span className="text-right text-[11px] font-black tabular-nums text-[#555c73]">
            {formatScore(period.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
