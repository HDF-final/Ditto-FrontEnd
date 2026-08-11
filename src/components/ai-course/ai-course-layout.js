import { BrandAsset } from "@/components/common/brand-asset";
import { CourseEditor } from "./course-editor/course-editor";

// Placeholder for the Boni assistant panel. The chat experience is a later
// issue; this issue only reserves the right-hand column layout.
function BoniPanelPlaceholder() {
  return (
    <aside className="flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card lg:sticky lg:top-24">
      <div className="flex items-center gap-3 border-b border-line bg-surface-soft px-5 py-4">
        <BrandAsset name="boni" className="size-12 bg-white" imageClassName="p-1.5" />
        <div>
          <p className="flex items-center gap-1.5 text-base font-bold text-ink">
            Boni
            <span className="inline-block size-2.5 rounded-full bg-success" />
          </p>
          <p className="text-xs text-ink-muted">AI 코스 도우미</p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center px-6 py-16 text-center">
        <p className="text-sm leading-6 text-ink-muted">
          Boni 대화 패널이 이 자리에 들어옵니다.
          <br />
          (다음 이슈에서 연결 예정)
        </p>
      </div>
    </aside>
  );
}

export function AiCourseLayout({ course }) {
  return (
    <main className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1fr_400px] lg:px-8 lg:py-12">
      <CourseEditor course={course} />
      <BoniPanelPlaceholder />
    </main>
  );
}
