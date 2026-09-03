"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import { useIsMounted } from "@/hooks/use-is-mounted";
import {
  getPublicCourse,
  getPublicCourses,
  deleteCoursePost,
  likeCourse,
  unlikeCourse,
  bookmarkCourse,
  unbookmarkCourse,
} from "@/lib/api/community";
import { useCommunityInteractionsStore } from "@/stores/use-community-interactions-store";
import { isCommunityPostOwner } from "@/lib/community/author-ownership";
import { CommunityChatButton } from "./community-chat-button";
import { CommunityShareButton } from "./community-share-button";
import { useTranslations } from "next-intl";

function getCommunityPostId(course = {}) {
  return (
    course.postId ||
    course.courseId ||
    course.id ||
    (typeof course.slug === "number" || /^\d+$/.test(String(course.slug || ""))
      ? Number(course.slug)
      : 1)
  );
}

export function CommunityOwnerControls({ course = {} }) {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const mounted = useIsMounted();
  const postId = getCommunityPostId(course);
  const [liveDetail, setLiveDetail] = useState(null);
  const [liveSummary, setLiveSummary] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  useEffect(() => {
    if (!postId) return;

    getPublicCourse(postId)
      .then((detail) => setLiveDetail(detail))
      .catch(() => {});

    getPublicCourses({ page: 0, size: 100 })
      .then((pageData) => {
        const content = Array.isArray(pageData?.content)
          ? pageData.content
          : [];
        const matched = content.find(
          (post) => String(post?.postId) === String(postId),
        );
        if (matched) setLiveSummary(matched);
      })
      .catch(() => {});
  }, [postId]);

  const isOwner =
    mounted &&
    Boolean(currentUser) &&
    (isCommunityPostOwner(course, currentUser) ||
      isCommunityPostOwner(liveDetail, currentUser) ||
      isCommunityPostOwner(liveSummary, currentUser));

  async function handleDeletePost() {
    if (!postId || isDeletingPost) return;

    setIsDeletingPost(true);
    try {
      await deleteCoursePost(postId);
      setIsDeleteModalOpen(false);
      router.push("/community");
      router.refresh();
    } catch (err) {
      alert(err?.message || "게시글 삭제에 실패했습니다.");
    } finally {
      setIsDeletingPost(false);
    }
  }

  if (!isOwner) return null;

  return (
    <>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => router.push(`/community/${postId}/edit`)}
          className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-brand-soft px-3.5 text-xs font-black text-brand transition hover:bg-[#e9dfff] sm:px-4"
        >
          <svg
            className="size-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          수정
        </button>
        <button
          type="button"
          onClick={() => setIsDeleteModalOpen(true)}
          disabled={isDeletingPost}
          className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3.5 text-xs font-black transition sm:px-4 ${
            isDeletingPost
              ? "cursor-not-allowed bg-red-50 text-red-300"
              : "cursor-pointer bg-[#fff2f2] text-red-500 hover:bg-[#ffe6e6]"
          }`}
        >
          <svg
            className="size-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M6 6l1 16h10l1-16" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
          {isDeletingPost ? "삭제 중" : "삭제"}
        </button>
      </div>

      {isDeleteModalOpen ? (
        <div
          className="fixed inset-0 z-[140] flex items-center justify-center bg-[#17131f]/65 px-5 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeletingPost) {
              setIsDeleteModalOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="community-delete-title"
            className="w-full max-w-[360px] rounded-[28px] bg-white p-6 text-center shadow-[0_28px_80px_rgba(18,14,34,0.35)] animate-in zoom-in-95 duration-150"
          >
            <div className="mx-auto mb-4 flex size-13 items-center justify-center rounded-full bg-[#fff2f2] text-red-500">
              <svg
                className="size-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M6 6l1 16h10l1-16" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
            </div>
            <h3 id="community-delete-title" className="text-lg font-black text-ink">
              게시글을 삭제할까요?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              삭제한 커뮤니티 게시글과 사진은 다시 복구할 수 없어요.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeletingPost}
                className="h-11 flex-1 cursor-pointer rounded-full border border-line bg-surface-soft text-sm font-black text-ink transition hover:bg-line disabled:cursor-not-allowed disabled:opacity-60"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDeletePost}
                disabled={isDeletingPost}
                className="h-11 flex-1 cursor-pointer rounded-full bg-red-500 text-sm font-black text-white shadow-[0_12px_28px_rgba(239,68,68,0.24)] transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {isDeletingPost ? "삭제 중..." : "삭제하기"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function CommunityDetailActions({ course = {} }) {
  const t = useTranslations("community");
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const mounted = useIsMounted();
  const postId = getCommunityPostId(course);

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
  const clearLikesDelta = useCommunityInteractionsStore(
    (state) => state.clearLikesDelta,
  );
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
    const nextLikesCount = Math.max(0, baseLikes + (nextState ? 1 : -1));
    setLiked(postIdentifier, nextState);

    if (postId) {
      try {
        if (nextState) {
          await likeCourse(postId);
        } else {
          await unlikeCourse(postId);
        }
        setLiveLikes(nextLikesCount);
        clearLikesDelta(postIdentifier);
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
            className={`inline-flex size-11 cursor-pointer items-center justify-center rounded-full border transition ${
              isLiked
                ? "border-brand bg-brand-soft text-brand hover:bg-[#e7ddff]"
                : "border-line bg-white text-ink-muted hover:border-brand/40 hover:bg-brand-soft/30 hover:text-brand"
            }`}
          >
            <svg
              className={`size-[17px] transition-transform ${isLiked ? "scale-105" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            >
              <path
                d="M12 21.35 10.62 20.1C5.72 15.66 2.5 12.74 2.5 9.15 2.5 6.23 4.79 3.95 7.7 3.95c1.64 0 3.22.76 4.3 1.96 1.08-1.2 2.66-1.96 4.3-1.96 2.91 0 5.2 2.28 5.2 5.2 0 3.59-3.22 6.51-8.12 10.96L12 21.35Z"
                fill={isLiked ? "currentColor" : "#FFFFFF"}
                stroke="currentColor"
                strokeWidth="2.2"
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
