/**
 * 주소 → CSS `background-image` 값.
 *
 * **따옴표 없는 `url()` 은 공백에서 토큰이 끊긴다.** 그러면 선언 하나가 통째로 무시되고
 * 배경이 안 그려져 회색 자리만 남는다. 버킷에 `63_크리스챤 디올.jpg` 처럼 공백이 든
 * 파일명이 있어서 실제로 났다 — 기본 추천 코스 목록의 카드 사진이 그렇게 비었다.
 *
 * 그래서 두 가지를 한다.
 *
 *   ① 인코딩   공백을 퍼센트로. 이미 인코딩된 주소가 와도 결과가 같다(아래 참고)
 *   ② 따옴표   괄호나 따옴표가 든 주소도 값 안에서 안 끊기게
 *
 * 백엔드가 인코딩해서 주기 시작해도 이건 그대로 둔다. 주소는 어디서든 올 수 있고,
 * 따옴표는 CSS 로서 어차피 맞는 쪽이다.
 */
export function cssUrl(url) {
  if (typeof url !== "string" || !url.trim()) return undefined;

  // **한 번 풀고 다시 감는다.** `encodeURI` 만 부르면 `%` 를 `%25` 로 바꿔서, 이미
  // 인코딩된 주소가 들어왔을 때 `%20` 이 `%2520` 이 된다 — 백엔드가 인코딩해 주기
  // 시작하면 그때부터 전부 깨지는 종류의 버그다. 풀었다 감으면 어느 쪽이 오든 같은
  // 결과가 나온다.
  //
  // `decodeURI` 는 `%` 하나가 escape 가 아닌 채로 있으면 던진다. 그건 이미 인코딩된
  // 주소가 아니라는 뜻이라, 그대로 감기만 하면 된다.
  const raw = url.trim();
  let encoded;
  try {
    encoded = encodeURI(decodeURI(raw));
  } catch {
    encoded = encodeURI(raw);
  }

  // 값 안에 남을 수 있는 따옴표와 역슬래시만 막으면 된다.
  const safe = encoded.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `url("${safe}")`;
}
