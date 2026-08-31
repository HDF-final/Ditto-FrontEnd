"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import {
  likeCourse,
  unlikeCourse,
  bookmarkCourse,
  unbookmarkCourse,
} from "@/lib/api/community";
import { useCommunityInteractionsStore } from "@/stores/use-community-interactions-store";
import { useCommunityPostAuthorsStore } from "@/stores/use-community-post-authors-store";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { useTranslations } from "next-intl";
import { PlaceModal } from "@/components/ai-course/recommend/place-modal";

const tabs = ["popular", "latest"];
const MOBILE_ITEMS_PER_PAGE = 2;
const DESKTOP_ITEMS_PER_PAGE = 6;

function readLikeCount(response) {
  if (typeof response?.likesCount === "number") return response.likesCount;
  if (typeof response?.likeCount === "number") return response.likeCount;
  if (typeof response?.likes === "number") return response.likes;
  return null;
}

function readBookmarkCount(response) {
  if (typeof response?.bookmarkCount === "number") return response.bookmarkCount;
  if (typeof response?.savesCount === "number") return response.savesCount;
  if (typeof response?.saves === "number") return response.saves;
  return null;
}

function getCommunityCardIdentity(card, rank) {
  const postId =
    card.postId ||
    card.courseId ||
    card.id ||
    (typeof card.slug === "number" || /^\d+$/.test(card.slug)
      ? Number(card.slug)
      : rank || 1);
  const slugKey = card.slug ? String(card.slug) : "";
  const numKey = String(card.postId || postId || rank || "1");

  return {
    postId,
    slugKey,
    numKey,
    cardKey: `${slugKey}:${numKey}`,
  };
}

function readStoredLikesDelta(likesDeltaMap, slugKey, numKey) {
  return (
    (slugKey && likesDeltaMap?.[slugKey]) ||
    (numKey && likesDeltaMap?.[numKey]) ||
    0
  );
}

function getDisplayLikeCount(card, {
  rank,
  likesDeltaMap = {},
  confirmedLikesByKey = {},
} = {}) {
  const { slugKey, numKey, cardKey } = getCommunityCardIdentity(card, rank);
  const confirmedLikes = confirmedLikesByKey[cardKey];
  const baseLikes =
    typeof confirmedLikes === "number" ? confirmedLikes : (card.likes ?? 0);
  const likesDelta = readStoredLikesDelta(likesDeltaMap, slugKey, numKey);

  return Math.max(0, baseLikes + likesDelta);
}

function CommunityCard({
  card,
  rank,
  confirmedLikes,
  confirmedSaves,
  onAuthRequired,
  onLikeConfirmed,
  onBookmarkConfirmed,
}) {
  const t = useTranslations("community");
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { postId, slugKey, numKey, cardKey } = getCommunityCardIdentity(card, rank);
  const href = `/community/${card.postId || card.slug || rank || "1"}`;
  const mounted = useIsMounted();
  const getPostAuthor = useCommunityPostAuthorsStore(
    (state) => state.getPostAuthor,
  );

  const image = card.image || null;
  const localAuthor = mounted
    ? getPostAuthor(card.postId, card.courseId, slugKey, numKey)
    : null;
  const gradient = card.gradient || "from-[#2d1b8e] via-[#5c2ef5] to-[#8c57fa]";
  const displayName =
    card.name ||
    card.writerNickname ||
    card.authorNickname ||
    card.userNickname ||
    card.nickname ||
    localAuthor?.name ||
    "DITTO 여행자";

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
  const setBookmarked = useCommunityInteractionsStore((state) => state.setBookmarked,
  );
  const clearSavesDelta = useCommunityInteractionsStore(
    (state) => state.clearSavesDelta,
  );

  const isLiked = mounted ? isLikedStored : false;
  const isBookmarked = mounted ? isBookmarkedStored : false;
  const likesDelta = mounted ? likesDeltaStored : 0;
  const savesDelta = mounted ? savesDeltaStored : 0;

  const baseLikes =
    typeof confirmedLikes === "number" ? confirmedLikes : (card.likes ?? 0);
  const likesCount = Math.max(0, baseLikes + likesDelta);
  const baseSaves =
    typeof confirmedSaves === "number" ? confirmedSaves : (card.saves ?? 0);
  const savesCount = Math.max(0, baseSaves + savesDelta);

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
        const response = nextState
          ? await likeCourse(postId)
          : await unlikeCourse(postId);
        const serverLikeCount = readLikeCount(response);
        if (serverLikeCount !== null) {
          onLikeConfirmed?.(cardKey, serverLikeCount);
          clearLikesDelta(slugKey, numKey);
        }
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
        const response = nextState
          ? await bookmarkCourse(postId)
          : await unbookmarkCourse(postId);
        const serverBookmarkCount = readBookmarkCount(response);
        if (serverBookmarkCount !== null) {
          onBookmarkConfirmed?.(cardKey, serverBookmarkCount);
          clearSavesDelta(slugKey, numKey);
        }
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
    <article
      className={`group relative flex aspect-[4/3] min-h-0 min-w-0 h-auto w-full cursor-pointer flex-col justify-between overflow-hidden rounded-[18px] bg-linear-to-br ${gradient} shadow-[0_14px_36px_rgba(30,15,70,0.3)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_44px_rgba(30,15,70,0.45)] lg:aspect-[3/4] lg:rounded-[26px]`}
    >
      <Link
        href={href}
        aria-label={card.title}
        className="absolute inset-0 z-10"
      />

      {/* Full Background Image */}
      {image ? (
        <img
          src={image}
          alt={card.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,0.25),transparent_28%),linear-gradient(145deg,rgba(255,255,255,0.12),transparent_45%)]" />
      )}

      {/* Top Gradient for text legibility */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/80 via-black/35 to-transparent lg:h-28" />

      {/* Bottom Gradient for title and metrics legibility */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/95 via-black/55 to-transparent lg:h-60" />

      {/* Top Header Overlay (Transparent background) */}
      <div className="pointer-events-none relative z-20 flex min-w-0 items-start justify-between gap-2 p-3 lg:p-5">
        <div className="inline-flex max-w-full items-center gap-2 overflow-hidden rounded-full border border-white/15 bg-black/35 px-2.5 py-1.5 shadow-[0_8px_18px_rgba(0,0,0,0.18)] backdrop-blur-md lg:gap-2.5 lg:px-3.5 lg:py-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#5c2ef5] text-[11px] font-black text-white shadow-sm lg:size-8 lg:text-sm">
            {rank}
          </span>
          <div className="min-w-0 leading-none">
            <span className="block max-w-[126px] truncate text-xs font-black text-white drop-shadow-sm lg:max-w-[172px] lg:text-sm">
              {displayName}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Content Area (Transparent overlay on image) */}
      <div className="pointer-events-none relative z-20 flex min-w-0 flex-col gap-1.5 p-3 pt-0 lg:gap-3 lg:p-5 lg:pt-0">
        {/* Title & Description */}
        <div className="flex min-w-0 flex-col gap-0.5 lg:gap-1">
          <h3 className="line-clamp-2 break-keep text-[15px] font-black leading-snug text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] lg:text-[26px]">
            {card.title}
          </h3>
          {card.description ? (
            <p className="line-clamp-1 text-[11px] font-medium leading-snug text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] lg:text-sm">
              {card.description}
            </p>
          ) : null}
        </div>

        {/* Bottom Interactive Stats */}
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-1.5 pt-0.5 text-sm font-bold text-white/95 lg:gap-3 lg:text-base">
          {/* Like button */}
          <button
            type="button"
            onClick={handleLike}
            aria-label={t("like")}
            className={`pointer-events-auto relative z-30 inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-2 py-1 backdrop-blur-2xs transition lg:gap-1.5 lg:px-3 ${
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
            aria-label={t("comments")}
            className="pointer-events-auto relative z-30 inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-2 py-1 text-white/90 backdrop-blur-2xs transition hover:bg-white/20 lg:gap-1.5 lg:px-3"
          >
            <svg className="size-5 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>{card.comments ?? 0}</span>
          </button>

          {/* Bookmark/Save button */}
          <button
            type="button"
            onClick={handleBookmark}
            aria-label={t("save")}
            className={`pointer-events-auto relative z-30 inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-2 py-1 backdrop-blur-2xs transition lg:gap-1.5 lg:px-3 ${
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
    </article>
  );
}

export function CommunityCoursePage({
  initialCards = [],
  popularPlaces = [],
  authorFilterName = "",
  isAuthorFiltered = false,
}) {
  const t = useTranslations("community");
  const router = useRouter();
  const mounted = useIsMounted();
  const [isDesktopLayout, setIsDesktopLayout] = useState(false);
  const [activeTab, setActiveTab] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [confirmedLikesByKey, setConfirmedLikesByKey] = useState({});
  const [confirmedSavesByKey, setConfirmedSavesByKey] = useState({});
  const likesDeltaMap = useCommunityInteractionsStore((state) => state.likesDelta);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const resolveMessage = (key, fallback) => {
    try {
      if (typeof t.has === "function" && !t.has(key)) return fallback;
      const msg = t(key);
      if (!msg || msg === key || msg.includes("community.")) return fallback;
      return msg;
    } catch {
      return fallback;
    }
  };

  const popularPlacesTitle = resolveMessage(
    "popularPlacesTitle",
    "지금 여행자들이 가장 많이 다녀온 인기 장소",
  );

  const pageTitle = isAuthorFiltered
    ? authorFilterName
      ? `${authorFilterName}님의 공유 코스`
      : "이 사용자의 공유 코스"
    : t("title");
  const pageDescription = isAuthorFiltered
    ? "해당 사용자가 커뮤니티에 공유한 코스만 모아봤어요."
    : t("description");
  const hasPopularPlaces = !isAuthorFiltered && popularPlaces.length > 0;

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const apply = () => setIsDesktopLayout(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  const itemsPerPage = mounted && isDesktopLayout
    ? DESKTOP_ITEMS_PER_PAGE
    : MOBILE_ITEMS_PER_PAGE;

  const cards = useMemo(() => {
    if (activeTab === "latest") {
      return [...initialCards].sort((a, b) => (b.postId ?? 0) - (a.postId ?? 0));
    }
    // 기본값: 인기순
    const activeLikesDeltaMap = mounted ? likesDeltaMap : {};

    return [...initialCards].sort((a, b) => {
      const likeDiff =
        getDisplayLikeCount(b, {
          likesDeltaMap: activeLikesDeltaMap,
          confirmedLikesByKey,
        }) -
        getDisplayLikeCount(a, {
          likesDeltaMap: activeLikesDeltaMap,
          confirmedLikesByKey,
        });
      if (likeDiff !== 0) return likeDiff;

      return (b.postId ?? 0) - (a.postId ?? 0);
    });
  }, [initialCards, activeTab, mounted, likesDeltaMap, confirmedLikesByKey]);

  const handleLikeConfirmed = (cardKey, likesCount) => {
    setConfirmedLikesByKey((prev) => ({
      ...prev,
      [cardKey]: likesCount,
    }));
  };

  const handleBookmarkConfirmed = (cardKey, bookmarkCount) => {
    setConfirmedSavesByKey((prev) => ({
      ...prev,
      [cardKey]: bookmarkCount,
    }));
  };

  // 탭 변경 시 1페이지로 리셋
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(cards.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedCards = useMemo(() => {
    const startIdx = (safeCurrentPage - 1) * itemsPerPage;
    return cards.slice(startIdx, startIdx + itemsPerPage);
  }, [cards, safeCurrentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-w-0 overflow-x-hidden bg-surface-soft max-lg:flex max-lg:min-h-0 max-lg:flex-1 max-lg:flex-col max-lg:overflow-hidden lg:min-h-screen lg:bg-background">
      <section className="shrink-0 bg-white px-4 pb-0 pt-3 lg:px-52 lg:pb-16 lg:pt-[94px] xl:px-60 2xl:px-72">
        <div className="mx-auto max-w-[1020px] lg:max-w-none">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black text-brand lg:text-sm">
                THE HYUNDAI SEOUL COMMUNITY
              </p>
              <h1 className="mt-1 text-[18px] font-black leading-tight text-ink lg:mt-6 lg:text-[42px] lg:leading-none">
                {pageTitle}
              </h1>
              <p className="mt-1 hidden text-[13px] font-medium leading-5 text-ink-muted lg:mt-5 lg:block lg:text-base lg:leading-7">
                {pageDescription}
              </p>
            </div>
            <Link
              href={isAuthorFiltered ? "/community" : "/community/share"}
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-black shadow-control transition lg:hidden ${
                isAuthorFiltered
                  ? "border border-brand bg-white text-brand"
                  : "bg-brand text-white"
              }`}
            >
              {isAuthorFiltered ? "전체 보기" : t("share")}
            </Link>
          </div>

          <div className="mt-2 flex gap-6 border-b border-line lg:mt-6 lg:gap-10">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={`-mb-px cursor-pointer border-b-2 pb-2 text-[13px] font-black transition lg:pb-3 lg:text-base ${
                  activeTab === tab
                    ? "border-brand text-brand"
                    : "border-transparent text-ink-muted hover:text-ink"
                }`}
              >
                {t(tab)}
              </button>
            ))}
          </div>

          {hasPopularPlaces ? (
            <div className="mt-3.5 mb-1 pt-1 lg:mt-6 lg:mb-2">
              <div className="flex items-center">
                <span className="inline-block rounded-[2px] bg-[#ede7ff] px-2 py-0.5 text-xs font-black tracking-tight text-[#5c2ef5] lg:text-[14px]">
                  {popularPlacesTitle}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1.5 pt-0.5 lg:gap-2.5">
                  {popularPlaces.slice(0, 5).map((place, index) => (
                    <button
                      key={place.placeId || `${place.name}-${index}`}
                      type="button"
                      onClick={() => setSelectedPlace(place)}
                      className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-brand/15 bg-white hover:bg-brand-soft/30 px-2.5 py-1.5 shadow-2xs transition-all hover:scale-[1.02] hover:shadow-xs active:scale-95 cursor-pointer lg:gap-2.5 lg:px-3.5 lg:py-1.5"
                    >
                      <span className="flex size-5.5 shrink-0 items-center justify-center rounded-full bg-black text-[11px] font-black text-white shadow-2xs lg:size-6 lg:text-xs">
                        {place.rank || index + 1}
                      </span>
                      <span className="flex size-7 shrink-0 overflow-hidden rounded-full border border-brand/15 bg-neutral-100 shadow-2xs lg:size-8">
                        {place.imageUrl ? (
                          <img
                            src={place.imageUrl}
                            alt={place.name || ""}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <span className="h-full w-full bg-linear-to-br from-brand/90 to-brand-light" />
                        )}
                      </span>
                      <span className="max-w-[110px] truncate text-xs font-bold text-ink group-hover:text-brand transition-colors lg:max-w-[150px] lg:text-[13px]">
                        {place.name}
                      </span>
                      {place.floor ? (
                        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand shadow-2xs lg:text-[11px]">
                          {place.floor}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>

                <Link
                  href={isAuthorFiltered ? "/community" : "/community/share"}
                  className={`hidden shrink-0 items-center justify-center rounded-full px-5 py-2.5 text-xs font-black shadow-control transition lg:inline-flex lg:text-sm ${
                    isAuthorFiltered
                      ? "border border-brand bg-white text-brand hover:bg-brand hover:text-white"
                      : "bg-brand text-white hover:bg-brand-dark"
                  }`}
                >
                  {isAuthorFiltered ? "전체 코스 보기" : t("shareMine")}
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-4 hidden justify-end lg:flex">
              <Link
                href={isAuthorFiltered ? "/community" : "/community/share"}
                className={`items-center justify-center rounded-full px-6 py-3.5 text-sm font-black shadow-control transition lg:inline-flex ${
                  isAuthorFiltered
                    ? "border border-brand bg-white text-brand hover:bg-brand hover:text-white"
                    : "bg-brand text-white hover:bg-brand-dark"
                }`}
              >
                {isAuthorFiltered ? "전체 코스 보기" : t("shareMine")}
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-surface-soft p-6 lg:overflow-visible lg:px-52 lg:py-14 xl:px-60 2xl:px-72">
        <div className="flex w-full flex-col gap-6 lg:block">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-5">
            {paginatedCards.length > 0 ? (
              paginatedCards.map((card, index) => {
                const actualRank = (safeCurrentPage - 1) * itemsPerPage + index + 1;
                return (
                  <div
                    key={`${card.postId || card.slug || card.name}-${card.title}-${index}`}
                    className="min-h-0 min-w-0"
                  >
                    <CommunityCard
                      card={card}
                      rank={actualRank}
                      confirmedLikes={
                        confirmedLikesByKey[
                          getCommunityCardIdentity(card, actualRank).cardKey
                        ]
                      }
                      confirmedSaves={
                        confirmedSavesByKey[
                          getCommunityCardIdentity(card, actualRank).cardKey
                        ]
                      }
                      onAuthRequired={() => setIsLoginModalOpen(true)}
                      onLikeConfirmed={handleLikeConfirmed}
                      onBookmarkConfirmed={handleBookmarkConfirmed}
                    />
                  </div>
                );
              })
            ) : (
              <div className="flex min-h-[280px] items-center justify-center rounded-[24px] border border-dashed border-line bg-white p-8 text-center lg:col-span-3">
                <div>
                  <h2 className="text-lg font-black text-ink">
                    {isAuthorFiltered
                      ? "이 사용자가 공유한 다른 코스가 없어요"
                      : "공유된 코스가 아직 없어요"}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-ink-muted">
                    {isAuthorFiltered
                      ? "전체 커뮤니티에서 다른 코스를 둘러볼 수 있어요."
                      : "내 코스를 커뮤니티에 공유하면 이곳에 표시됩니다."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {totalPages > 1 ? (
            <div className="flex shrink-0 items-center justify-center gap-3 lg:mt-12 lg:hidden">
              <button
                type="button"
                onClick={() => handlePageChange(safeCurrentPage - 1)}
                disabled={safeCurrentPage === 1}
                className={`flex size-8 items-center justify-center rounded-xl text-sm font-black transition ${
                  safeCurrentPage === 1
                    ? "cursor-not-allowed border border-brand/20 bg-brand-soft/50 text-brand/30"
                    : "cursor-pointer border border-brand bg-brand-soft text-brand shadow-xs"
                }`}
                aria-label={t("previousPage")}
              >
                ‹
              </button>
              <span className="min-w-14 text-center text-xs font-black text-brand">
                {safeCurrentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(safeCurrentPage + 1)}
                disabled={safeCurrentPage === totalPages}
                className={`flex size-8 items-center justify-center rounded-xl text-sm font-black transition ${
                  safeCurrentPage === totalPages
                    ? "cursor-not-allowed border border-brand/20 bg-brand-soft/50 text-brand/30"
                    : "cursor-pointer border border-brand bg-brand-soft text-brand shadow-xs"
                }`}
                aria-label={t("nextPage")}
              >
                ›
              </button>
            </div>
          ) : null}

          {/* 페이징 컨트롤 바 렌더링 */}
          {totalPages > 1 && (
            <div className="mt-12 hidden items-center justify-center gap-2 lg:flex">
              {/* 이전 버튼 */}
              <button
                type="button"
                onClick={() => handlePageChange(safeCurrentPage - 1)}
                disabled={safeCurrentPage === 1}
                className={`flex size-8 sm:size-9 items-center justify-center rounded-xl font-bold transition text-xs sm:text-sm ${
                  safeCurrentPage === 1
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
                  className={`flex size-8 sm:size-9 items-center justify-center rounded-xl text-xs font-black transition cursor-pointer ${
                    safeCurrentPage === pageNum
                      ? "bg-brand text-white shadow-md"
                      : "border border-line bg-white text-ink-muted hover:border-brand hover:text-brand shadow-xs"
                  }`}
                  aria-current={safeCurrentPage === pageNum ? "page" : undefined}
                >
                  {pageNum}
                </button>
              ))}

              {/* 다음 버튼 */}
              <button
                type="button"
                onClick={() => handlePageChange(safeCurrentPage + 1)}
                disabled={safeCurrentPage === totalPages}
                className={`flex size-8 sm:size-9 items-center justify-center rounded-xl font-bold transition text-xs sm:text-sm ${
                  safeCurrentPage === totalPages
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

      {selectedPlace && (
        <PlaceModal
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
        />
      )}
    </main>
  );
}
