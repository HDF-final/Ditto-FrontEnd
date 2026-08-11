import { BrandAsset } from "@/components/common/brand-asset";

export function CourseEmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-line-strong bg-surface-soft px-6 py-14 text-center">
      <BrandAsset name="boni" className="size-20 bg-white" imageClassName="p-3" />
      <div>
        <p className="text-base font-bold text-ink">아직 담긴 장소가 없어요</p>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          Boni와 대화를 시작하면 추천 장소가 이 타임라인에 채워집니다.
        </p>
      </div>
    </div>
  );
}
