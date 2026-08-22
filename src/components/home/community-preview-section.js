"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { communityCourses } from "@/lib/fixtures/home";
import { SectionHeading } from "@/components/home/section-heading";
import { useAuthStore } from "@/stores/use-auth-store";
import { useCommunityInteractionsStore } from "@/stores/use-community-interactions-store";
import { useIsMounted } from "@/hooks/use-is-mounted";
import {
  likeCourse,
  unlikeCourse,
  bookmarkCourse,
  unbookmarkCourse,
} from "@/lib/api/community";

function getFlagEmoji(countryCode) {
  if (!countryCode) return "🇰🇷";
  const code = countryCode.toUpperCase();
  if (code === "JP") return "🇯🇵";
  if (code === "CN") return "🇨🇳";
  if (code === "US") return "🇺🇸";
  if (code === "KR") return "🇰🇷";
  return "🌐";
}

function CommunityCourseCard({ course, onAuthRequired }) {
  const t = useTranslations("home");
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const mounted = useIsMounted();

  const postId =
    course.postId ||
    course.id ||
    course.courseId ||
    (typeof course.slug === "number" || /^\d+$/.test(course.slug)
      ? Number(course.slug)
      : course.rank || 1);

  const slugKey = course.slug ? String(course.slug) : "";
  const numKey = String(course.postId || course.rank || postId || "1");

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

  const baseLikes = course.likes ?? 0;
  const likesCount = Math.max(0, baseLikes + likesDelta);
  const baseSaves = course.saves ?? 0;
  const savesCount = Math.max(0, baseSaves + (isBookmarked ? 1 : 0));

  const href = `/community/${course.slug || course.rank || "1"}`;

  async function handleLike(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }
    const nextState = !isLiked;
    setLiked(slugKey, nextState, numKey);

    if (postId) {
      try {
        if (nextState) await likeCourse(postId);
        else await unlikeCourse(postId);
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
        if (nextState) await bookmarkCourse(postId);
        else await unbookmarkCourse(postId);
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
      className="group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[26px] aspect-[3/4] bg-slate-950 shadow-[0_14px_36px_rgba(30,15,70,0.3)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_44px_rgba(30,15,70,0.45)]"
    >
      {/* Full Background Image */}
      <img
        src={course.image}
        alt={course.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Top Gradient for text legibility */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/80 via-black/35 to-transparent pointer-events-none" />

      {/* Bottom Gradient for title and metrics legibility */}
      <div className="absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-black/95 via-black/55 to-transparent pointer-events-none" />

      {/* Top Header Overlay (Transparent background) */}
      <div className="relative z-10 flex items-start justify-between p-4 lg:p-5">
        <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/30 px-3 py-1.5 backdrop-blur-xs">
          {/* Rank Badge */}
          <span className="flex size-7 items-center justify-center rounded-lg bg-[#5c2ef5] text-xs font-black text-white shadow-sm">
            {course.rank}
          </span>
          {/* Flag */}
          <span className="text-base leading-none">{getFlagEmoji(course.flag || course.country)}</span>
          {/* Name & Tag */}
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-xs font-bold text-white drop-shadow-sm">{course.name}</span>
            <span className="truncate text-[11px] font-semibold text-violet-200 drop-shadow-sm">{course.hash}</span>
          </div>
        </div>
      </div>

      {/* Bottom Content Area (Transparent overlay on image) */}
      <div className="relative z-10 flex flex-col gap-3 p-4 pt-0 lg:p-5 lg:pt-0">
        {/* Title & Description */}
        <div className="flex flex-col gap-1.5">
          <h3 className="line-clamp-2 min-h-[3.2rem] text-xl font-black leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] lg:min-h-0 lg:text-2xl">
            {course.title}
          </h3>
          {course.description && (
            <p className="line-clamp-1 text-xs font-medium text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {course.description}
            </p>
          )}
        </div>

        {/* Bottom Interactive Stats */}
        <div className="flex items-center justify-end gap-3.5 pt-1 text-xs font-bold text-white/95">
          {/* Like button */}
          <button
            type="button"
            onClick={handleLike}
            aria-label={t("like")}
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition cursor-pointer backdrop-blur-2xs ${
              isLiked
                ? "bg-red-500/30 text-red-400 font-black shadow-xs scale-105"
                : "hover:bg-white/20 text-white/90"
            }`}
          >
            <svg
              className={`size-4 ${isLiked ? "fill-current text-red-500" : "text-white/90"}`}
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
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition cursor-pointer backdrop-blur-2xs hover:bg-white/20 text-white/90"
          >
            <svg className="size-4 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>{course.comments ?? 0}</span>
          </button>

          {/* Bookmark/Save button */}
          <button
            type="button"
            onClick={handleBookmark}
            aria-label={t("save")}
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition cursor-pointer backdrop-blur-2xs ${
              isBookmarked
                ? "bg-brand/40 text-violet-300 font-black shadow-xs scale-105"
                : "hover:bg-white/20 text-white/90"
            }`}
          >
            <svg
              className={`size-4 ${isBookmarked ? "fill-current text-brand" : "text-white/90"}`}
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
}) {
  const t = useTranslations("home");
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = Math.ceil(courses.length / itemsPerSlide) || 1;
  const slides = [];
  for (let i = 0; i < courses.length; i += itemsPerSlide) {
    slides.push(courses.slice(i, i + itemsPerSlide));
  }

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused, totalSlides]);

  return (
    <>
      <div className="relative w-full overflow-hidden pb-4 pt-2">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
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

export function CommunityPreviewSection() {
  const t = useTranslations("home");
  const common = useTranslations("common");
  const router = useRouter();
  const [isPaused, setIsPaused] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const localizedCourses = communityCourses.map((course) => ({
    ...course,
    hash: t(`communityCourses.${course.slug}.hash`),
    title: t(`communityCourses.${course.slug}.title`),
    description: t(`communityCourses.${course.slug}.description`),
  }));

  return (
    <section
      id="community"
      className="scroll-mt-16 bg-linear-to-br from-[#2d1b8e] via-[#4a2fa8] to-[#6d28d9] px-5 py-8 lg:scroll-mt-[94px] lg:px-52 lg:py-16 xl:px-60 2xl:px-72"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <SectionHeading
        eyebrow="TRAVELER COMMUNITY"
        title={t("communityTitle")}
        description={t("communityDescription")}
        href="/community"
        linkLabel={t("browseCommunity")}
        inverse
      />

      <div className="lg:hidden">
        <CommunitySlider
          courses={localizedCourses}
          itemsPerSlide={1}
          columnsClassName="grid-cols-1"
          onAuthRequired={() => setIsLoginModalOpen(true)}
          isPaused={isPaused}
        />
      </div>
      <div className="hidden lg:block">
        <CommunitySlider
          courses={localizedCourses}
          itemsPerSlide={3}
          columnsClassName="grid-cols-3"
          onAuthRequired={() => setIsLoginModalOpen(true)}
          isPaused={isPaused}
        />
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
