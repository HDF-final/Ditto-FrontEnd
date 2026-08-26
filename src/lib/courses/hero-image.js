// 대표 사진 값 다루기. **부품에서 뺀 이유는 검사를 붙이기 위해서다** —
// 여기가 틀리면 `COURSE.MAIN_IMAGE` 에 주소가 들어가고, 조회할 때 CDN 주소를 앞에 또
// 붙여 대표 사진이 조용히 깨진다. 화면으로는 저장한 뒤에야 알 수 있다.

/**
 * 셀럽 사진이 놓이는 자리. 반영 람다가 기사에서 받아 온 근거 사진을 `course/…` 로 두고,
 * 매장 사진은 이미 버킷에 있는 `place-picture/…` 를 그대로 가리킨다.
 */
export const CELEB_PREFIX = "course/";
export const isCelebPhoto = (key) => typeof key === "string" && key.startsWith(CELEB_PREFIX);

/**
 * 붙여 넣은 값 → 저장할 S3 키.
 *
 * **DB 에 들어가는 것은 주소가 아니라 키다**(`COURSE.MAIN_IMAGE`). 그래서 주소를 받으면
 * 여기서 키만 떼어 낸다. 그대로 저장하면 조회할 때 CDN 주소를 앞에 또 붙여 깨진다.
 *
 * 우리 것인지는 **자리 사진과 같은 호스트인가**로 본다. CDN 주소를 코드에 박아 두면
 * 배포를 옮길 때 여기만 남는다 — 화면이 이미 들고 있는 주소가 곧 정답이다.
 */
export function toImageKey(value, slots) {
  const raw = (value || "").trim();
  if (!raw) return { key: "", error: null };
  if (!/^https?:\/\//i.test(raw)) return { key: raw, error: null };

  let url;
  try {
    url = new URL(raw);
  } catch {
    return { key: "", error: "주소를 읽을 수 없습니다." };
  }

  const ourHosts = new Set(
    slots
      .map((slot) => {
        try {
          return new URL(slot.imageUrl).host;
        } catch {
          return null;
        }
      })
      .filter(Boolean),
  );
  const ours =
    ourHosts.has(url.host) || /\.s3[.-][a-z0-9-]+\.amazonaws\.com$/i.test(url.host);
  if (!ours) {
    return {
      key: "",
      error: "이 코스에 붙어 있는 사진만 대표로 쓸 수 있습니다. 새 사진은 승인 화면에서 넣으세요.",
    };
  }
  return { key: decodeURIComponent(url.pathname).replace(/^\/+/, ""), error: null };
}
