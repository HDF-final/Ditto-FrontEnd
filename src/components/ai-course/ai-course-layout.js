import { CourseEditor } from "./course-editor/course-editor";
import { ConciergePanel } from "./concierge/concierge-panel";

export function AiCourseLayout() {
  return (
    <main className="mx-auto grid w-full max-w-7xl gap-8 px-10 py-12 sm:px-14 lg:grid-cols-[1fr_400px] lg:px-16 lg:py-14 xl:px-20">
      <CourseEditor />
      <ConciergePanel />
    </main>
  );
}
