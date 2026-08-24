import Link from "next/link";

const BONI_FACE = "/assets/common/boni-chat.svg";

/** Home-page Boni launcher. Mobile stays inside the 430px app shell. */
export function BoniLauncher() {
  return (
    <div className="pointer-events-none fixed z-50 max-lg:inset-x-0 max-lg:bottom-[calc(var(--app-tabbar)+0.75rem)] max-lg:mx-auto max-lg:flex max-lg:w-full max-lg:max-w-[430px] max-lg:justify-end max-lg:px-4 lg:bottom-6 lg:right-12">
      <Link
        href="/ai-course"
        aria-label="코스 만들기"
        className="pointer-events-auto block transition hover:scale-105"
      >
        <img
          src={BONI_FACE}
          alt="Boni"
          className="boni-float size-20 object-contain drop-shadow-[0_14px_28px_rgba(92,46,245,0.3)] lg:size-28"
        />
      </Link>
    </div>
  );
}
