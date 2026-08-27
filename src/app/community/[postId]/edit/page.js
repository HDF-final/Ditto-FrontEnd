import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { fetchPublicCourseDetailServer } from "@/lib/api/community.server";
import { CommunityPostEditForm } from "./community-post-edit-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { postId } = await params;
  const course = await fetchPublicCourseDetailServer(postId);
  const t = await getTranslations("community");

  return {
    title: course?.title
      ? `${course.title} 수정`
      : t.has("communityCourse")
        ? t("communityCourse")
        : "커뮤니티 코스",
  };
}

export default async function CommunityPostEditPage({ params }) {
  const { postId } = await params;
  const course = await fetchPublicCourseDetailServer(postId);

  if (!course) {
    notFound();
  }

  return <CommunityPostEditForm course={course} />;
}
