import { CommunityCoursePage } from "./community-course-page";
import { fetchPublicCoursesServer } from "@/lib/api/community.server";

export const dynamic = "force-dynamic";
export const metadata = { title: "커뮤니티" };

export default async function CommunityPage() {
  const courses = await fetchPublicCoursesServer({ page: 0, size: 20 });
  return <CommunityCoursePage initialCards={courses} />;
}
