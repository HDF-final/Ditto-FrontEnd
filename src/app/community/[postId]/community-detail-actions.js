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
  const customizeCourseId =
    course.courseId ||
    course.sourceCourseId ||
    course.originalCourseId ||
    course.id ||
    "";

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
        let res;
        if (nextState) {
          res = await likeCourse(postId);
        } else {
          res = await unlikeCourse(postId);
        }
        if (typeof res?.likesCount === "number") {
          setLiveLikes(res.likesCount - (nextState ? 1 : 0));
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
      <div className="mt-5 flex min-w-0 flex-col gap-3 sm:max-w-[560px]">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={handleLikeToggle}
            aria-label={t("like")}
            className={`inline-flex size-12 cursor-pointer items-center justify-center rounded-full border transition ${
              isLiked
                ? "border-[#eadcff] bg-white shadow-[0_10px_24px_rgba(154,116,255,0.26)] hover:bg-[#fbf8ff]"
                : "border-[#ebe5fb] bg-[#fbf9ff] text-white shadow-[0_8px_18px_rgba(108,84,180,0.08)] hover:border-brand/30 hover:bg-brand-soft/20"
            }`}
          >
            <svg
              className={`size-8 drop-shadow-[0_5px_7px_rgba(137,112,212,0.23)] transition-transform ${isLiked ? "scale-105" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            >
              <defs>
                <linearGradient
                  id="communityLikeSparkleGradient"
                  x1="3"
                  y1="2"
                  x2="21"
                  y2="22"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#b99cff" />
                  <stop offset="42%" stopColor="#6d36ff" />
                  <stop offset="100%" stopColor="#4b18d8" />
                </linearGradient>
                <radialGradient
                  id="communityLikeSparkleHighlight"
                  cx="35%"
                  cy="28%"
                  r="55%"
                >
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="48%" stopColor="#ffffff" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
                <linearGradient
                  id="communityLikeSparkleIdle"
                  x1="4"
                  y1="3"
                  x2="20"
                  y2="21"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#c8b7ff" />
                  <stop offset="48%" stopColor="#8f67ff" />
                  <stop offset="100%" stopColor="#6d36ff" />
                </linearGradient>
              </defs>
              <path
                d="M12 1.55C13.38 7.02 16.98 10.62 22.45 12 16.98 13.38 13.38 16.98 12 22.45 10.62 16.98 7.02 13.38 1.55 12 7.02 10.62 10.62 7.02 12 1.55Z"
                fill={
                  isLiked
                    ? "url(#communityLikeSparkleGradient)"
                    : "url(#communityLikeSparkleIdle)"
                }
                opacity={isLiked ? "1" : "0.92"}
              />
              <path
                d="M12 3.25C13.02 7.32 15.6 9.82 19.95 12 15.6 14.18 13.02 16.68 12 20.75 10.98 16.68 8.4 14.18 4.05 12 8.4 9.82 10.98 7.32 12 3.25Z"
                fill="url(#communityLikeSparkleHighlight)"
                opacity={isLiked ? "0.9" : "0.55"}
              />
              <path
                d="M7.25 11.55C9.2 10.95 10.95 8.95 12 5.8c1.05 3.15 2.8 5.15 4.75 5.75"
                stroke="#ffffff"
                strokeWidth="0.85"
                opacity={isLiked ? "0.75" : "0.52"}
              />
            </svg>
            <span className="sr-only">
              {t("like")} {likesCount}
            </span>
          </button>

          <button
            type="button"
            onClick={handleBookmarkToggle}
            aria-label={isBookmarked ? t("saved") : t("saveCourse")}
            className={`inline-flex size-11 cursor-pointer items-center justify-center rounded-full border transition ${
              isBookmarked
                ? "border-brand bg-brand-soft text-brand hover:bg-[#e7ddff]"
                : "border-line bg-white text-ink-muted hover:border-brand/40 hover:bg-brand-soft/30 hover:text-brand"
            }`}
          >
            <svg
              className={`size-4 ${isBookmarked ? "fill-current" : ""}`}
              viewBox="0 0 24 24"
              fill={isBookmarked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span className="sr-only">{isBookmarked ? t("saved") : t("saveCourse")}</span>
          </button>

          <CommunityShareButton variant="compact" />
        </div>

        <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              const query = customizeCourseId
                ? `?courseId=${encodeURIComponent(String(customizeCourseId))}`
                : "";
              router.push(`/ai-course${query}`);
            }}
            className="inline-flex h-12 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-black text-white shadow-control transition hover:bg-brand-dark sm:h-13 sm:text-base"
          >
            <svg
              className="size-4.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            <span>커스텀하기</span>
          </button>

          <CommunityChatButton course={course} variant="secondary" />
        </div>
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
