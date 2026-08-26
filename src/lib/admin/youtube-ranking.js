const MARKET_CODES = ["KR", "JP", "US"];

function finiteNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function youtubeSignal(item) {
  return finiteNumber(item?.breakoutScore ?? item?.signalScore ?? item?.interestScore);
}

function overallKey(item) {
  return item?.qid || String(item?.nameKo || item?.name || "").trim().toLocaleLowerCase();
}

export function buildYoutubeOverallRows(payload) {
  if (Array.isArray(payload?.overall) && payload.overall.length) return payload.overall;

  const combined = new Map();
  MARKET_CODES.forEach((code) => {
    const rows = Array.isArray(payload?.countries?.[code]) ? payload.countries[code] : [];
    rows.forEach((item) => {
      const key = overallKey(item);
      const signal = youtubeSignal(item);
      if (!key || signal === null) return;

      const current = combined.get(key) || {
        ...item,
        marketScores: {},
        marketSignals: [],
      };
      current.marketScores[code] = signal;
      current.marketSignals.push(signal);
      combined.set(key, current);
    });
  });

  return [...combined.values()]
    .map((item) => {
      const breakoutScore = item.marketSignals.reduce((sum, value) => sum + value, 0) / item.marketSignals.length;
      const { marketSignals, ...rest } = item;
      return {
        ...rest,
        breakoutScore,
        interestScore: breakoutScore,
        marketCount: marketSignals.length,
      };
    })
    .sort((a, b) => {
      const scoreGap = Number(b.breakoutScore || 0) - Number(a.breakoutScore || 0);
      if (scoreGap !== 0) return scoreGap;
      const marketGap = Number(b.marketCount || 0) - Number(a.marketCount || 0);
      if (marketGap !== 0) return marketGap;
      return String(a.nameKo || a.name || "").localeCompare(String(b.nameKo || b.name || ""), "ko");
    })
    .slice(0, 10)
    .map((item, index) => ({ ...item, ranking: index + 1 }));
}

export function rankMovement(item) {
  const directChange = finiteNumber(item?.rankChange);
  if (directChange !== null) return { value: directChange, source: "direct", count: 1 };

  const changes = Object.values(item?.marketMovements || {})
    .map((movement) => finiteNumber(movement?.rankChange))
    .filter((value) => value !== null);

  if (!changes.length) return { value: null, source: "unavailable", count: 0 };

  return {
    value: changes.reduce((sum, value) => sum + value, 0),
    source: "market-net",
    count: changes.length,
  };
}

export function rankMovementLabel(item) {
  const category = item?.dailyCategory;
  if (category === "new") return "NEW";
  if (category === "reentry") return "재진입";

  const movement = rankMovement(item);
  if (movement.value === null) return "—";
  if (movement.value > 0) return `▲ ${movement.value}`;
  if (movement.value < 0) return `▼ ${Math.abs(movement.value)}`;
  return "― 0";
}
