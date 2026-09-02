// 추천 이유에 섞여 오는 "사진을 못 붙였다" 알림을 갈라내는 곳.
//
// 근거 기사는 찾았는데 쓸 만한 사진이 없던 자리는, 챗 람다가 이유 문장 **끝에**
// `" ! 해당 관련 기사는 찾았지만 적합한 이미지를 불러오지 못했습니다."` 를 이어 붙여
// 보낸다. 한 칸(`recommendationReason`)으로 오기 때문에 화면은 추천 이유와 알림을
// 구별하지 못했고, 이유 문단 끝에 느낌표 문장이 그대로 붙어 나왔다 — 이유를 읽다가
// 갑자기 시스템이 끼어드는 모양이라 어색하다.
//
// 백엔드가 칸을 따로 주기 전까지는 여기서 가른다. 갈라 두면 화면은 이유는 이유대로,
// 알림은 알림대로(다른 색, 이유 카드 아래) 그릴 수 있다.

// **뒤에서부터 마지막 느낌표 토막만** 문다. `[^!！]*` 가 느낌표를 못 넘고 `$` 로
// 끝나므로, 이유 본문 안의 느낌표("좋아요! …")는 잡히지 않는다.
const NOTICE_PATTERN = /\s*[!！]\s*([^!！]*(?:이미지|사진)[^!！]*)$/;

// 사진 얘기라고 다 알림은 아니다. "못 했습니다 / 실패 / 없습니다 / 대체합니다" 처럼
// **못 붙였다는 말**이 같이 있어야 알림으로 본다.
const NOTICE_VERBS = /(못|실패|없|대체)/;

// 한 문장짜리 알림이다. 이보다 길면 이유 본문을 잘못 문 것으로 보고 그대로 둔다.
const NOTICE_MAX_LENGTH = 120;

/**
 * 추천 이유 문자열을 `{ reason, notice }` 로 가른다.
 *
 * 알림이 없으면 `notice` 는 빈 문자열이고 `reason` 은 받은 그대로다.
 */
export function splitAiReason(rawReason) {
  const text = typeof rawReason === "string" ? rawReason.trim() : "";
  if (!text) return { reason: "", notice: "" };

  const matched = text.match(NOTICE_PATTERN);
  if (!matched) return { reason: text, notice: "" };

  const notice = matched[1].trim();
  const reason = text.slice(0, matched.index).trim();

  // 이유가 통째로 사라지거나(=문장 전체가 알림), 알림이 문단만큼 길거나, 못 붙였다는
  // 말이 없으면 가른 것이 아니라 잘못 문 것이다. 원문을 그대로 돌려준다.
  if (!reason || !notice || notice.length > NOTICE_MAX_LENGTH || !NOTICE_VERBS.test(notice)) {
    return { reason: text, notice: "" };
  }

  return { reason, notice };
}
