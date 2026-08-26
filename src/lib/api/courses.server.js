import { getServerApiBaseUrl } from "./server-base-url";
import { getServerApiHeaders } from "./server-language";

const GRADIENTS = [
  "from-[#5c2ef5] to-[#8c57fa]",
  "from-[#2d1b8e] to-[#5c2ef5]",
  "from-[#6d28d9] to-[#c084fc]",
  "from-[#4a2fa8] to-[#7c5cf0]",
];

export async function fetchCourseDetailServer(courseId) {
  const baseUrl = getServerApiBaseUrl();
  const headers = await getServerApiHeaders();
  headers["X-User-Id"] = "1";

  try {
    const res = await fetch(`${baseUrl}/api/v1/courses/${courseId}`, {
      headers,
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn(`[fetchCourseDetailServer] Error fetching ${courseId}:`, err?.message);
    return null;
  }
}

/**
 * 기본 추천 코스 목록.
 *
 * **코스 번호를 더 이상 손으로 안 적는다.** 예전에는 `[1, 122, 21, 22, 23]` 을 박아 두고
 * 하나씩 상세를 받아 `creationType === "SYSTEM"` 인 것만 걸렀는데, 목록 엔드포인트가
 * 없어서 그랬던 것이다. 그 방식은 새로 올린 코스가 영영 안 보인다 — 어드민에서 승인해도
 * 이 배열에 없으면 화면에 없다.
 *
 * 이제 백엔드가 `creation_type = 'SYSTEM'` 인 것을 최신순으로 준다. 로그인 없이 열린다.
 *
 * @param {string} [country] `COUNTRY.CODE` (KR·JP·CN·US). 비우면 나라를 안 보고 전부.
 */
export async function fetchRawSystemCoursesServer({ size = 20, country } = {}) {
  const baseUrl = getServerApiBaseUrl();
  const headers = await getServerApiHeaders();

  const query = new URLSearchParams({ page: "0", size: String(size) });
  if (country) query.set("country", country);

  try {
    const res = await fetch(`${baseUrl}/api/v1/courses/recommended?${query}`, {
      headers,
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const content = json?.data?.content;
    if (!Array.isArray(content)) return [];

    // 목록 응답의 칸 이름을 이 파일이 이미 쓰던 이름으로 맞춘다. 카드를 그리는 쪽
    // (`/courses` 페이지, `fetchSystemCoursesServer`)이 `places[].name` 과 `image` 를
    // 보고 있어, 여기서 맞춰 두면 화면 코드를 안 고쳐도 된다.
    return content.map((c) => ({
      ...c,
      creationType: "SYSTEM",
      image: c.imageUrl || null,
      places: (c.placeNames || []).map((name) => ({ name })),
    }));
  } catch (err) {
    console.warn("[fetchRawSystemCoursesServer] Error:", err?.message);
    return [];
  }
}

export async function fetchSystemCoursesServer({ size = 3 } = {}) {
  const validCourses = await fetchRawSystemCoursesServer({ size });

  return validCourses.map((c, i) => {
    const rawTags = Array.isArray(c.places) && c.places.length > 0
      ? c.places.map((p) => p.name.replace(/^#/, "")).slice(0, 2)
      : Array.isArray(c.tags)
        ? c.tags.map((t) => t.replace(/^#/, "")).slice(0, 2)
        : ["더현대", "DITTO"];

    const engTitle = c.englishTitle || (c.name ? c.name.toUpperCase() : `TOP ${i + 1} COURSE`);

    return {
      rank: `TOP ${i + 1}`,
      englishTitle: engTitle,
      title: c.name || c.title || "기본 추천 코스",
      tags: rawTags,
      href: c.courseId
        ? `/courses/${c.courseId}`
        : c.slug
          ? `/courses/${c.slug}`
          : `/courses`,
      gradient: c.gradient || GRADIENTS[i % GRADIENTS.length],
    };
  });
}
