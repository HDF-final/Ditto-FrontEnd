"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import { useCommunityInteractionsStore } from "@/stores/use-community-interactions-store";
import { useCommunityPostImagesStore } from "@/stores/use-community-post-images-store";
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
  onDelete,
}) {
  const t = useTranslations("community");
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const mounted = useIsMounted();
  const getPostImage = useCommunityPostImagesStore((state) => state.getPostImage);

  const slugKey = course.slug ? String(course.slug) : "";
  const numKey = String(course.postId || course.courseId || course.id || "1");

  const isLikedStored = useCommunityInteractionsStore((state) =>
    state.isLiked(slugKey, numKey),
  );
  const isBookmarkedStored = useCommunityInteractionsStore((state) =>
    state.isBookmarked(slugKey, numKey),
  );
  const likesDeltaStored = useCommunityInteractionsStore((state) =>
    state.getLikesDelta(slugKey, numKey),
  );
  const setLiked = useCommunityInteractionsStore((state) => state.setLiked);
  const setBookmarked = useCommunityInteractionsStore((state) => state.setBookmarked);

  const isLiked = mounted ? isLikedStored : false;
  const isBookmarked = mounted ? isBookmarkedStored : false;
  const likesDelta = mounted ? likesDeltaStored : 0;

  const baseLikes = course.likes ?? 0;
  const likesCount = Math.max(0, baseLikes + likesDelta);
  const baseSaves = course.saves ?? 0;
  const savesCount = Math.max(0, baseSaves + (isBookmarked ? 1 : 0));

  const href = course.href || `/community/${numKey || slugKey}`;

  const customImage = mounted
    ? getPostImage(course.postId) ||
      getPostImage(course.courseId) ||
      getPostImage(course.id) ||
      getPostImage(slugKey) ||
      getPostImage(numKey)
    : null;

  const image =
    customImage ||
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
    setLiked(slugKey, nextState, numKey);

    const postIdNum = Number(course.postId || course.id);
    if (postIdNum && !Number.isNaN(postIdNum)) {
      try {
        if (nextState) await likeCourse(postIdNum);
        else await unlikeCourse(postIdNum);
      } catch (err) {
        console.warn("[Mypage Card Like] error:", err);
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
        if (nextState) await bookmarkCourse(postIdNum);
        else await unbookmarkCourse(postIdNum);
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
      className="group relative flex flex-col justify-between overflow-hidden rounded-[20px] sm:rounded-[22px] aspect-[4/3] sm:aspect-[3/4] w-full bg-slate-950 shadow-[0_8px_24px_rgba(30,15,70,0.15)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_36px_rgba(30,15,70,0.35)] cursor-pointer"
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
      <div className="relative z-10 p-3.5 sm:p-4 flex items-start justify-between">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-white/10">
          <span className="flex size-5.5 sm:size-6 items-center justify-center rounded-lg bg-[#5c2ef5] text-[10px] sm:text-[11px] font-black text-white shadow-xs shrink-0">
            {course.badge === "MY COURSE" ? "ME" : course.badge === "SHARED" ? "공유" : "★"}
          </span>
          <span className="text-xs sm:text-sm leading-none shrink-0">{getFlagEmoji(course.country || course.flag)}</span>
          <div className="flex items-center gap-1.5 sm:flex-col sm:items-start leading-tight">
            <span className="text-xs sm:text-[11px] font-bold text-white drop-shadow-xs whitespace-nowrap">{course.name || t("traveler")}</span>
            <span className="text-[10px] sm:text-[10px] font-semibold text-violet-200 drop-shadow-xs whitespace-nowrap">{course.hash || "#더현대 #추천코스"}</span>
          </div>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1.5 z-20">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(course);
                }}
                title="게시글 수정"
                className="flex size-6.5 sm:size-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-xs transition hover:bg-brand border border-white/15 cursor-pointer shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(course);
                }}
                title="게시글 삭제"
                className="flex size-6.5 sm:size-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-xs transition hover:bg-red-500 border border-white/15 cursor-pointer shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Content Area */}
      <div className="relative z-10 p-3.5 sm:p-4 pt-0 flex flex-col gap-2">
        <div className="flex flex-col gap-0.5 sm:gap-1">
          <h3 className="text-lg sm:text-[19px] lg:text-[20px] font-black text-white leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] line-clamp-1 sm:line-clamp-2">
            {course.title}
          </h3>
          {course.description && (
            <p className="text-xs sm:text-[11px] font-medium text-white/90 line-clamp-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {course.description}
            </p>
          )}
        </div>

        {/* Bottom Stats Toolbar */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 text-xs sm:text-[11px] font-bold text-white pt-0.5">
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
            <svg className="size-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
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
      </div>
    </Link>
  );
}
