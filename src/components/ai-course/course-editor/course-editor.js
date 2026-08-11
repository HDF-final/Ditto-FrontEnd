import { CourseTitleEditor } from "./course-title-editor";
import { CourseActionBar } from "./course-action-bar";
import { CourseTimeline } from "./course-timeline";

export function CourseEditor({ course }) {
  return (
    <section className="flex flex-col gap-5">
      <CourseTitleEditor defaultTitle={course.title} />
      <CourseActionBar />
      <p className="inline-block w-fit rounded-control bg-brand-soft px-3.5 py-2 text-xs font-semibold text-brand-dark">
        장소를 눌러 완료 상태를 표시해보세요
      </p>
      <CourseTimeline stops={course.stops} />
    </section>
  );
}
