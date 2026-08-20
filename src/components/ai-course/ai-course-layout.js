import { CourseEditor } from "./course-editor/course-editor";
import { ConciergePanel } from "./concierge/concierge-panel";

export function AiCourseLayout() {
  return (
    <main className="grid w-full gap-5 px-4 py-5 lg:mx-auto lg:max-w-7xl lg:grid-cols-[1fr_400px] lg:gap-8 lg:px-16 lg:py-14 xl:px-20">
      <CourseEditor />
      <ConciergePanel />
    </main>
  );
}
