import "client-only";

import { getAdminCourse } from "./admin-courses";

// 초안 전문을 브라우저에 잠깐 담아 둔다. 카드를 눌러 들어갔다 나오고, 새로고침하고,
// 다른 인물을 보다 돌아오는 것이 관리자가 실제로 하는 일인데 그때마다 수십 KB 를
// 다시 받을 이유가 없다.
//
// **sessionStorage 를 쓴다.** 초안은 승인 전 자료라 탭을 닫으면 같이 사라지는 편이 맞고,
// localStorage 는 로그아웃해도 남는다.
//
// **TTL 이 짧다(10분).** 초안은 Redis 에서 하루짜리이고 배치가 다시 돌면 내용이 바뀐다 —
// 지도 원장처럼 "수정될 일이 없는" 것이 아니다. 관리자가 새로고침을 눌렀을 때 어제 것을
// 보고 있으면 안 된다.
const PREFIX = "ditto:admin:draft:";
const TTL_MS = 10 * 60 * 1000;

function storage() {
  try {
    return window.sessionStorage;
  } catch {
    // 사생활 보호 모드나 저장소 차단. 캐시 없이 그냥 돈다.
    return null;
  }
}

export function readCachedDraft(celebrity) {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(PREFIX + celebrity);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw);
    if (!at || Date.now() - at > TTL_MS) {
      store.removeItem(PREFIX + celebrity);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function writeCachedDraft(celebrity, data) {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(PREFIX + celebrity, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // 용량이 찼다. 우리 것부터 비우고 한 번만 더 해 본다 — 그래도 안 되면 캐시를 포기한다.
    clearCachedDrafts();
    try {
      store.setItem(PREFIX + celebrity, JSON.stringify({ at: Date.now(), data }));
    } catch {
      /* 캐시 없이 돈다 */
    }
  }
}

export function clearCachedDrafts() {
  const store = storage();
  if (!store) return;
  try {
    for (const key of Object.keys(store)) {
      if (key.startsWith(PREFIX)) store.removeItem(key);
    }
  } catch {
    /* 지울 수 없으면 그냥 둔다 */
  }
}

/**
 * 초안에 붙은 사진을 브라우저 캐시에 미리 올린다.
 *
 * 그려지기 전에 받아 두면 카드를 눌렀을 때 자리 다섯 개가 한 번에 뜬다. 실제 캐시 기간은
 * 사진이 놓인 서버가 정하므로(기사 사진은 남의 서버다) 여기서 늘릴 수는 없다 —
 * 이번 세션 안에서 두 번 받지 않게 하는 것까지가 이 함수의 몫이다.
 */
export function preloadDraftImages(draft) {
  if (typeof window === "undefined") return;
  const places = draft?.payload?.places;
  if (!Array.isArray(places)) return;
  for (const place of places) {
    const url = place?.image?.url;
    if (!url) continue;
    const image = new Image();
    image.decoding = "async";
    image.src = url;
  }
}

/** 캐시를 먼저 보고, 없을 때만 부른다. */
export async function getAdminCourseCached(celebrity) {
  const cached = readCachedDraft(celebrity);
  if (cached) {
    preloadDraftImages(cached);
    return cached;
  }
  const data = await getAdminCourse(celebrity);
  writeCachedDraft(celebrity, data);
  preloadDraftImages(data);
  return data;
}
