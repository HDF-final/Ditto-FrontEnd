"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { bookmarkCourse, unbookmarkCourse } from "@/lib/api/community";
import { useCommunityInteractionsStore } from "@/stores/use-community-interactions-store";
import { CommunityShareButton } from "@/app/community/[postId]/community-share-button";
import { useTranslations } from "next-intl";

export function CourseDetailActions({ course = {} }) {
  const t = useTranslations("community");
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const mounted = useIsMounted();

  const courseId =
    course.courseId ||
    course.postId ||
    course.id ||
    (typeof course.slug === "number" || /^\d+$/.test(course.slug)
      ? Number(course.slug)
      : 1);

  const postIdentifier = String(course.courseId || course.slug || courseId || "1");

  const isBookmarkedStored = useCommunityInteractionsStore((state) =>
    state.isBookmarked(postIdentifier),
  );
  const setBookmarked = useCommunityInteractionsStore(
    (state) => state.setBookmarked,
  );

  const isBookmarked = mounted ? isBookmarkedStored : false;
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  async function handleBookmarkToggle() {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    const nextState = !isBookmarked;
    setBookmarked(postIdentifier, nextState);

    if (courseId) {
      try {
        if (nextState) {
          await bookmarkCourse(courseId);
        } else {
          await unbookmarkCourse(courseId);
        }
      } catch (err) {
        console.warn("[Bookmark Toggle] Failed:", err);
      }
    }
  }

  return (
    <>
      <div className="mt-5 flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
        {/* 코스 저장 / 북마크 버튼 */}
        <button
          type="button"
          onClick={handleBookmarkToggle}
          className={`inline-flex h-11 min-w-0 flex-1 basis-[calc(50%-0.25rem)] items-center justify-center gap-1.5 rounded-full px-3 text-xs font-black transition shadow-xs hover:scale-[1.02] cursor-pointer sm:h-12 sm:min-w-[142px] sm:flex-none sm:basis-auto sm:gap-2 sm:px-8 sm:text-sm ${
            isBookmarked
              ? "border border-brand bg-brand-soft text-brand hover:bg-[#e7ddff]"
              : "bg-brand text-white hover:bg-brand-dark"
          }`}
        >
          <svg
            className={`size-4.5 ${isBookmarked ? "fill-current" : ""}`}
            viewBox="0 0 24 24"
            fill={isBookmarked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <span>{isBookmarked ? t("saved") : t("saveCourse")}</span>
        </button>

        {/* 공유하기 버튼 */}
        <CommunityShareButton />
      </div>

      {/* 로그인 필요 알림 모달 */}
      {isLoginModalOpen ? (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 px-5 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLoginModalOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[340px] rounded-[24px] bg-white p-6 shadow-2xl text-center animate-in zoom-in-95 duration-150"
          >
            <div className="mx-auto mb-3.5 flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
              <svg
                className="size-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h3 className="text-base font-black text-ink">{t("loginRequired")}</h3>
            <p className="mt-2 text-xs text-ink-muted leading-relaxed">
              {t("loginRequiredDescription")}
            </p>
            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                className="flex-1 rounded-full border border-line bg-surface-soft py-2.5 text-xs font-bold text-ink hover:bg-line transition cursor-pointer"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLoginModalOpen(false);
                  router.push("/login");
                }}
                className="flex-1 rounded-full bg-brand py-2.5 text-xs font-black text-white shadow-xs hover:bg-brand-dark transition cursor-pointer"
              >
                {t("login")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
