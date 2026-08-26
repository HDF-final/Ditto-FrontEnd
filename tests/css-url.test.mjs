import assert from "node:assert/strict";
import test from "node:test";

import { cssUrl } from "../src/lib/courses/css-url.js";

// 기본 추천 코스 목록 카드가 이 주소로 비었다. 버킷의 실제 파일명이다.
const WITH_SPACE =
  "https://d1bxld598du04o.cloudfront.net/place-picture/63_크리스챤 디올.jpg";

test("공백이 든 주소를 인코딩해 따옴표로 감싼다", () => {
  const value = cssUrl(WITH_SPACE);

  // 공백이 남으면 따옴표가 있어도 주소 자체가 안 열린다.
  assert.ok(!value.includes(" "), `공백이 남았다: ${value}`);
  assert.ok(value.startsWith('url("') && value.endsWith('")'));
  assert.ok(value.includes("%20"));
});

test("이미 인코딩된 주소를 두 번 인코딩하지 않는다", () => {
  const encoded =
    "https://d1bxld598du04o.cloudfront.net/place-picture/63_%EB%94%94%EC%98%AC.jpg";

  assert.equal(cssUrl(encoded), `url("${encoded}")`);
  assert.ok(!cssUrl(encoded).includes("%25"));
});

test("슬래시와 콜론은 살린다 — 인코딩하면 주소가 아니게 된다", () => {
  const value = cssUrl("https://cdn.test/a/b/c.jpg");

  assert.equal(value, 'url("https://cdn.test/a/b/c.jpg")');
});

test("우리 자산의 상대 경로도 그대로 쓴다", () => {
  assert.equal(
    cssUrl("/assets/community/default-course-1.png"),
    'url("/assets/community/default-course-1.png")',
  );
});

test("따옴표가 든 주소가 값 밖으로 새지 않는다", () => {
  const value = cssUrl('https://cdn.test/a".jpg');

  // encodeURI 가 따옴표를 %22 로 바꾸므로 값 안에 남지 않는다.
  assert.ok(!/[^\\]"/.test(value.slice(5, -2)), `따옴표가 샜다: ${value}`);
});

test("빈 값은 undefined — 스타일을 아예 안 건다", () => {
  assert.equal(cssUrl(""), undefined);
  assert.equal(cssUrl("   "), undefined);
  assert.equal(cssUrl(null), undefined);
  assert.equal(cssUrl(undefined), undefined);
});
