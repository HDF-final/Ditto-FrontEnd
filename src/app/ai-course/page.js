import { Suspense } from "react";
import { CourseRecommend } from "@/components/ai-course/recommend/course-recommend";

export const metadata = { title: "코스 추천" };

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
