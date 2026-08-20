"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import { useIsMounted } from "@/hooks/use-is-mounted";
import {
  getPublicCourse,
  likeCourse,
  unlikeCourse,
  bookmarkCourse,
  unbookmarkCourse,
} from "@/lib/api/community";
import { useCommunityInteractionsStore } from "@/stores/use-community-interactions-store";
import { CommunityChatButton } from "./community-chat-button";
import { CommunityShareButton } from "./community-share-button";
import { useTranslations } from "next-intl";

export function CommunityDetailActions({ course = {} }) {
  const t = useTranslations("community");
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const mounted = useIsMounted();

  const postId =
    course.postId ||
    course.courseId ||
    course.id ||
    (typeof course.slug === "number" || /^\d+$/.test(course.slug)
      ? Number(course.slug)
      : 1);

  const postIdentifier = String(course.postId || course.slug || postId || "1");

  const [liveLikes, setLiveLikes] = useState(
    typeof course.likes === "number"
      ? course.likes
      : typeof course.likeCount === "number"
        ? course.likeCount
        : 0,
  );

  useEffect(() => {
    if (postId) {
      getPublicCourse(postId)
        .then((detail) => {
          const count =
            typeof detail?.likeCount === "number"
              ? detail.likeCount
              : typeof detail?.likes === "number"
                ? detail.likes
                : null;
          if (count !== null) setLiveLikes(count);
        })
        .catch(() => {});
    }
  }, [postId]);

  const isLikedStored = useCommunityInteractionsStore((state) =>
    state.isLiked(postIdentifier),
  );
  const isBookmarkedStored = useCommunityInteractionsStore((state) =>
    state.isBookmarked(postIdentifier),
  );
  const likesDeltaStored = useCommunityInteractionsStore((state) =>
    state.getLikesDelta(postIdentifier),
  );
  const setLiked = useCommunityInteractionsStore((state) => state.setLiked);
  const setBookmarked = useCommunityInteractionsStore(
    (state) => state.setBookmarked,
  );

  const isLiked = mounted ? isLikedStored : false;
  const isBookmarked = mounted ? isBookmarkedStored : false;
  const likesDelta = mounted ? likesDeltaStored : 0;

  const baseLikes = liveLikes;
  const likesCount = Math.max(0, baseLikes + likesDelta);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  async function handleLikeToggle() {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    const nextState = !isLiked;
    setLiked(postIdentifier, nextState);

    if (postId) {
      try {
        if (nextState) {
          await likeCourse(postId);
        } else {
          await unlikeCourse(postId);
        }
      } catch (err) {
        console.warn("[Like Toggle] Failed:", err);
      }
    }
  }

  async function handleBookmarkToggle() {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    const nextState = !isBookmarked;
    setBookmarked(postIdentifier, nextState);

    if (postId) {
      try {
        if (nextState) {
          await bookmarkCourse(postId);
        } else {
          await unbookmarkCourse(postId);
        }
      } catch (err) {
        console.warn("[Bookmark Toggle] Failed:", err);
      }
    }
  }

  return (
    <>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {/* 좋아요 버튼 */}
        <button
          type="button"
          onClick={handleLikeToggle}
          className={`inline-flex h-12 min-w-[130px] items-center justify-center gap-2 rounded-full border px-6 text-sm font-black transition shadow-xs hover:scale-[1.02] cursor-pointer ${
            isLiked
              ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
              : "border-line bg-white text-ink hover:border-red-300 hover:text-red-500"
          }`}
        >
          <svg
            className={`size-4.5 transition-transform ${isLiked ? "fill-current scale-110" : ""}`}
            viewBox="0 0 24 24"
            fill={isLiked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>{t("like")}</span>
          <span className="text-xs font-bold opacity-80">{likesCount}</span>
        </button>

        {/* 코스 저장 / 북마크 버튼 */}
        <button
          type="button"
          onClick={handleBookmarkToggle}
          className={`inline-flex h-12 min-w-[130px] items-center justify-center gap-2 rounded-full px-6 text-sm font-black transition shadow-xs hover:scale-[1.02] cursor-pointer ${
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

        {/* 대화 참여 버튼 */}
        <CommunityChatButton course={course} />
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
