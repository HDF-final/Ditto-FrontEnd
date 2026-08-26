import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = await readFile(
  path.join(root, "src/lib/admin/youtube-ranking.js"),
  "utf8",
);
const {
  buildYoutubeOverallRows,
  rankMovement,
  rankMovementLabel,
} = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
);

test("country ranking movement exposes the exact numeric change", () => {
  assert.deepEqual(rankMovement({ rankChange: 3 }), {
    value: 3,
    source: "direct",
    count: 1,
  });
  assert.equal(rankMovementLabel({ rankChange: 3 }), "▲ 3");
  assert.equal(rankMovementLabel({ rankChange: -2 }), "▼ 2");
  assert.equal(rankMovementLabel({ rankChange: 0 }), "― 0");
});

test("overall ranking movement uses only observed market changes", () => {
  const item = {
    marketMovements: {
      KR: { rankChange: 4 },
      JP: { rankChange: -1 },
      US: { rankChange: null },
    },
  };
  assert.deepEqual(rankMovement(item), {
    value: 3,
    source: "market-net",
    count: 2,
  });
  assert.equal(rankMovementLabel(item), "▲ 3");
});

test("missing movement remains unavailable instead of becoming zero", () => {
  assert.deepEqual(rankMovement({}), {
    value: null,
    source: "unavailable",
    count: 0,
  });
  assert.equal(rankMovementLabel({}), "—");
});

test("new and reentry states remain explicit", () => {
  assert.equal(rankMovementLabel({ dailyCategory: "new" }), "NEW");
  assert.equal(rankMovementLabel({ dailyCategory: "reentry" }), "재진입");
});

test("overall fallback averages only valid market signals and ranks them", () => {
  const rows = buildYoutubeOverallRows({
    countries: {
      KR: [
        { qid: "Q1", name: "Alpha", breakoutScore: 100 },
        { qid: "Q2", name: "Beta", breakoutScore: 60 },
      ],
      JP: [
        { qid: "Q1", name: "Alpha", breakoutScore: 80 },
        { qid: "Q2", name: "Beta", breakoutScore: null },
      ],
      US: [
        { qid: "Q2", name: "Beta", breakoutScore: 100 },
      ],
    },
  });

  assert.deepEqual(rows.map((item) => item.qid), ["Q1", "Q2"]);
  assert.equal(rows[0].breakoutScore, 90);
  assert.equal(rows[0].marketCount, 2);
  assert.equal(rows[1].breakoutScore, 80);
  assert.equal(rows[1].marketCount, 2);
  assert.deepEqual(rows.map((item) => item.ranking), [1, 2]);
});
