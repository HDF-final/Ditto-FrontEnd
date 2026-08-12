import { CommunityCoursePage } from "./community-course-page";
import { communityCourses } from "@/lib/fixtures/community-courses";

export const metadata = { title: "커뮤니티" };

export default function CommunityPage() {
  return <CommunityCoursePage initialCards={communityCourses} />;
}
