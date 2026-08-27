import assert from "node:assert/strict";
import test from "node:test";

import { isCelebPhoto, toImageKey } from "../src/lib/courses/hero-image.js";

// 어드민 자리 목록이 실제로 주는 모양이다. 1~3번은 셀럽 사진, 4~5번은 매장 사진 —
// 코스 186(아이유)에서 그대로 뽑았다.
const SLOTS = [
  {
    placeId: 60,
    visitOrder: 1,
    name: "구찌",
    imageKey: "course/CELE298C/1.jpg",
    imageUrl: "https://hdf-ditto-images.s3.ap-northeast-2.amazonaws.com/course/CELE298C/1.jpg",
  },
  {
    placeId: 27,
    visitOrder: 4,
    name: "스타벅스 리저브",
    imageKey: "place-picture/27_스타벅스 리저브.jpg",
    imageUrl:
      "https://d1bxld598du04o.cloudfront.net/place-picture/27_%EC%8A%A4%ED%83%80%EB%B2%85%EC%8A%A4%20%EB%A6%AC%EC%A0%80%EB%B8%8C.jpg",
  },
];

test("셀럽 사진은 course/ 로 가른다", () => {
  assert.equal(isCelebPhoto("course/CELE298C/1.jpg"), true);
  assert.equal(isCelebPhoto("place-picture/60_구찌.jpg"), false);
  assert.equal(isCelebPhoto(null), false);
  assert.equal(isCelebPhoto(""), false);
});

test("키를 넣으면 키 그대로 나온다", () => {
  const { key, error } = toImageKey("course/CELE298C/1.jpg", SLOTS);
  assert.equal(key, "course/CELE298C/1.jpg");
  assert.equal(error, null);
});

test("버킷 주소에서 키만 떼어 낸다", () => {
  const { key, error } = toImageKey(SLOTS[0].imageUrl, SLOTS);
  assert.equal(key, "course/CELE298C/1.jpg");
  assert.equal(error, null);
});

test("CDN 주소도 받고 퍼센트 인코딩을 푼다", () => {
  // 어드민 썸네일이 CDN 주소라, 관리자가 이미지 주소를 복사해 붙이면 이 모양이 온다.
  const { key, error } = toImageKey(SLOTS[1].imageUrl, SLOTS);
  assert.equal(key, "place-picture/27_스타벅스 리저브.jpg");
  assert.equal(error, null);
});

test("남의 주소는 거부하고 무엇을 해야 하는지 알려 준다", () => {
  const { key, error } = toImageKey("https://cdn.sisunnews.co.kr/a.jpg", SLOTS);
  assert.equal(key, "");
  assert.match(error, /승인 화면/);
});

test("빈 값은 기본값으로 돌아간다 — 오류가 아니다", () => {
  assert.deepEqual(toImageKey("", SLOTS), { key: "", error: null });
  assert.deepEqual(toImageKey("   ", SLOTS), { key: "", error: null });
});

test("주소가 아닌데 주소처럼 생긴 것은 오류로 알려 준다", () => {
  const { key, error } = toImageKey("https://", SLOTS);
  assert.equal(key, "");
  assert.ok(error);
});
