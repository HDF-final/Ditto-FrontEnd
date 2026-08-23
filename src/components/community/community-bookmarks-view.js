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

const ITEMS_PER_PAGE = 3;

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

function getDeterministicBaseTime(rankOrId = 1) {
  const num = typeof rankOrId === "number" ? rankOrId : Number(rankOrId) || 1;
  return 1770000000000 - num * 3600000;
}

function enrichCourseItem(item, index) {
  const postId = item.postId || item.id || item.courseId || index + 1;
  const fixture =
    communityCourses.find(
      (c) =>
        String(c.postId || c.slug) === String(postId) ||
        String(c.slug) === String(item.slug) ||
        String(c.rank) === String(postId),
    ) || communityCourses[index % communityCourses.length];

  const defaultTime = getDeterministicBaseTime(index + 1);
  const slug = item.slug || fixture?.slug || String(postId);

  return {
    postId,
    id: postId,
    slug,
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
    initialBookmarkedAt: item.bookmarkedAt ? new Date(item.bookmarkedAt).getTime() : defaultTime,
    initialLikedAt: defaultTime,
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

  const slugKey = course.slug ? String(course.slug) : "";
  const numKey = String(course.postId || postId || "1");

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

  const href = `/community/${course.slug || postId}`;

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
    setBookmarked(slugKey, nextState, numKey);

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
      className="group relative flex flex-col justify-between overflow-hidden rounded-[20px] sm:rounded-[22px] aspect-[4/3] sm:aspect-[3/4] w-full bg-slate-950 shadow-[0_8px_24px_rgba(30,15,70,0.15)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_36px_rgba(30,15,70,0.35)] cursor-pointer"
    >
      {/* Full Background Image */}
      <img
        src={course.image}
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
            ★
          </span>
          <span className="text-xs sm:text-sm leading-none shrink-0">{getFlagEmoji(course.country || course.flag)}</span>
          <div className="flex items-center gap-1.5 sm:flex-col sm:items-start leading-tight">
            <span className="text-xs sm:text-[11px] font-bold text-white drop-shadow-xs whitespace-nowrap">{course.name}</span>
            <span className="text-[10px] font-semibold text-violet-200 drop-shadow-xs whitespace-nowrap">{course.hash}</span>
          </div>
        </div>
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

        {/* Bottom Stats Toolbar (Interactive Buttons: Like, Comment, Bookmark) */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 text-xs sm:text-[11px] font-bold text-white pt-0.5">
          {/* 좋아요 버튼 토글 */}
          <button
            type="button"
            onClick={handleLike}
            aria-label="좋아요"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition shadow-xs cursor-pointer ${
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
            className="flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10 hover:bg-white/20 transition cursor-pointer text-white"
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
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition shadow-xs cursor-pointer ${
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
  const mounted = useIsMounted();

  const isLikedStored = useCommunityInteractionsStore((state) => state.isLiked);
  const isBookmarkedStored = useCommunityInteractionsStore((state) => state.isBookmarked);
  const getLikedAt = useCommunityInteractionsStore((state) => state.getLikedAt);
  const getBookmarkedAt = useCommunityInteractionsStore((state) => state.getBookmarkedAt);
  const getLikesDelta = useCommunityInteractionsStore((state) => state.getLikesDelta);
  const setBookmarked = useCommunityInteractionsStore((state) => state.setBookmarked);

  // Subscribe to raw maps for reactive state updates
  const likedPosts = useCommunityInteractionsStore((state) => state.likedPosts);
  const bookmarkedPosts = useCommunityInteractionsStore((state) => state.bookmarkedPosts);
  const likedAtMap = useCommunityInteractionsStore((state) => state.likedAtMap);
  const bookmarkedAtMap = useCommunityInteractionsStore((state) => state.bookmarkedAtMap);

  const [loading, setLoading] = useState(true);
  const [coursesList, setCoursesList] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all"); // "all" | "likes" | "bookmarks"
  const [sortBy, setSortBy] = useState("latest"); // "latest" | "popular"
  const [currentPage, setCurrentPage] = useState(1);
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

  // Fetch backend bookmarks once on mount
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

        const map = new Map();

        // 1. All standard fixtures
        communityCourses.forEach((c, idx) => {
          const enriched = enrichCourseItem(c, idx);
          map.set(String(enriched.slug || enriched.postId), enriched);
        });

        // 2. Backend bookmarks update
        rawList.forEach((item, idx) => {
          const id = String(item.postId || item.id || item.courseId || idx + 1);
          const enriched = enrichCourseItem(item, idx);
          const key = String(enriched.slug || id);
          map.set(key, { ...map.get(key), ...enriched });
          // Ensure it's recorded in store if not present
          setBookmarked(key, true, id);
        });

        if (isMounted) {
          setCoursesList(Array.from(map.values()));
        }
      } catch (err) {
        console.warn("[Bookmarks] API fetch warning:", err.message);
        if (isMounted) {
          const fallbackList = communityCourses.map((c, idx) => enrichCourseItem(c, idx));
          setCoursesList(fallbackList);
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
  }, [isAuthenticated, router]);

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
    setIsSortDropdownOpen(false);
  };

  // Filter based on activeCategory & sort purely by the relevant action timestamp
  const displayedCourses = useMemo(() => {
    if (!mounted) return [];

    let list = coursesList.filter((c) => {
      const slugKey = c.slug ? String(c.slug) : "";
      const numKey = String(c.postId || c.id || "1");

      const isLiked = isLikedStored(slugKey, numKey);
      const isBookmarked = isBookmarkedStored(slugKey, numKey);

      if (activeCategory === "likes") {
        return isLiked;
      }
      if (activeCategory === "bookmarks") {
        return isBookmarked;
      }
      return isLiked || isBookmarked;
    });

    if (sortBy === "popular") {
      return [...list].sort((a, b) => {
        const slugKeyA = a.slug ? String(a.slug) : "";
        const numKeyA = String(a.postId || a.id || "1");
        const slugKeyB = b.slug ? String(b.slug) : "";
        const numKeyB = String(b.postId || b.id || "1");

        const likesA = (a.likes ?? 0) + (getLikesDelta(slugKeyA, numKeyA) || 0);
        const likesB = (b.likes ?? 0) + (getLikesDelta(slugKeyB, numKeyB) || 0);
        return likesB - likesA;
      });
    }

    // Default: latest (독립된 타임스탬프 기준 정렬)
    return [...list].sort((a, b) => {
      const slugKeyA = a.slug ? String(a.slug) : "";
      const numKeyA = String(a.postId || a.id || "1");
      const slugKeyB = b.slug ? String(b.slug) : "";
      const numKeyB = String(b.postId || b.id || "1");

      if (activeCategory === "likes") {
        const timeB = getLikedAt(slugKeyB, numKeyB) || b.initialLikedAt || 0;
        const timeA = getLikedAt(slugKeyA, numKeyA) || a.initialLikedAt || 0;
        return timeB - timeA;
      }

      if (activeCategory === "bookmarks") {
        const timeB = getBookmarkedAt(slugKeyB, numKeyB) || b.initialBookmarkedAt || 0;
        const timeA = getBookmarkedAt(slugKeyA, numKeyA) || a.initialBookmarkedAt || 0;
        return timeB - timeA;
      }

      const timeB = Math.max(
        getLikedAt(slugKeyB, numKeyB) || b.initialLikedAt || 0,
        getBookmarkedAt(slugKeyB, numKeyB) || b.initialBookmarkedAt || 0,
      );
      const timeA = Math.max(
        getLikedAt(slugKeyA, numKeyA) || a.initialLikedAt || 0,
        getBookmarkedAt(slugKeyA, numKeyA) || a.initialBookmarkedAt || 0,
      );
      return timeB - timeA;
    });
  }, [
    coursesList,
    activeCategory,
    sortBy,
    likedPosts,
    likedAtMap,
    bookmarkedPosts,
    bookmarkedAtMap,
    isLikedStored,
    isBookmarkedStored,
    getLikedAt,
    getBookmarkedAt,
    getLikesDelta,
    mounted,
  ]);

  // Pagination calculation: 3 items per page (1 row of 3)
  const totalPages = Math.ceil(displayedCourses.length / ITEMS_PER_PAGE) || 1;
  const paginatedCourses = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return displayedCourses.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [displayedCourses, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const likesCount = useMemo(() => {
    return coursesList.filter((c) => {
      const slugKey = c.slug ? String(c.slug) : "";
      const numKey = String(c.postId || c.id || "1");
      return isLikedStored(slugKey, numKey);
    }).length;
  }, [coursesList, likedPosts, isLikedStored]);

  const bookmarksCount = useMemo(() => {
    return coursesList.filter((c) => {
      const slugKey = c.slug ? String(c.slug) : "";
      const numKey = String(c.postId || c.id || "1");
      return isBookmarkedStored(slugKey, numKey);
    }).length;
  }, [coursesList, bookmarkedPosts, isBookmarkedStored]);

  const totalCount = useMemo(() => {
    return coursesList.filter((c) => {
      const slugKey = c.slug ? String(c.slug) : "";
      const numKey = String(c.postId || c.id || "1");
      return isLikedStored(slugKey, numKey) || isBookmarkedStored(slugKey, numKey);
    }).length;
  }, [coursesList, likedPosts, bookmarkedPosts, isLikedStored, isBookmarkedStored]);

  return (
    <main className="bg-background min-h-screen">
      {/* Header Section */}
      <section className="border-b border-line bg-white px-5 pb-0 pt-6 lg:px-52 lg:pt-[60px] xl:px-60 2xl:px-72">
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
            <h1 className="mt-3 text-[22px] font-black leading-tight text-ink lg:text-[34px]">
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
                  : totalCount;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
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
      <section className="px-4 py-5 sm:px-8 sm:py-14 lg:px-52 lg:py-14 xl:px-60 2xl:px-72">
        <div className="max-w-[1020px] mx-auto">
          {/* 상단 툴바: 우측 정렬 드롭다운 토글 */}
          <div className="mb-5 sm:mb-6 flex items-center justify-between">
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
                    onClick={() => handleSortChange("latest")}
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
                    onClick={() => handleSortChange("popular")}
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

          {/* 카드 그리드 (10% 축소 사이즈) */}
          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
              <div className="size-8 animate-spin rounded-full border-3 border-brand border-t-transparent" />
              <p className="text-xs font-bold text-ink-muted">코스를 불러오는 중...</p>
            </div>
          ) : paginatedCourses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-5">
                {paginatedCourses.map((course) => (
                  <BookmarkCard
                    key={course.postId || course.slug || course.id}
                    course={course}
                    onAuthRequired={() => setIsLoginModalOpen(true)}
                  />
                ))}
              </div>

              {/* 페이징 컨트롤 */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`flex size-9 items-center justify-center rounded-xl font-bold transition ${
                      currentPage === 1
                        ? "cursor-not-allowed text-ink-muted/40 border border-line bg-white/50"
                        : "cursor-pointer border border-line bg-white text-ink hover:border-brand hover:text-brand shadow-xs"
                    }`}
                    aria-label="이전 페이지"
                  >
                    ‹
                  </button>

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

                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`flex size-9 items-center justify-center rounded-xl font-bold transition ${
                      currentPage === totalPages
                        ? "cursor-not-allowed text-ink-muted/40 border border-line bg-white/50"
                        : "cursor-pointer border border-line bg-white text-ink hover:border-brand hover:text-brand shadow-xs"
                    }`}
                    aria-label="다음 페이지"
                  >
                    ›
                  </button>
                </div>
              )}
            </>
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
