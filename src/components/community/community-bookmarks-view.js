"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import { getMyBookmarks } from "@/lib/api/users";
import {
  likeCourse,
  unlikeCourse,
  bookmarkCourse,
  unbookmarkCourse,
} from "@/lib/api/community";
import { useCommunityInteractionsStore } from "@/stores/use-community-interactions-store";
import { communityCourses } from "@/lib/fixtures/community-courses";
import { useIsMounted } from "@/hooks/use-is-mounted";

const CATEGORIES = [
  { id: "all", label: "전체" },
  { id: "likes", label: "좋아요한 코스" },
  { id: "bookmarks", label: "북마크한 코스" },
];

function getFlagEmoji(countryCode = "") {
  const code = (countryCode || "").toUpperCase();
  if (code === "JP" || code === "JAPAN") return "🇯🇵";
  if (code === "CN" || code === "CHINA") return "🇨🇳";
  if (code === "US" || code === "USA") return "🇺🇸";
  if (code === "KR" || code === "KOREA") return "🇰🇷";
  return "🌐";
}

function enrichCourseItem(item, index, isLiked = false, isBookmarked = true) {
  const postId = item.postId || item.id || item.courseId || index + 1;
  const fixture =
    communityCourses.find(
      (c) =>
        String(c.postId || c.slug) === String(postId) ||
        String(c.rank) === String(postId),
    ) || communityCourses[index % communityCourses.length];

  return {
    postId,
    id: postId,
    slug: fixture?.slug || postId,
    title: item.title || fixture?.title || "추천 커뮤니티 코스",
    description: item.description || fixture?.description || "더현대 서울 맞춤 추천 코스",
    name: item.authorName || item.nickname || fixture?.name || "여행자",
    country: item.country || fixture?.country || "KR",
    flag: item.country || fixture?.flag || "KR",
    hash: item.hash || fixture?.hash || "#인기코스 #더현대",
    image:
      item.image ||
      fixture?.image ||
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=900&fit=crop",
    likes: item.likeCount ?? item.likes ?? fixture?.likes ?? 742,
    saves: item.bookmarkCount ?? item.saves ?? fixture?.saves ?? 214,
    comments: item.commentCount ?? item.comments ?? fixture?.comments ?? 58,
    bookmarkedAt: item.bookmarkedAt || new Date().toISOString(),
    isLiked,
    isBookmarked,
  };
}

function BookmarkCard({ course, onAuthRequired }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const mounted = useIsMounted();

  const postId =
    course.postId ||
    course.id ||
    course.courseId ||
    (typeof course.slug === "number" || /^\d+$/.test(course.slug)
      ? Number(course.slug)
      : 1);

  const postIdentifier = String(course.postId || course.slug || postId || "1");

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
  const setBookmarked = useCommunityInteractionsStore((state) => state.setBookmarked);

  const isLiked = mounted ? isLikedStored : course.isLiked;
  const isBookmarked = mounted ? isBookmarkedStored : course.isBookmarked;
  const likesDelta = mounted ? likesDeltaStored : 0;

  const baseLikes = course.likes ?? 0;
  const likesCount = Math.max(0, baseLikes + likesDelta);
  const baseSaves = course.saves ?? 0;
  const savesCount = Math.max(0, baseSaves + (isBookmarked ? 1 : 0));

  const href = `/community/${course.slug || postId}`;

  async function handleLike(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }
    const nextState = !isLiked;
    setLiked(postIdentifier, nextState);

    if (postId) {
      try {
        if (nextState) await likeCourse(postId);
        else await unlikeCourse(postId);
      } catch (err) {
        console.warn("[Bookmarks Card Like] error:", err);
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
    setBookmarked(postIdentifier, nextState);

    if (postId) {
      try {
        if (nextState) await bookmarkCourse(postId);
        else await unbookmarkCourse(postId);
      } catch (err) {
        console.warn("[Bookmarks Card Bookmark] error:", err);
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
      className="group relative flex flex-col justify-between overflow-hidden rounded-[26px] aspect-[3/4] w-full bg-slate-950 shadow-[0_14px_36px_rgba(30,15,70,0.25)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_44px_rgba(30,15,70,0.4)]"
    >
      {/* Full Background Image */}
      <img
        src={course.image}
        alt={course.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Top Gradient */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/80 via-black/35 to-transparent pointer-events-none" />

      {/* Bottom Gradient */}
      <div className="absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-black/95 via-black/55 to-transparent pointer-events-none" />

      {/* Top Header Overlay */}
      <div className="relative z-10 p-5 flex items-start justify-between">
        <div className="flex items-center gap-2.5 bg-black/30 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
          <span className="flex size-7 items-center justify-center rounded-lg bg-[#5c2ef5] text-xs font-black text-white shadow-xs">
            ★
          </span>
          <span className="text-base leading-none">{getFlagEmoji(course.country || course.flag)}</span>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-bold text-white drop-shadow-xs">{course.name}</span>
            <span className="text-[11px] font-semibold text-violet-200 drop-shadow-xs">{course.hash}</span>
          </div>
        </div>
      </div>

      {/* Bottom Content Area */}
      <div className="relative z-10 p-5 pt-0 flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-2xl font-black text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] line-clamp-2">
            {course.title}
          </h3>
          {course.description && (
            <p className="text-xs font-medium text-white/90 line-clamp-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {course.description}
            </p>
          )}
        </div>

        {/* Bottom Stats Toolbar (Interactive Buttons: Like, Comment, Bookmark) */}
        <div className="flex items-center justify-end gap-2.5 text-xs font-bold text-white pt-1">
          {/* 좋아요 버튼 토글 */}
          <button
            type="button"
            onClick={handleLike}
            aria-label="좋아요"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition shadow-xs cursor-pointer ${
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
            aria-label="댓글"
            className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/20 transition cursor-pointer text-white"
          >
            <svg className="size-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>{course.comments}</span>
          </button>

          {/* 북마크(저장) 버튼 토글 */}
          <button
            type="button"
            onClick={handleBookmark}
            aria-label="북마크"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition shadow-xs cursor-pointer ${
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

export function CommunityBookmarksView() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const bookmarkedPosts = useCommunityInteractionsStore((state) => state.bookmarkedPosts);
  const likedPosts = useCommunityInteractionsStore((state) => state.likedPosts);

  const [loading, setLoading] = useState(true);
  const [coursesList, setCoursesList] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all"); // "all" | "likes" | "bookmarks"
  const [sortBy, setSortBy] = useState("latest"); // "latest" | "popular"
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const sortDropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    let isMounted = true;

    async function fetchBookmarks() {
      setLoading(true);
      try {
        const res = await getMyBookmarks();
        const rawList = Array.isArray(res) ? res : res?.content || res?.items || [];

        const allItemsMap = new Map();

        // 1. Backend Bookmarked items
        rawList.forEach((item, idx) => {
          const enriched = enrichCourseItem(
            item,
            idx,
            Boolean(likedPosts[item.postId]),
            bookmarkedPosts?.[item.postId] !== false,
          );
          allItemsMap.set(String(enriched.postId), enriched);
        });

        // 2. Locally Bookmarked items
        if (bookmarkedPosts) {
          Object.keys(bookmarkedPosts).forEach((id, idx) => {
            if (bookmarkedPosts[id]) {
              const fixture =
                communityCourses.find((c) => String(c.postId || c.slug) === String(id)) ||
                communityCourses[idx % communityCourses.length];
              const enriched = enrichCourseItem(
                { ...fixture, postId: id },
                idx,
                Boolean(likedPosts[id]),
                true,
              );
              allItemsMap.set(String(id), enriched);
            }
          });
        }

        // 3. Locally Liked items
        if (likedPosts) {
          Object.keys(likedPosts).forEach((id, idx) => {
            if (likedPosts[id]) {
              const existing = allItemsMap.get(String(id));
              if (existing) {
                existing.isLiked = true;
              } else {
                const fixture =
                  communityCourses.find((c) => String(c.postId || c.slug) === String(id)) ||
                  communityCourses[idx % communityCourses.length];
                const enriched = enrichCourseItem(
                  { ...fixture, postId: id },
                  idx,
                  true,
                  Boolean(bookmarkedPosts?.[id]),
                );
                allItemsMap.set(String(id), enriched);
              }
            }
          });
        }

        if (isMounted) {
          setCoursesList(Array.from(allItemsMap.values()));
        }
      } catch (err) {
        console.warn("[Bookmarks] API fetch warning:", err.message);
        if (isMounted) {
          const allItemsMap = new Map();
          Object.keys(bookmarkedPosts || {}).forEach((id, idx) => {
            if (bookmarkedPosts[id]) {
              const fixture =
                communityCourses.find((c) => String(c.postId || c.slug) === String(id)) ||
                communityCourses[idx % communityCourses.length];
              allItemsMap.set(
                String(id),
                enrichCourseItem({ ...fixture, postId: id }, idx, Boolean(likedPosts?.[id]), true),
              );
            }
          });

          Object.keys(likedPosts || {}).forEach((id, idx) => {
            if (likedPosts[id]) {
              const existing = allItemsMap.get(String(id));
              if (existing) {
                existing.isLiked = true;
              } else {
                const fixture =
                  communityCourses.find((c) => String(c.postId || c.slug) === String(id)) ||
                  communityCourses[idx % communityCourses.length];
                allItemsMap.set(
                  String(id),
                  enrichCourseItem(
                    { ...fixture, postId: id },
                    idx,
                    true,
                    Boolean(bookmarkedPosts?.[id]),
                  ),
                );
              }
            }
          });

          setCoursesList(Array.from(allItemsMap.values()));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchBookmarks();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, router, bookmarkedPosts, likedPosts]);

  // Filter based on activeCategory & sort based on sortBy
  const displayedCourses = useMemo(() => {
    let list = coursesList;
    if (activeCategory === "likes") {
      list = coursesList.filter((c) => {
        const id = String(c.postId || c.slug);
        return likedPosts[id] !== undefined ? likedPosts[id] : c.isLiked;
      });
    } else if (activeCategory === "bookmarks") {
      list = coursesList.filter((c) => {
        const id = String(c.postId || c.slug);
        return bookmarkedPosts[id] !== undefined ? bookmarkedPosts[id] : c.isBookmarked;
      });
    }

    if (sortBy === "popular") {
      return [...list].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    }
    // Default: latest
    return [...list].sort(
      (a, b) =>
        new Date(b.bookmarkedAt || 0).getTime() -
        new Date(a.bookmarkedAt || 0).getTime(),
    );
  }, [coursesList, activeCategory, sortBy, likedPosts, bookmarkedPosts]);

  const likesCount = useMemo(
    () =>
      coursesList.filter((c) => {
        const id = String(c.postId || c.slug);
        return likedPosts[id] !== undefined ? likedPosts[id] : c.isLiked;
      }).length,
    [coursesList, likedPosts],
  );

  const bookmarksCount = useMemo(
    () =>
      coursesList.filter((c) => {
        const id = String(c.postId || c.slug);
        return bookmarkedPosts[id] !== undefined ? bookmarkedPosts[id] : c.isBookmarked;
      }).length,
    [coursesList, bookmarkedPosts],
  );

  return (
    <main className="bg-background min-h-screen">
      {/* Header Section */}
      <section className="bg-white px-10 sm:px-14 pb-0 pt-[80px] lg:px-52 xl:px-60 2xl:px-72 border-b border-line">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-brand-soft text-brand">
                <svg className="size-4 fill-current" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <p className="text-xs font-black text-brand tracking-wider">
                MY FAVORITE COURSES
              </p>
            </div>
            <h1 className="mt-4 text-[32px] font-black leading-none text-ink lg:text-[36px]">
              내가 찜하고 저장한 코스
            </h1>
            <p className="mt-3 text-sm font-medium text-ink-muted">
              여행자들이 공유한 코스 중 내가 좋아요 누르고 북마크한 코스들을 모아보세요.
            </p>
          </div>

          <Link
            href="/community"
            className="inline-flex w-fit items-center justify-center rounded-full border border-line bg-surface-soft px-6 py-3 text-xs font-bold text-ink transition hover:border-brand hover:text-brand"
          >
            전체 커뮤니티 보기 →
          </Link>
        </div>

        {/* 카테고리 탭 */}
        <div className="mt-8 flex items-center gap-6">
          {CATEGORIES.map((cat) => {
            const count =
              cat.id === "likes"
                ? likesCount
                : cat.id === "bookmarks"
                  ? bookmarksCount
                  : coursesList.length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`-mb-px flex items-center gap-2 border-b-2 pb-3.5 text-sm font-black transition cursor-pointer ${
                  activeCategory === cat.id
                    ? "border-brand text-brand"
                    : "border-transparent text-ink-muted hover:text-ink"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold transition ${
                    activeCategory === cat.id
                      ? "bg-brand text-white"
                      : "bg-surface-soft text-ink-muted"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Grid Content & 정렬 드롭다운 토글 */}
      <section className="px-10 sm:px-14 py-[36px] lg:px-52 xl:px-60 2xl:px-72">
        {/* 상단 툴바: 우측 정렬 드롭다운 토글 */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs font-bold text-ink-muted">
            총 <span className="text-brand font-black">{displayedCourses.length}</span>개의 코스
          </p>

          {/* 토글형 드롭다운 메뉴 */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              type="button"
              onClick={() => setIsSortDropdownOpen((prev) => !prev)}
              className="inline-flex h-9 items-center justify-between gap-2.5 rounded-full border border-line bg-white px-4 text-xs font-bold text-ink shadow-xs transition hover:border-brand hover:text-brand cursor-pointer"
            >
              <span>{sortBy === "latest" ? "최신순" : "인기순"}</span>
              <svg
                className={`size-3.5 text-ink-muted transition-transform duration-200 ${
                  isSortDropdownOpen ? "rotate-180 text-brand" : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {isSortDropdownOpen && (
              <div className="absolute right-0 top-full z-30 mt-1.5 w-28 overflow-hidden rounded-2xl border border-line bg-white p-1 shadow-lg animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setSortBy("latest");
                    setIsSortDropdownOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${
                    sortBy === "latest"
                      ? "bg-brand-soft text-brand"
                      : "text-ink hover:bg-surface-soft"
                  }`}
                >
                  <span>최신순</span>
                  {sortBy === "latest" && (
                    <span className="size-1.5 rounded-full bg-brand" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy("popular");
                    setIsSortDropdownOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${
                    sortBy === "popular"
                      ? "bg-brand-soft text-brand"
                      : "text-ink hover:bg-surface-soft"
                  }`}
                >
                  <span>인기순</span>
                  {sortBy === "popular" && (
                    <span className="size-1.5 rounded-full bg-brand" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 카드 그리드 */}
        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
            <div className="size-8 animate-spin rounded-full border-3 border-brand border-t-transparent" />
            <p className="text-xs font-bold text-ink-muted">코스를 불러오는 중...</p>
          </div>
        ) : displayedCourses.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayedCourses.map((course) => (
              <BookmarkCard
                key={course.postId || course.slug || course.id}
                course={course}
                onAuthRequired={() => setIsLoginModalOpen(true)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-line bg-white p-16 text-center shadow-xs">
            <div className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand mb-4">
              {activeCategory === "likes" ? (
                <svg className="size-7 fill-red-500 text-red-500" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              ) : (
                <svg className="size-7 fill-current" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-black text-ink">
              {activeCategory === "likes"
                ? "아직 좋아요한 코스가 없어요"
                : activeCategory === "bookmarks"
                  ? "아직 북마크한 코스가 없어요"
                  : "아직 저장한 코스가 없어요"}
            </h3>
            <p className="mt-2 text-xs text-ink-muted max-w-sm">
              {activeCategory === "likes"
                ? "여행자들이 공유한 코스를 구경하고 마음에 드는 코스에 좋아요를 눌러보세요!"
                : "여행자들이 만든 다채로운 코스를 구경하고 마음에 드는 코스를 북마크해 보관해보세요!"}
            </p>
            <Link
              href="/community"
              className="mt-6 rounded-full bg-brand px-8 py-3.5 text-xs font-black text-white shadow-control transition hover:bg-brand-dark"
            >
              커뮤니티 코스 둘러보기 →
            </Link>
          </div>
        )}
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
            <h3 className="text-base font-black text-ink">로그인이 필요합니다</h3>
            <p className="mt-2 text-xs text-ink-muted leading-relaxed">
              좋아요 및 코스 저장 기능을 이용하시려면 먼저 로그인해주세요.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                className="flex-1 rounded-full border border-line bg-surface-soft py-2.5 text-xs font-bold text-ink hover:bg-line transition cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLoginModalOpen(false);
                  router.push("/login");
                }}
                className="flex-1 rounded-full bg-brand py-2.5 text-xs font-black text-white shadow-xs hover:bg-brand-dark transition cursor-pointer"
              >
                로그인하기 →
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
