import { CommunityCoursePage } from "./community-course-page";
import { fetchPublicCoursesServer } from "@/lib/api/community.server";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const t = await getTranslations("navigation");
  return { title: t("community") };
}

export default async function CommunityPage() {
  const courses = await fetchPublicCoursesServer({ page: 0, size: 20 });
  return <CommunityCoursePage initialCards={courses} />;
}
