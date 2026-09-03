"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import { useCommunityInteractionsStore } from "@/stores/use-community-interactions-store";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { useTranslations } from "next-intl";
import {
  likeCourse,
  unlikeCourse,
  bookmarkCourse,
  unbookmarkCourse,
} from "@/lib/api/community";

function getFlagEmoji(countryCode = "") {
  const code = (countryCode || "").toUpperCase();
  if (code === "JP" || code === "JAPAN") return "🇯🇵";
  if (code === "CN" || code === "CHINA") return "🇨🇳";
  if (code === "US" || code === "USA") return "🇺🇸";
  if (code === "KR" || code === "KOREA") return "🇰🇷";
  return "🌐";
}

export function MypageCourseCard({
  course,
  onAuthRequired,
  onEdit,
}) {
  const t = useTranslations("community");
  const mypageT = useTranslations("mypage");
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const mounted = useIsMounted();

  const slugKey = course.slug ? String(course.slug) : "";
  const numKey = String(course.postId || course.courseId || course.id || "1");

  const isLikedStored = useCommunityInteractionsStore((state) =>
    state.isLiked(slugKey, numKey),
  );
  const isBookmarkedStored = useCommunityInteractionsStore((state) =>
    state.isBookmarked(slugKey, numKey),
  );
  const savesDeltaStored = useCommunityInteractionsStore((state) =>
    state.getSavesDelta(slugKey, numKey),
  );
  const setLiked = useCommunityInteractionsStore((state) => state.setLiked);
  const clearLikesDelta = useCommunityInteractionsStore(
    (state) => state.clearLikesDelta,
  );
  const setBookmarked = useCommunityInteractionsStore(
    (state) => state.setBookmarked,
  );
  const clearSavesDelta = useCommunityInteractionsStore(
    (state) => state.clearSavesDelta,
  );

  const [confirmedLikes, setConfirmedLikes] = useState(null);
  const [confirmedSaves, setConfirmedSaves] = useState(null);

  const isLiked = mounted ? isLikedStored : false;
  const isBookmarked = mounted ? isBookmarkedStored : false;
  const savesDelta = mounted ? savesDeltaStored : 0;

  const baseLikes =
    typeof confirmedLikes === "number" ? confirmedLikes : (course.likes ?? 0);
  const likesCount = Math.max(0, baseLikes);
  const baseSaves =
    typeof confirmedSaves === "number" ? confirmedSaves : (course.saves ?? 0);
  const savesCount = Math.max(0, baseSaves + savesDelta);

  const href = course.href || `/community/${numKey || slugKey}`;
  const isSavedRecommended =
    (course.badge === "RECOMMENDED" ||
      course.creationType === "SYSTEM" ||
      course.isSystemCourse) &&
    course.creationType !== "MANUAL" &&
    course.badge !== "MANUAL";
  const isBoni =
    isSavedRecommended ||
    course.name === "Boni" ||
    course.badge === "RECOMMENDED" ||
    course.creationType === "SYSTEM" ||
    course.isSystemCourse;

  const image =
    course.image ||
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=900&fit=crop";

  async function handleLike(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }
    const nextState = !isLiked;
    const nextLikesCount = Math.max(0, likesCount + (nextState ? 1 : -1));
    setLiked(slugKey, nextState, numKey);
    clearLikesDelta(slugKey, numKey);
    setConfirmedLikes(nextLikesCount);

    const postIdNum = Number(course.postId || course.id);
    if (postIdNum && !Number.isNaN(postIdNum)) {
      try {
        if (nextState) await likeCourse(postIdNum);
        else await unlikeCourse(postIdNum);
        clearLikesDelta(slugKey, numKey);
      } catch (err) {
        console.warn("[Mypage Card Like] error:", err);
        setLiked(slugKey, !nextState, numKey);
        clearLikesDelta(slugKey, numKey);
        setConfirmedLikes(likesCount);
      }
    }
  }

  async function handleBookmark(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }
    const nextState = !isBookmarked;
    setBookmarked(slugKey, nextState, numKey);

    const postIdNum = Number(course.postId || course.id);
    if (postIdNum && !Number.isNaN(postIdNum)) {
      try {
        const res = nextState
          ? await bookmarkCourse(postIdNum)
          : await unbookmarkCourse(postIdNum);
        const count = res?.bookmarkCount ?? res?.savesCount ?? res?.saves;
        if (typeof count === "number") {
          setConfirmedSaves(count);
          clearSavesDelta(slugKey, numKey);
        }
      } catch (err) {
        console.warn("[Mypage Card Bookmark] error:", err);
      }
    }
  }

  function handleCommentClick(e) {
    e.preventDefault();
    e.stopPropagation();
    router.push(href);
  }

  return (
    <Link
      href={href}
      className="group relative flex aspect-[3/4] min-w-0 w-full cursor-pointer flex-col justify-between overflow-hidden rounded-[20px] bg-slate-950 shadow-[0_8px_24px_rgba(30,15,70,0.15)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_36px_rgba(30,15,70,0.35)] lg:h-full lg:min-h-[232px] lg:max-h-[276px] lg:aspect-auto lg:rounded-[22px]"
    >
      {/* Full Background Image */}
      <img
        src={image}
        alt={course.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Top Gradient */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 via-black/35 to-transparent pointer-events-none" />

      {/* Bottom Gradient */}
      <div className="absolute inset-x-0 bottom-0 h-48 sm:h-52 bg-gradient-to-t from-black/95 via-black/55 to-transparent pointer-events-none" />

      {/* Top Header Overlay */}
      <div className="relative z-10 flex min-w-0 items-start justify-between gap-2 p-3 lg:p-4">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden rounded-xl border border-white/10 bg-black/40 px-2 py-1.5 backdrop-blur-xs lg:gap-2 lg:px-2.5">
          <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-[#5c2ef5] text-[9px] font-black leading-none whitespace-nowrap text-white shadow-xs lg:size-6 lg:rounded-lg lg:text-[11px]">
            {course.badge === "MY COURSE"
              ? "ME"
              : course.badge === "SHARED"
                ? mypageT("sharedBadge")
                : "★"}
          </span>
          {isBoni ? (
            <div className="size-4.5 shrink-0 overflow-hidden rounded-full border border-purple-300/40 bg-white shadow-xs lg:size-5">
              <img
                src="/assets/ai-course/boni-profile.png"
                alt="Boni"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <span className="shrink-0 text-xs leading-none lg:text-sm">
              {getFlagEmoji(course.country || course.flag)}
            </span>
          )}
          <div className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-[11px] font-bold text-white">
              {isBoni ? "Boni" : (course.name || t("traveler"))}
            </span>
            {course.badge === "SHARED" ? null : (
              <span className="block truncate text-[10px] font-semibold text-violet-200">
                {course.hash || mypageT("recommendedHash")}
              </span>
            )}
          </div>
        </div>

        {onEdit ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(course);
            }}
            title={mypageT("editPost")}
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/40 text-white shadow-sm backdrop-blur-xs transition hover:bg-brand"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
        ) : null}
      </div>

      {/* Bottom Content Area */}
      <div className="relative z-10 flex min-w-0 flex-col gap-2 p-3 pt-0 lg:p-4 lg:pt-0">
        <div className="flex min-w-0 flex-col gap-0.5 lg:gap-1">
          <h3 className="line-clamp-2 break-keep text-[13px] font-black leading-snug text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] lg:text-[20px]">
            {course.title}
          </h3>
          {course.description ? (
            <p className="line-clamp-2 break-keep text-[10px] font-medium leading-snug text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] lg:line-clamp-1 lg:text-[11px]">
              {course.description}
            </p>
          ) : null}
        </div>

        {/* Bottom Stats Toolbar - 커뮤니티 게시물만 노출, 기본 추천 코스는 미노출 */}
        {!isSavedRecommended ? (
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-1 pt-0.5 text-[10px] font-bold text-white lg:gap-2 lg:text-[11px]">
            {/* 좋아요 버튼 */}
            <button
              type="button"
              onClick={handleLike}
              aria-label={t("like")}
              className={`flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-1 transition shadow-xs cursor-pointer sm:gap-1 sm:px-2.5 ${
                isLiked
                  ? "bg-red-500 text-white scale-105"
                  : "bg-black/40 backdrop-blur-xs text-white border border-white/10 hover:bg-white/20"
              }`}
            >
              <svg
                className={`size-3.5 ${isLiked ? "fill-current" : "fill-none"}`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>{likesCount}</span>
            </button>

            {/* 댓글 버튼 */}
            <button
              type="button"
              onClick={handleCommentClick}
              aria-label={t("comments")}
              className="flex shrink-0 items-center gap-0.5 rounded-full border border-white/10 bg-black/40 px-1.5 py-1 text-white backdrop-blur-xs transition hover:bg-white/20 cursor-pointer sm:gap-1 sm:px-2.5"
            >
              <svg
                className="size-3.5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>{course.comments ?? 0}</span>
            </button>

            {/* 북마크 버튼 */}
            <button
              type="button"
              onClick={handleBookmark}
              aria-label={t("save")}
              className={`flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-1 transition shadow-xs cursor-pointer sm:gap-1 sm:px-2.5 ${
                isBookmarked
                  ? "bg-brand text-white scale-105"
                  : "bg-black/40 backdrop-blur-xs text-white border border-white/10 hover:bg-white/20"
              }`}
            >
              <svg
                className={`size-3.5 ${isBookmarked ? "fill-current" : "fill-none"}`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              <span>{savesCount}</span>
            </button>
          </div>
        ) : null}
      </div>
    </Link>
  );
}
