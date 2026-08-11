import { AiCourseLayout } from "@/components/ai-course/ai-course-layout";
import { aiCourseFixture } from "@/lib/fixtures/ai-course";

export const metadata = { title: "AI 코스 편집" };

export default function AiCoursePage() {
  return <AiCourseLayout course={aiCourseFixture} />;
}
