import { CourseRecommend } from "@/components/ai-course/recommend/course-recommend";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("aiCourse");
  return { title: t("title") };
}

export default function AiCoursePage() {
  return <CourseRecommend />;
}
