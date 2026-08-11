import { CourseTitleEditor } from "./course-title-editor";
import { CourseActionBar } from "./course-action-bar";
import { CourseTimeline } from "./course-timeline";
import { CourseModals } from "./course-modals";

export function CourseEditor() {
  return (
    <section className="flex flex-col gap-5">
      <CourseTitleEditor />
      <CourseActionBar />
      <p className="inline-block w-fit rounded-control bg-brand-soft px-3.5 py-2 text-xs font-semibold text-brand-dark">
        카드를 드래그해 순서를 바꾸고, 카드를 눌러 상세 정보를 확인하세요
      </p>
      <CourseTimeline />
      <CourseModals />
    </section>
  );
}
