import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { STORE_CATEGORY_BY_NAVIGATION_KEY } from "../src/lib/navigation/store-categories.js";
import {
  PLACE_CATEGORY_FILTERS,
  PLACE_CATEGORY_STYLES,
  resolvePlaceCategory,
} from "../src/lib/navigation/place-category.js";

const ledger = JSON.parse(
  readFileSync(
    new URL("../public/navigation/v2/store-navigation-keys.json", import.meta.url),
  ),
);

test("모든 매장이 분류표에 있고, 분류표에 유령 키가 없다", () => {
  const ledgerKeys = new Set(ledger.map((record) => record.navigation_key));
  const tableKeys = new Set(Object.keys(STORE_CATEGORY_BY_NAVIGATION_KEY));

  assert.equal(ledgerKeys.size, 147);
  assert.deepEqual(
    [...ledgerKeys].filter((key) => !tableKeys.has(key)),
    [],
    "분류표에 빠진 매장이 있습니다",
  );
  assert.deepEqual(
    [...tableKeys].filter((key) => !ledgerKeys.has(key)),
    [],
    "원장에 없는 키가 분류표에 남아 있습니다",
  );
});

test("분류표의 모든 카테고리에 태그 색이 정의돼 있다", () => {
  for (const category of new Set(
    Object.values(STORE_CATEGORY_BY_NAVIGATION_KEY),
  )) {
    assert.ok(
      PLACE_CATEGORY_STYLES[category],
      `${category} 카테고리에 색이 없어 회색 폴백으로 떨어집니다`,
    );
    assert.ok(
      PLACE_CATEGORY_FILTERS.includes(category),
      `${category} 카테고리를 장소 추가 모달에서 고를 수 없습니다`,
    );
  }
});

test("필터 칩은 실제로 결과가 나오는 카테고리만 노출한다", () => {
  const present = new Set(Object.values(STORE_CATEGORY_BY_NAVIGATION_KEY));
  for (const category of PLACE_CATEGORY_FILTERS) {
    assert.ok(present.has(category), `${category} 칩은 항상 빈 목록이 됩니다`);
  }
});

test("서버 카테고리가 로컬 분류표보다 우선한다", () => {
  const key = "B1_STORE_0060"; // 여왕떡볶이
  assert.equal(STORE_CATEGORY_BY_NAVIGATION_KEY[key], "음식점");

  const fromServer = resolvePlaceCategory("카페", { placeName: "여왕떡볶이" });
  assert.equal(fromServer.category, "카페");
  assert.equal(fromServer.categoryStyle, PLACE_CATEGORY_STYLES.카페.categoryStyle);
});

test("카테고리별로 태그 색이 서로 다르다", () => {
  const styles = PLACE_CATEGORY_FILTERS.map(
    (category) => PLACE_CATEGORY_STYLES[category].categoryStyle,
  );
  assert.equal(new Set(styles).size, styles.length, "같은 색을 쓰는 카테고리가 있습니다");
});

test("카테고리가 비어도 이름이 팝업이면 팝업으로 본다", () => {
  assert.equal(
    resolvePlaceCategory(null, { placeName: "지하 2층 팝업 동쪽" }).category,
    "팝업",
  );
  assert.equal(resolvePlaceCategory(null, { placeName: "MLB" }).category, "매장");
});

test("모르는 카테고리가 와도 태그가 깨지지 않는다", () => {
  const unknown = resolvePlaceCategory("잡화", { placeName: "다이소" });
  assert.equal(unknown.category, "잡화");
  assert.ok(unknown.categoryStyle);
  assert.ok(unknown.accentColor);
});
