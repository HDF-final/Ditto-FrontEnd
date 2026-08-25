import { CommunityCoursePage } from "./community-course-page";
import { fetchPublicCoursesServer } from "@/lib/api/community.server";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const t = await getTranslations("navigation");
  return { title: t("community") };
}

function normalizeFilterValue(value) {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

function normalizeAuthorToken(value) {
  return String(value || "").trim().toLowerCase();
}

function getCourseAuthorNames(course) {
  return [
    course.name,
    course.writerNickname,
    course.writerName,
    course.authorNickname,
    course.authorName,
    course.userNickname,
    course.nickname,
    course.userName,
    course.author,
    course.authorKey,
  ]
    .map(normalizeAuthorToken)
    .filter(Boolean);
}

function filterCoursesByAuthor(courses, { authorId = "", author = "" } = {}) {
  const normalizedAuthorId = String(authorId).trim();
  const normalizedAuthor = normalizeAuthorToken(author);

  if (!normalizedAuthorId && !normalizedAuthor) return courses;

  return courses.filter((course) => {
    const courseAuthorId = String(course.authorId || "").trim();
    const courseAuthorNames = getCourseAuthorNames(course);

    if (normalizedAuthorId && courseAuthorId === normalizedAuthorId) return true;
    if (!normalizedAuthor) return false;

    return courseAuthorNames.includes(normalizedAuthor);
  });
}

function hasAuthorMetadata(course) {
  return Boolean(course?.authorId || course?.name || course?.authorKey);
}

export default async function CommunityPage({ searchParams }) {
  const params = searchParams ? await searchParams : {};
  const authorId = normalizeFilterValue(params.authorId);
  const author = normalizeFilterValue(params.author);
  const isAuthorFiltered = Boolean(authorId || author);
  const courses = await fetchPublicCoursesServer({
    page: 0,
    size: 100,
    authorId,
    author,
  });
  const filteredCourses = filterCoursesByAuthor(courses, { authorId, author });
  const visibleCourses =
    isAuthorFiltered &&
    filteredCourses.length === 0 &&
    courses.length > 0 &&
    courses.every((course) => !hasAuthorMetadata(course))
      ? courses
      : filteredCourses;
  const resolvedAuthorName = author || visibleCourses.find((course) => course.name)?.name || "";

  return (
    <CommunityCoursePage
      initialCards={visibleCourses}
      authorFilterName={resolvedAuthorName}
      isAuthorFiltered={isAuthorFiltered}
    />
  );
}
