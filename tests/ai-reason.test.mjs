import assert from "node:assert/strict";
import test from "node:test";

import { splitAiReason } from "../src/lib/courses/ai-reason.js";

// 챗 람다(chat/session.py)가 실제로 이어 붙이는 문장이다.
const NOTICE = " ! 해당 관련 기사는 찾았지만 적합한 이미지를 불러오지 못했습니다.";

test("이유 끝에 붙은 사진 알림을 떼어 낸다", () => {
  const { reason, notice } = splitAiReason(
    "「찬미나, 샤넬 뷰티 앰배서더 발탁」 기사에서 확인했습니다." + NOTICE,
  );

  assert.equal(reason, "「찬미나, 샤넬 뷰티 앰배서더 발탁」 기사에서 확인했습니다.");
  assert.equal(notice, "해당 관련 기사는 찾았지만 적합한 이미지를 불러오지 못했습니다.");
});

test("알림이 없으면 이유를 그대로 둔다", () => {
  const { reason, notice } = splitAiReason("쇼핑 중 쉬어 가실 수 있는 공간으로 담았습니다.");

  assert.equal(reason, "쇼핑 중 쉬어 가실 수 있는 공간으로 담았습니다.");
  assert.equal(notice, "");
});

test("이유 본문의 느낌표는 알림으로 오인하지 않는다", () => {
  const text = "여기 사진이 정말 예뻐요! 꼭 들러 보세요.";
  const { reason, notice } = splitAiReason(text);

  assert.equal(reason, text);
  assert.equal(notice, "");
});

test("사진 얘기여도 못 붙였다는 말이 없으면 이유로 둔다", () => {
  const text = "매장이 넓어요! 안쪽에 포토존 사진 스팟이 있습니다.";
  const { reason, notice } = splitAiReason(text);

  assert.equal(reason, text);
  assert.equal(notice, "");
});

test("알림만 있고 이유가 비면 원문을 그대로 돌려준다", () => {
  const text = "! 해당 관련 기사는 찾았지만 적합한 이미지를 불러오지 못했습니다.";
  const { reason, notice } = splitAiReason(text);

  assert.equal(reason, text);
  assert.equal(notice, "");
});

test("문구가 바뀌어도(대체합니다 / 매장 사진) 알림으로 본다", () => {
  const { reason, notice } = splitAiReason(
    "2026년 3월 앰배서더 발탁 기사입니다. ! 적합한 이미지가 없어 매장 사진으로 대체합니다.",
  );

  assert.equal(reason, "2026년 3월 앰배서더 발탁 기사입니다.");
  assert.equal(notice, "적합한 이미지가 없어 매장 사진으로 대체합니다.");
});

test("이유가 없으면 빈 값을 돌려준다", () => {
  assert.deepEqual(splitAiReason(null), { reason: "", notice: "" });
  assert.deepEqual(splitAiReason("   "), { reason: "", notice: "" });
  assert.deepEqual(splitAiReason(undefined), { reason: "", notice: "" });
});
