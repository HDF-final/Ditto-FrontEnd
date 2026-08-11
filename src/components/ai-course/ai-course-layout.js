import { CourseEditor } from "./course-editor/course-editor";
import { ConciergePanel } from "./concierge/concierge-panel";

export function AiCourseLayout() {
  return (
    <main className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1fr_400px] lg:px-8 lg:py-12">
      <CourseEditor />
      <ConciergePanel />
    </main>
  );
}
