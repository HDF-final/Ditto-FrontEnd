import { buttonClassName } from "@/components/common/button";

// Placeholder action bar. Add / optimize / save behaviors are intentionally
// not wired up in this milestone, so the controls are disabled for now.
const actions = [
  { label: "↩ 이전으로 돌아가기", variant: "neutral" },
  { label: "+ 장소 추가", variant: "secondary" },
  { label: "⚡ 코스 최적화", variant: "secondary" },
  { label: "⊕ 코스 저장", variant: "primary" },
];

export function CourseActionBar() {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          disabled
          className={buttonClassName({
            variant: action.variant,
            size: "sm",
          })}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
