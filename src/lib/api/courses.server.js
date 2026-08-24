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

export async function fetchRawSystemCoursesServer({ size = 20 } = {}) {
  const defaultIds = [1, 122, 21, 22, 23];
  const results = await Promise.allSettled(
    defaultIds.map((id) => fetchCourseDetailServer(id)),
  );

  const validCourses = results
    .filter((r) => r.status === "fulfilled" && r.value)
    .map((r) => r.value);

  validCourses.sort((a, b) => {
    const aScore = a.creationType === "SYSTEM" ? 2 : 1;
    const bScore = b.creationType === "SYSTEM" ? 2 : 1;
    return bScore - aScore;
  });

  return validCourses.slice(0, size);
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
