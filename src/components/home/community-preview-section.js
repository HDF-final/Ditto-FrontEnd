"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/home/section-heading";
import { useDragCarousel } from "@/hooks/use-drag-carousel";
import { useAuthStore } from "@/stores/use-auth-store";
import { useCommunityInteractionsStore } from "@/stores/use-community-interactions-store";
import { useCommunityPostAuthorsStore } from "@/stores/use-community-post-authors-store";
import { useIsMounted } from "@/hooks/use-is-mounted";
import {
  likeCourse,
  unlikeCourse,
  bookmarkCourse,
  unbookmarkCourse,
} from "@/lib/api/community";

function readCount(value) {
  const count = Number(value);
  return Number.isFinite(count) ? count : 0;
}

function getCoursePostId(course = {}) {
  return (
    course.postId ||
    course.id ||
    course.courseId ||
    (typeof course.slug === "number" || /^\d+$/.test(String(course.slug || ""))
      ? Number(course.slug)
      : course.rank || 1)
  );
}

function getCourseKeys(course = {}) {
  const postId = getCoursePostId(course);
  return {
    slugKey: course.slug ? String(course.slug) : "",
    numKey: String(course.postId || course.rank || postId || "1"),
  };
}

function getStoredLikesDelta(course = {}, likesDelta = {}) {
  const { slugKey, numKey } = getCourseKeys(course);
  return readCount(likesDelta?.[slugKey] ?? likesDelta?.[numKey] ?? 0);
}

function getVisibleLikes(course = {}, likesDelta = {}) {
  return Math.max(
    0,
    readCount(course.likes ?? course.likeCount) +
      getStoredLikesDelta(course, likesDelta),
  );
}

function sortCoursesByVisiblePopularity(courses = [], likesDelta = {}) {
  return [...courses]
    .sort((a, b) => {
      const likeDiff = getVisibleLikes(b, likesDelta) - getVisibleLikes(a, likesDelta);
      if (likeDiff !== 0) return likeDiff;

      const saveDiff =
        readCount(b.saves ?? b.bookmarkCount) -
        readCount(a.saves ?? a.bookmarkCount);
      if (saveDiff !== 0) return saveDiff;

      const commentDiff =
        readCount(b.comments ?? b.commentCount) -
        readCount(a.comments ?? a.commentCount);
      if (commentDiff !== 0) return commentDiff;

      return readCount(b.postId) - readCount(a.postId);
    })
    .slice(0, 9)
    .map((course, index) => ({ ...course, rank: index + 1 }));
}

function CommunityCourseCard({ course, onAuthRequired, className = "" }) {
  const t = useTranslations("home");
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const mounted = useIsMounted();
  const getPostAuthor = useCommunityPostAuthorsStore(
    (state) => state.getPostAuthor,
  );
  const localAuthor = mounted
    ? getPostAuthor(course.postId, course.courseId, course.slug, course.rank)
    : null;
  const authorName =
    course.name ||
    course.writerNickname ||
    course.authorNickname ||
    course.userNickname ||
    course.nickname ||
    localAuthor?.name ||
    "DITTO 여행자";

  const postId = getCoursePostId(course);
  const { slugKey, numKey } = getCourseKeys(course);

  const isLikedStored = useCommunityInteractionsStore((state) =>
    state.isLiked(slugKey, numKey),
  );
  const isBookmarkedStored = useCommunityInteractionsStore((state) =>
    state.isBookmarked(slugKey, numKey),
  );
  const likesDeltaStored = useCommunityInteractionsStore((state) =>
    state.getLikesDelta(slugKey, numKey),
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
  const likesDelta = mounted ? likesDeltaStored : 0;
  const savesDelta = mounted ? savesDeltaStored : 0;

  const baseLikes =
    typeof confirmedLikes === "number"
      ? confirmedLikes
      : readCount(course.likes ?? course.likeCount);
  const likesCount = Math.max(0, baseLikes + likesDelta);
  const baseSaves =
    typeof confirmedSaves === "number"
      ? confirmedSaves
      : readCount(course.saves ?? course.bookmarkCount);
  const savesCount = Math.max(0, baseSaves + savesDelta);

  const href = `/community/${course.slug || course.rank || "1"}`;
  const review = course.review || course.description;

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

    if (postId) {
      try {
        if (nextState) await likeCourse(postId);
        else await unlikeCourse(postId);
        setConfirmedLikes(nextLikesCount);
        clearLikesDelta(slugKey, numKey);
      } catch (err) {
        console.warn("[Home Card Like] error:", err);
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

    if (postId) {
      try {
        const res = nextState
          ? await bookmarkCourse(postId)
          : await unbookmarkCourse(postId);
        const count = res?.bookmarkCount ?? res?.savesCount ?? res?.saves;
        if (typeof count === "number") {
          setConfirmedSaves(count);
          clearSavesDelta(slugKey, numKey);
        }
      } catch (err) {
        console.warn("[Home Card Bookmark] error:", err);
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
      className={`group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[18px] aspect-[4/3] bg-slate-950 shadow-[0_14px_36px_rgba(30,15,70,0.3)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_44px_rgba(30,15,70,0.45)] lg:aspect-[3/4] lg:rounded-[26px] ${className}`}
    >
      {/* Full Background Image */}
      <img
        src={course.image}
        alt={course.title}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Top Gradient for text legibility */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/80 via-black/35 to-transparent lg:h-28" />

      {/* Bottom Gradient for title and metrics legibility */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/95 via-black/55 to-transparent lg:h-60" />

      {/* Top Header Overlay (Transparent background) */}
      <div className="relative z-10 flex min-w-0 items-start justify-between p-3 lg:p-5">
        <div className="inline-flex max-w-full items-center gap-2.5 rounded-full border border-white/15 bg-black/35 px-2.5 py-1.5 shadow-[0_8px_18px_rgba(0,0,0,0.18)] backdrop-blur-md lg:px-3.5 lg:py-2">
          {/* Rank Badge */}
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#5c2ef5] text-[11px] font-black text-white shadow-sm lg:size-8 lg:text-[13px]">
            {course.rank}
          </span>
          {/* Name */}
          <div className="min-w-0 leading-none">
            <span className="block max-w-[126px] truncate text-xs font-black text-white drop-shadow-sm lg:max-w-[172px] lg:text-sm">
              {authorName}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Content Area (Transparent overlay on image) */}
      <div className="relative z-10 flex flex-col gap-2 p-3 pt-0 lg:gap-3 lg:p-5 lg:pt-0">
        {/* Title & Description */}
        <div className="flex flex-col gap-0.5 lg:gap-1.5">
          <h3 className="line-clamp-2 text-[15px] font-black leading-snug text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] lg:text-2xl">
            {course.title}
          </h3>
          {review ? (
            <p className="line-clamp-1 text-[11px] font-medium text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] lg:text-xs">
              {review}
            </p>
          ) : null}
        </div>

        {/* Bottom Interactive Stats */}
        <div className="flex items-center justify-end gap-2 pt-0.5 text-sm font-bold text-white/95 lg:gap-3.5 lg:text-base">
          {/* Like button */}
          <button
            type="button"
            onClick={handleLike}
            aria-label={t("like")}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2 py-1 backdrop-blur-2xs transition lg:px-3 ${
              isLiked
                ? "bg-red-500/30 text-red-400 font-black shadow-xs scale-105"
                : "hover:bg-white/20 text-white/90"
            }`}
          >
            <svg
              className={`size-5 ${isLiked ? "fill-current text-red-500" : "text-white/90"}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>{likesCount}</span>
          </button>

          {/* Comment button */}
          <button
            type="button"
            onClick={handleCommentClick}
            aria-label={t("comment")}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2 py-1 text-white/90 backdrop-blur-2xs transition hover:bg-white/20 lg:px-3"
          >
            <svg className="size-5 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>{course.comments ?? 0}</span>
          </button>

          {/* Bookmark/Save button */}
          <button
            type="button"
            onClick={handleBookmark}
            aria-label={t("save")}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2 py-1 backdrop-blur-2xs transition lg:px-3 ${
              isBookmarked
                ? "bg-brand/40 text-violet-300 font-black shadow-xs scale-105"
                : "hover:bg-white/20 text-white/90"
            }`}
          >
            <svg
              className={`size-5 ${isBookmarked ? "fill-current text-brand" : "text-white/90"}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
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

function CommunitySlider({
  courses,
  itemsPerSlide,
  columnsClassName,
  onAuthRequired,
  isPaused,
  enableDrag = false,
  cardClassName = "",
}) {
  const t = useTranslations("home");
  const slides = [];
  for (let i = 0; i < courses.length; i += itemsPerSlide) {
    slides.push(courses.slice(i, i + itemsPerSlide));
  }
  const totalSlides = slides.length || 1;

  const {
    index: currentSlide,
    setIndex: setCurrentSlide,
    dragging,
    viewportRef,
    trackStyle,
    handlers,
  } = useDragCarousel({
    length: totalSlides,
    auto: true,
    interval: 4000,
    paused: isPaused,
  });

  return (
    <>
      <div
        ref={enableDrag ? viewportRef : undefined}
        className={`relative w-full overflow-hidden pb-2 pt-1 lg:pb-4 lg:pt-2 ${
          enableDrag ? "select-none" : ""
        } ${enableDrag && dragging ? "cursor-grabbing" : ""}`}
        {...(enableDrag ? handlers : {})}
      >
        <div className="flex" style={trackStyle}>
          {slides.map((slideItems, slideIdx) => (
            <div
              key={slideIdx}
              className={`grid min-w-full shrink-0 basis-full items-stretch gap-4 px-0.5 lg:gap-6 ${columnsClassName}`}
            >
              {slideItems.map((course) => (
                <CommunityCourseCard
                  key={course.rank}
                  course={course}
                  onAuthRequired={onAuthRequired}
                  className={cardClassName}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 flex items-center justify-center gap-2 lg:mt-8 lg:gap-2.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentSlide === idx
                ? "w-7 bg-white shadow-sm"
                : "w-2.5 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={t("courseListItem", { index: idx + 1 })}
            aria-current={currentSlide === idx}
          />
        ))}
      </div>
    </>
  );
}

function DesktopCommunityActions({ course, detailHref, onAuthRequired }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const mounted = useIsMounted();
  const [copied, setCopied] = useState(false);
  const slugKey = course.slug ? String(course.slug) : "";
  const postId = course.postId || course.id || course.courseId || course.rank;
  const numKey = String(postId || "1");
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
  const setBookmarked = useCommunityInteractionsStore(
    (state) => state.setBookmarked,
  );
  const isLiked = mounted ? isLikedStored : false;
  const isBookmarked = mounted ? isBookmarkedStored : false;
  const likesDelta = mounted ? likesDeltaStored : 0;
  const likesCount = Math.max(
    0,
    readCount(course.likes ?? course.likeCount) + likesDelta,
  );

  async function handleLike() {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    const nextState = !isLiked;
    setLiked(slugKey, nextState, numKey);
    try {
      if (nextState) await likeCourse(postId);
      else await unlikeCourse(postId);
    } catch (err) {
      console.warn("[Home Feature Like] error:", err);
    }
  }

  async function handleBookmark() {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    const nextState = !isBookmarked;
    setBookmarked(slugKey, nextState, numKey);
    try {
      if (nextState) await bookmarkCourse(postId);
      else await unbookmarkCourse(postId);
    } catch (err) {
      console.warn("[Home Feature Bookmark] error:", err);
    }
  }

  async function handleShare() {
    if (typeof window === "undefined") return;
    const url = new URL(detailHref, window.location.origin).toString();

    try {
      if (navigator.share) {
        await navigator.share({ title: course.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.warn("[Home Feature Share] error:", err);
      }
    }
  }

  const actionClass =
    "inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-[#e5dff3] bg-white text-[#6d6680] shadow-[0_8px_20px_rgba(70,48,130,0.08)] transition hover:-translate-y-0.5 hover:border-brand/35 hover:bg-brand-soft/35 hover:text-brand";
  const likeActionClass =
    "inline-flex h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-[#e5dff3] bg-white px-3 text-[#6d6680] shadow-[0_8px_20px_rgba(70,48,130,0.08)] transition hover:-translate-y-0.5 hover:border-brand/35 hover:bg-brand-soft/35 hover:text-brand";

  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        onClick={handleLike}
        aria-label="찜하기"
        title="찜하기"
        className={`${likeActionClass} ${isLiked ? "border-brand/30 bg-brand-soft text-brand" : ""}`}
      >
        <svg className="size-5" viewBox="0 0 24 24" fill="none">
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            fill={isLiked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-sm font-black leading-none">{likesCount}</span>
      </button>
      <button
        type="button"
        onClick={handleBookmark}
        aria-label="저장하기"
        title="저장하기"
        className={`${actionClass} ${isBookmarked ? "border-brand/30 bg-brand-soft text-brand" : ""}`}
      >
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill={isBookmarked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={handleShare}
        aria-label="공유하기"
        title={copied ? "링크가 복사되었습니다" : "공유하기"}
        className={`${actionClass} ${copied ? "border-brand bg-brand text-white" : ""}`}
      >
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="18" cy="5" r="2.5" />
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="19" r="2.5" />
          <path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" />
        </svg>
      </button>
    </div>
  );
}

function DesktopCommunityFeatureSlider({ courses, onAuthRequired }) {
  const t = useTranslations("home");
  const communityT = useTranslations("community");
  const featuredCourses = courses.slice(0, 3);
  const { index, setIndex, dragging, viewportRef, trackStyle, handlers } =
    useDragCarousel({
      length: featuredCourses.length,
      auto: true,
      interval: 5200,
    });

  if (featuredCourses.length === 0) {
    return (
      <div className="rounded-[34px] border border-[#e4def5] bg-white/80 p-12 text-center text-sm font-bold text-ink-muted shadow-[0_26px_70px_rgba(74,47,168,0.1)]">
        {t("emptyCommunityCourses")}
      </div>
    );
  }

  return (
    <div className="mx-auto w-[min(86vw,1320px)]">
      <div
        ref={viewportRef}
        className={`relative overflow-hidden rounded-[36px] select-none shadow-[0_30px_80px_rgba(50,32,110,0.16)] ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        {...handlers}
      >
        <div className="flex" style={trackStyle}>
          {featuredCourses.map((course, slideIndex) => {
            const courseId = course.courseId || course.id;
            const detailHref = `/community/${course.slug || course.rank || "1"}`;
            const customizeHref = courseId
              ? `/ai-course?courseId=${encodeURIComponent(String(courseId))}`
              : "/ai-course";

            return (
              <article
                key={course.postId || course.slug || course.rank}
                className="relative grid h-[clamp(420px,calc(100dvh-270px),540px)] min-w-full shrink-0 basis-full grid-cols-[minmax(0,1.12fr)_minmax(430px,0.88fr)] overflow-hidden bg-white"
              >
                <Link
                  href={detailHref}
                  className="group relative block h-full min-w-0 overflow-hidden"
                >
                  <img
                    src={course.image}
                    alt={course.title}
                    draggable={false}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-black/5" />
                  <div className="absolute bottom-8 left-8 rounded-full border border-white/30 bg-black/35 px-5 py-2.5 text-base font-black text-white backdrop-blur-md">
                    {t("travelerCourseBadge")}
                  </div>
                </Link>

                <div className="relative flex min-w-0 flex-col justify-center bg-[#fffefe] px-[clamp(42px,3.8vw,68px)] py-[clamp(10px,1.6dvh,32px)]">
                  <span className="text-sm font-black tracking-[0.22em] text-brand">
                    TOP {course.rank || slideIndex + 1}
                  </span>
                  <h3 className="mt-[clamp(8px,1.4dvh,20px)] line-clamp-2 text-[clamp(26px,2.15vw,42px)] font-black leading-[1.18] tracking-[-0.025em] text-ink">
                    {course.title}
                  </h3>
                  <div className="mt-[clamp(8px,1.4dvh,20px)] rounded-[22px] border border-brand/10 bg-[#f7f5ff] px-5 py-[clamp(8px,1.2dvh,16px)]">
                    <span className="inline-flex rounded-full border border-brand/20 bg-white px-3 py-1 text-xs font-black text-brand shadow-sm">
                      {t("authorReviewLabel")}
                    </span>
                    <div className="mt-[clamp(6px,1.2dvh,12px)] flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="shrink-0 text-3xl font-black leading-none text-brand/55"
                      >
                        “
                      </span>
                      <p className="line-clamp-3 text-[clamp(14px,0.94vw,16px)] font-semibold leading-[1.7] text-[#6d6680]">
                        {course.review ||
                          course.description ||
                          t("authorReviewFallback")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-[clamp(6px,1.4dvh,24px)] flex flex-wrap items-center gap-2 text-sm font-bold text-brand">
                    <span className="rounded-full bg-brand-soft px-3 py-1.5">
                      #{course.country || "GLOBAL"}
                    </span>
                    <span className="rounded-full bg-brand-soft px-3 py-1.5">
                      {course.hash || "#여행자코스"}
                    </span>
                  </div>

                  <div className="mt-[clamp(8px,1.4dvh,28px)]">
                    <DesktopCommunityActions
                      course={course}
                      detailHref={detailHref}
                      onAuthRequired={onAuthRequired}
                    />
                  </div>

                  <div className="mt-[clamp(8px,1.4dvh,28px)] grid grid-cols-2 gap-4">
                    <Link
                      href={customizeHref}
                      className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-black text-white shadow-[0_14px_28px_rgba(92,46,245,0.24)] transition hover:-translate-y-0.5 hover:bg-brand-dark"
                    >
                      <span className="text-xl font-light leading-none">＋</span>
                      {t("customizeCourse")}
                    </Link>
                    <Link
                      href={detailHref}
                      className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-[#ded8ef] bg-white px-6 text-sm font-black text-[#69627d] shadow-sm transition hover:-translate-y-0.5 hover:border-brand/35 hover:text-brand"
                    >
                      <svg
                        aria-hidden="true"
                        className="size-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      {communityT("joinConversation")}
                    </Link>
                  </div>

                  <div className="mt-[clamp(6px,1.4dvh,24px)] flex items-center gap-2">
                    {featuredCourses.map((_, dotIndex) => (
                      <button
                        key={dotIndex}
                        type="button"
                        onClick={() => setIndex(dotIndex)}
                        aria-label={t("popularCommunitySlide", {
                          index: dotIndex + 1,
                        })}
                        aria-current={index === dotIndex}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === dotIndex
                            ? "w-8 bg-brand"
                            : "w-2 bg-[#d8d1eb] hover:bg-brand/45"
                        }`}
                      />
                    ))}
                  </div>

                  <span className="pointer-events-none absolute -left-4 -top-4 size-8 rounded-full bg-[#f3f0fb] shadow-inner" />
                  <span className="pointer-events-none absolute -bottom-4 -left-4 size-8 rounded-full bg-[#f3f0fb] shadow-inner" />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function CommunityPreviewSection({ initialCourses = [] }) {
  const t = useTranslations("home");
  const common = useTranslations("common");
  const router = useRouter();
  const mounted = useIsMounted();
  const likesDeltaMap = useCommunityInteractionsStore((state) => state.likesDelta);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const courses = useMemo(
    () =>
      sortCoursesByVisiblePopularity(
        initialCourses,
        mounted ? likesDeltaMap : {},
      ),
    [initialCourses, likesDeltaMap, mounted],
  );

  return (
    <section
      id="community"
      className="home-snap-panel scroll-mt-16 bg-linear-to-br from-[#2d1b8e] via-[#4a2fa8] to-[#6d28d9] px-5 py-5 lg:flex lg:scroll-mt-0 lg:bg-[radial-gradient(circle_at_12%_18%,rgba(166,139,255,0.14),transparent_28%),radial-gradient(circle_at_88%_76%,rgba(111,67,220,0.1),transparent_32%),linear-gradient(135deg,#f8f6fd_0%,#f1edfb_100%)] lg:px-0 lg:py-0"
    >
      <div className="home-content-boundary lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:justify-center lg:py-[clamp(28px,5dvh,56px)]">
        <div className="lg:hidden">
          <SectionHeading
            eyebrow="TRAVELER COMMUNITY"
            title={t("communityTitle")}
            description={t("communityDescription")}
            href="/community"
            linkLabel={t("browseCommunity")}
            inverse
          />
        </div>

        <div className="lg:hidden">
          {courses.length > 0 ? (
            <CommunitySlider
              courses={courses}
              itemsPerSlide={1}
              columnsClassName="grid-cols-1"
              onAuthRequired={() => setIsLoginModalOpen(true)}
              isPaused={false}
              enableDrag
            />
          ) : (
            <div className="rounded-2xl border border-white/15 bg-white/10 p-8 text-center text-sm font-bold text-white/80">
              {t("emptyCommunityCourses")}
            </div>
          )}
        </div>
        <div className="hidden lg:block">
          <div className="text-center">
            <h2 className="text-5xl font-black leading-[1.18] tracking-[-0.035em] text-ink">
              {t("communityDesktopTitle")}
            </h2>
            <p className="mt-2 text-lg font-semibold leading-8 text-ink-muted">
              {t("communityDesktopDescription")}
            </p>
          </div>
          <div className="home-section-stage flex items-center justify-center">
            <div className="w-full translate-y-[clamp(4px,1dvh,10px)]">
              <DesktopCommunityFeatureSlider
                courses={courses}
                onAuthRequired={() => setIsLoginModalOpen(true)}
              />
            </div>
          </div>
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
                {common("cancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLoginModalOpen(false);
                  router.push("/login");
                }}
                className="flex-1 rounded-full bg-brand py-2.5 text-xs font-black text-white shadow-xs hover:bg-brand-dark transition cursor-pointer"
              >
                {t("loginAction")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
