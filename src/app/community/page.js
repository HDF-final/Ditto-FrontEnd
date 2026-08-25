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

function filterCoursesByAuthor(courses, { authorId = "", author = "" } = {}) {
  const normalizedAuthorId = String(authorId).trim();
  const normalizedAuthor = String(author).trim().toLowerCase();

  if (!normalizedAuthorId && !normalizedAuthor) return courses;

  return courses.filter((course) => {
    const courseAuthorId = String(course.authorId || "").trim();
    const courseAuthorName = String(course.name || "").trim().toLowerCase();
    const courseAuthorKey = String(course.authorKey || "").trim().toLowerCase();

    if (normalizedAuthorId && courseAuthorId === normalizedAuthorId) return true;
    if (!normalizedAuthor) return false;

    return courseAuthorName === normalizedAuthor || courseAuthorKey === normalizedAuthor;
  });
}

export default async function CommunityPage({ searchParams }) {
  const params = searchParams ? await searchParams : {};
  const authorId = normalizeFilterValue(params.authorId);
  const author = normalizeFilterValue(params.author);
  const courses = await fetchPublicCoursesServer({ page: 0, size: 100 });
  const filteredCourses = filterCoursesByAuthor(courses, { authorId, author });

  return (
    <CommunityCoursePage
      initialCards={filteredCourses}
      authorFilterName={author}
      isAuthorFiltered={Boolean(authorId || author)}
    />
  );
}
