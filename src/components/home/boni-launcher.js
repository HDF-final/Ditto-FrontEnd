import Link from "next/link";

const BONI_FACE = "/assets/common/boni-chat.svg";

/**
 * Floating Boni face on the home page (desktop, bottom-right).
 * Tapping it jumps to the course builder.
 */
export function BoniLauncher() {
  return (
    <Link
      href="/ai-course"
      aria-label="코스 만들기"
      className="fixed bottom-[calc(var(--app-tabbar)+0.75rem)] right-4 z-50 block transition hover:scale-105 lg:bottom-6 lg:right-12"
    >
      <img
        src={BONI_FACE}
        alt="Boni"
        className="boni-float size-20 object-contain drop-shadow-[0_14px_28px_rgba(92,46,245,0.3)] lg:size-28"
      />
    </Link>
  );
}
