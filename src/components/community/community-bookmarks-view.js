"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import { getMyBookmarks } from "@/lib/api/users";
import { unbookmarkCourse } from "@/lib/api/community";

const tabs = ["전체", "최신순", "인기순"];

function BookmarkCard({ course, onUnbookmark }) {
  const [isRemoving, setIsRemoving] = useState(false);
  const postId = course.postId || course.id || course.courseId || "1";
  const href = `/community/${postId}`;

  async function handleRemove(e) {
    e.preventDefault();
    e.stopPropagation();
    if (isRemoving) return;
    setIsRemoving(true);
    try {
      await unbookmarkCourse(postId);
    } catch {
      // Ignore API errors
    } finally {
      onUnbookmark(postId);
      setIsRemoving(false);
    }
  }

  return (
    <div className="group relative block overflow-hidden rounded-[28px] bg-white shadow-[0_10px_24px_rgba(43,28,89,0.08)] transition duration-200 hover:-translate-y-1.5 hover:shadow-[0_18px_32px_rgba(43,28,89,0.14)]">
      <Link href={href} className="block">
        <div
          className={`flex h-[158px] bg-linear-to-br ${course.gradient || "from-[#2d1b8e] to-[#8c57fa]"} px-6 py-7 transition duration-300 group-hover:brightness-105`}
        >
          <span className="text-xs font-black text-white">DITTO FAVORITE</span>
        </div>
        <div className="px-5 pb-6 pt-7">
          <div className="flex items-center gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-black text-brand">
              {course.country || "KR"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-black leading-none text-ink">
                {course.authorName || course.author || course.name || "여행자"}
              </p>
              <p className="mt-1 truncate text-[11px] font-black leading-none text-brand">
                {course.hash || "#좋아요한코스"}
              </p>
            </div>
          </div>
          <h2 className="mt-7 min-h-[58px] text-[22px] font-black leading-tight text-ink group-hover:text-brand transition-colors">
            {course.title || course.name || "더현대 맞춤 코스"}
          </h2>
          <div className="mt-5 h-px bg-line" />
          <div className="mt-4 flex items-center justify-between text-xs font-medium text-ink-muted">
            <span className="font-bold text-red-500">♥ {course.likes ?? course.likeCount ?? 1}</span>
            <span>☷ {course.comments ?? course.commentCount ?? 0}</span>
            <span>📌 {course.saves ?? course.bookmarkCount ?? 1}</span>
          </div>
        </div>
      </Link>

      {/* Quick Unbookmark Heart Button */}
      <button
        type="button"
        onClick={handleRemove}
        disabled={isRemoving}
        aria-label="북마크 취소"
        title="북마크 취소"
        className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-md backdrop-blur-xs transition hover:bg-white hover:scale-110 cursor-pointer disabled:opacity-50"
      >
        <svg className="size-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>
    </div>
  );
}

export function CommunityBookmarksView() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);
  const [activeTab, setActiveTab] = useState("전체");

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    let isMounted = true;

    async function fetchBookmarks() {
      setLoading(true);
      try {
        const data = await getMyBookmarks();
        if (isMounted && Array.isArray(data)) {
          setBookmarks(data);
        }
      } catch {
        // If API fails or empty, fallback
        if (isMounted) {
          setBookmarks([]);
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

  function handleUnbookmark(postId) {
    setBookmarks((prev) =>
      prev.filter((item) => String(item.postId || item.id || item.courseId) !== String(postId)),
    );
  }

  const displayedBookmarks = useMemo(() => {
    if (activeTab === "인기순") {
      return [...bookmarks].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    }
    if (activeTab === "최신순") {
      return [...bookmarks].sort((a, b) => (b.postId || b.id || 0) - (a.postId || a.id || 0));
    }
    return bookmarks;
  }, [bookmarks, activeTab]);

  return (
    <main className="bg-background min-h-screen">
      {/* Header Section */}
      <section className="bg-white px-10 sm:px-14 pb-12 pt-[80px] lg:px-52 xl:px-60 2xl:px-72 border-b border-line">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-red-50 text-red-500">
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </span>
              <p className="text-xs font-black text-brand tracking-wider">
                MY FAVORITE COURSES
              </p>
            </div>
            <h1 className="mt-4 text-[32px] font-black leading-none text-ink lg:text-[36px]">
              내가 좋아요한 커뮤니티 코스
            </h1>
            <p className="mt-3 text-sm font-medium text-ink-muted">
              여행자들이 공유한 코스 중 내가 찜하고 좋아요한 코스들을 모아보세요.
            </p>

            <div className="mt-8 flex gap-8 border-b border-line">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`-mb-px border-b-2 pb-3 text-sm font-black transition cursor-pointer ${
                    activeTab === tab
                      ? "border-brand text-brand"
                      : "border-transparent text-ink-muted hover:text-ink"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <Link
            href="/community"
            className="inline-flex w-fit items-center justify-center rounded-full border border-line bg-surface-soft px-6 py-3 text-xs font-bold text-ink transition hover:border-brand hover:text-brand"
          >
            전체 커뮤니티 보기 →
          </Link>
        </div>
      </section>

      {/* Grid Content */}
      <section className="px-10 sm:px-14 py-[50px] lg:px-52 xl:px-60 2xl:px-72">
        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
            <div className="size-8 animate-spin rounded-full border-3 border-brand border-t-transparent" />
            <p className="text-xs font-bold text-ink-muted">좋아요한 코스를 불러오는 중...</p>
          </div>
        ) : displayedBookmarks.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {displayedBookmarks.map((course) => (
              <BookmarkCard
                key={course.postId || course.id || course.courseId}
                course={course}
                onUnbookmark={handleUnbookmark}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-line bg-white p-16 text-center shadow-xs">
            <div className="flex size-14 items-center justify-center rounded-full bg-red-50 text-red-500 mb-4">
              <svg className="size-7 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <h3 className="text-lg font-black text-ink">아직 좋아요한 코스가 없어요</h3>
            <p className="mt-2 text-xs text-ink-muted max-w-sm">
              여행자들이 만든 다채로운 코스를 구경하고 마음에 드는 코스에 하트를 눌러 보관해보세요!
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
    </main>
  );
}
