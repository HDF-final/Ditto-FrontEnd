"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import {
  likeCourse,
  unlikeCourse,
  bookmarkCourse,
  unbookmarkCourse,
} from "@/lib/api/community";
import { useCommunityInteractionsStore } from "@/stores/use-community-interactions-store";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { useTranslations } from "next-intl";

const tabs = ["popular", "latest"];
const storageKey = "ditto:shared-community-courses";
const ITEMS_PER_PAGE = 6; // 가로 3개씩 2줄 = 페이지당 6개

function subscribe(callback) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  if (typeof window === "undefined") return "[]";
  return localStorage.getItem(storageKey) || "[]";
}

function getServerSnapshot() {
  return "[]";
}

function getFlagEmoji(countryCode) {
  if (!countryCode) return "🇰🇷";
  const code = countryCode.toUpperCase();
  if (code === "JP") return "🇯🇵";
  if (code === "CN") return "🇨🇳";
  if (code === "US") return "🇺🇸";
  if (code === "KR") return "🇰🇷";
  return "🌐";
}

function CommunityCard({ card, rank, onAuthRequired }) {
  const t = useTranslations("community");
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const postId =
    card.postId ||
    card.courseId ||
    card.id ||
    (typeof card.slug === "number" || /^\d+$/.test(card.slug)
      ? Number(card.slug)
      : rank || 1);

  const href = `/community/${card.postId || card.slug || rank || "1"}`;
  const image =
    card.image ||
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=900&fit=crop";

  const mounted = useIsMounted();

  const slugKey = card.slug ? String(card.slug) : "";
  const numKey = String(card.postId || postId || rank || "1");
  const postIdentifier = slugKey || numKey;

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

  const baseLikes = card.likes ?? 0;
  const likesCount = Math.max(0, baseLikes + likesDelta);
  const baseSaves = card.saves ?? 0;
  const savesCount = Math.max(0, baseSaves + (isBookmarked ? 1 : 0));

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
        console.warn("[Card Like] error:", err);
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
        console.warn("[Card Bookmark] error:", err);
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
      className="group relative flex flex-col justify-between overflow-hidden rounded-[22px] aspect-[3/4] w-full bg-slate-950 shadow-[0_10px_28px_rgba(30,15,70,0.2)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_36px_rgba(30,15,70,0.35)]"
    >
      {/* Full Background Image */}
      <img
        src={image}
        alt={card.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Top Gradient for text legibility */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 via-black/35 to-transparent pointer-events-none" />

      {/* Bottom Gradient for title and metrics legibility */}
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/95 via-black/55 to-transparent pointer-events-none" />

      {/* Top Header Overlay (Transparent background) */}
      <div className="relative z-10 p-4 flex items-start justify-between">
        <div className="flex items-center gap-2 bg-black/35 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-white/10">
          {/* Rank Badge */}
          <span className="flex size-6 items-center justify-center rounded-lg bg-[#5c2ef5] text-[11px] font-black text-white shadow-sm">
            {rank}
          </span>
          {/* Flag */}
          <span className="text-sm leading-none">{getFlagEmoji(card.country || card.flag)}</span>
          {/* Name & Tag */}
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] font-bold text-white drop-shadow-sm">{card.name || t("traveler")}</span>
            <span className="text-[10px] font-semibold text-violet-200 drop-shadow-sm">{card.hash || "#더현대"}</span>
          </div>
        </div>
      </div>

      {/* Bottom Content Area (Transparent overlay on image) */}
      <div className="relative z-10 p-4 pt-0 flex flex-col gap-2.5">
        {/* Title & Description */}
        <div className="flex flex-col gap-1">
          <h3 className="text-[19px] sm:text-[20px] font-black text-white leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] line-clamp-2">
            {card.title}
          </h3>
          {card.description && (
            <p className="text-[11px] font-medium text-white/90 line-clamp-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {card.description}
            </p>
          )}
        </div>

        {/* Bottom Interactive Stats */}
        <div className="flex items-center justify-end gap-2 text-[11px] font-bold text-white/95 pt-1">
          {/* Like button */}
          <button
            type="button"
            onClick={handleLike}
            aria-label={t("like")}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition cursor-pointer backdrop-blur-2xs ${
              isLiked
                ? "bg-red-500/30 text-red-400 font-black shadow-xs scale-105"
                : "hover:bg-white/20 text-white/90"
            }`}
          >
            <svg
              className={`size-3.5 ${isLiked ? "fill-current text-red-500" : "text-white/90"}`}
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
            aria-label={t("comments")}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition cursor-pointer backdrop-blur-2xs hover:bg-white/20 text-white/90"
          >
            <svg className="size-3.5 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>{card.comments ?? 0}</span>
          </button>

          {/* Bookmark/Save button */}
          <button
            type="button"
            onClick={handleBookmark}
            aria-label={t("save")}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition cursor-pointer backdrop-blur-2xs ${
              isBookmarked
                ? "bg-brand/40 text-violet-300 font-black shadow-xs scale-105"
                : "hover:bg-white/20 text-white/90"
            }`}
          >
            <svg
              className={`size-3.5 ${isBookmarked ? "fill-current text-brand" : "text-white/90"}`}
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

export function CommunityCoursePage({ initialCards = [] }) {
  const t = useTranslations("community");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const sharedCardsRaw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const sharedCards = useMemo(() => {
    try {
      const parsed = JSON.parse(sharedCardsRaw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [sharedCardsRaw]);

  const cards = useMemo(() => {
    const combined = [...initialCards, ...sharedCards];

    if (activeTab === "latest") {
      return [...combined].sort((a, b) => (b.postId ?? 0) - (a.postId ?? 0));
    }
    // 기본값: 인기순
    return [...combined].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
  }, [initialCards, sharedCards, activeTab]);

  // 탭 변경 시 1페이지로 리셋
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // 페이징 계산: 페이지당 6개 (가로 3개 x 세로 2줄)
  const totalPages = Math.ceil(cards.length / ITEMS_PER_PAGE) || 1;
  const paginatedCards = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return cards.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [cards, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  return (
    <main className="bg-background min-h-screen">
      <section className="bg-white px-10 sm:px-14 pb-16 pt-[94px] lg:px-52 xl:px-60 2xl:px-72">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black text-brand">
              THE HYUNDAI SEOUL COMMUNITY
            </p>
            <h1 className="mt-6 text-[34px] font-black leading-none text-ink lg:text-[36px]">
              {t("title")}
            </h1>
            <p className="mt-5 text-sm font-medium text-ink-muted">
              {t("description")}
            </p>
            <div className="mt-6 flex gap-10 border-b border-line">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  className={`-mb-px border-b-2 pb-3 text-sm font-black transition cursor-pointer ${
                    activeTab === tab
                      ? "border-brand text-brand"
                      : "border-transparent text-ink-muted hover:text-ink"
                  }`}
                >
                  {t(tab)}
                </button>
              ))}
            </div>
          </div>
          <Link
            href="/community/share"
            className="inline-flex w-fit items-center justify-center rounded-full bg-brand px-8 py-4 text-sm font-black text-white shadow-control transition hover:bg-brand-dark"
          >
            {t("shareMine")}
          </Link>
        </div>
      </section>

      <section className="bg-surface-soft px-10 sm:px-14 py-14 lg:px-52 xl:px-60 2xl:px-72">
        <div className="max-w-[1020px] mx-auto">
          {/* 가로 3개씩 배치 */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedCards.map((card, index) => {
              const actualRank = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
              return (
                <CommunityCard
                  key={`${card.postId || card.slug || card.name}-${card.title}-${index}`}
                  card={card}
                  rank={actualRank}
                  onAuthRequired={() => setIsLoginModalOpen(true)}
                />
              );
            })}
          </div>

          {/* 페이징 컨트롤 바 렌더링 */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              {/* 이전 버튼 */}
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex size-9 items-center justify-center rounded-xl font-bold transition ${
                  currentPage === 1
                    ? "cursor-not-allowed text-ink-muted/40 border border-line bg-white/50"
                    : "cursor-pointer border border-line bg-white text-ink hover:border-brand hover:text-brand shadow-xs"
                }`}
                aria-label={t("previousPage")}
              >
                ‹
              </button>

              {/* 페이지 번호 버튼들 */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageChange(pageNum)}
                  className={`flex size-9 items-center justify-center rounded-xl text-xs font-black transition cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-brand text-white shadow-md"
                      : "border border-line bg-white text-ink-muted hover:border-brand hover:text-brand shadow-xs"
                  }`}
                  aria-current={currentPage === pageNum ? "page" : undefined}
                >
                  {pageNum}
                </button>
              ))}

              {/* 다음 버튼 */}
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex size-9 items-center justify-center rounded-xl font-bold transition ${
                  currentPage === totalPages
                    ? "cursor-not-allowed text-ink-muted/40 border border-line bg-white/50"
                    : "cursor-pointer border border-line bg-white text-ink hover:border-brand hover:text-brand shadow-xs"
                }`}
                aria-label={t("nextPage")}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </section>

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
    </main>
  );
}
