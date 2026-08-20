import { Suspense } from "react";
import { CourseRecommend } from "@/components/ai-course/recommend/course-recommend";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("aiCourse");
  return { title: t("title") };
}

export default function AiCoursePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[60vh] items-center justify-center bg-white">
          <div className="size-8 animate-spin rounded-full border-3 border-brand border-t-transparent" />
        </main>
      }
    >
      <CourseRecommend />
    </Suspense>
  );
}
