"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import { getMyProfile, getMyBookmarks } from "@/lib/api/users";
import { getCourseDetail, getMyCourses } from "@/lib/api/courses";
import { useCommunityInteractionsStore } from "@/stores/use-community-interactions-store";
import { communityCourses } from "@/lib/fixtures/community-courses";
import { getPersonaById } from "@/lib/fixtures/personas";
import { MypageProfile } from "@/components/mypage/mypage-profile";
import { MypageCourseCard } from "@/components/mypage/mypage-course-card";
import { ProfileEditModal } from "@/components/mypage/profile-edit-modal";
import { mypageTabs } from "@/lib/fixtures/mypage";
import { useIsMounted } from "@/hooks/use-is-mounted";

const ITEMS_PER_PAGE = 3;

function normalizePage(data) {
  if (Array.isArray(data)) {
    return { content: data, totalElements: data.length };
  }

  const content = Array.isArray(data?.content) ? data.content : [];
  const totalElements = Number(data?.totalElements);
  return {
    content,
    totalElements: Number.isFinite(totalElements)
      ? totalElements
      : content.length,
  };
}

async function hydrateMyCourses(data, userName = "디또러버") {
  const page = normalizePage(data);
  const details = await Promise.allSettled(
    page.content.map((course) => getCourseDetail(course.courseId)),
  );

  return {
    totalElements: page.totalElements,
    courses: page.content.map((course, index) => {
      const detailResult = details[index];
      const detail =
        detailResult?.status === "fulfilled" ? detailResult.value : null;
      const places = Array.isArray(detail?.places)
        ? [...detail.places].sort(
            (a, b) => Number(a.visitOrder) - Number(b.visitOrder),
          )
        : [];
      const placeCount = Number(course.placeCount ?? places.length) || 0;

      const description =
        places.length > 0
          ? places.map((p) => p.name).join(" → ")
          : `더현대 서울 · ${placeCount}개 스팟 맞춤 코스`;

      return {
        id: course.courseId,
        postId: course.courseId,
        href: `/community/${course.courseId}`,
        badge: "MY COURSE",
        name: userName,
        country: "KR",
        flag: "KR",
        hash: "#나만의코스 #더현대",
        title: detail?.name || course.name || "나만의 코스",
        description,
        image:
          detail?.representativeImageUrl ||
          course.representativeImageUrl ||
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=900&fit=crop",
        likes: 0,
        comments: 0,
        saves: 0,
        spotCount: `${placeCount}개 스팟`,
        stops: places.map((place) => ({
          floor: place.floorCode || "층 정보 없음",
          name: place.name || "이름 없는 장소",
        })),
      };
    }),
  };
}

function normalizeBookmarks(data) {
  const page = normalizePage(data);
  return {
    totalElements: page.totalElements,
    bookmarks: page.content.map((bookmark) => {
      const postId = bookmark.postId || bookmark.courseId;
      const fixture = communityCourses.find(
        (c) =>
          String(c.postId || c.slug) === String(postId) ||
          String(c.rank) === String(postId),
      );

      return {
        id: postId,
        postId,
        slug: fixture?.slug || String(postId),
        href: `/community/${fixture?.slug || postId}`,
        badge: "BOOKMARK",
        name: fixture?.name || "여행자",
        country: fixture?.country || "KR",
        flag: fixture?.flag || "KR",
        hash: fixture?.hash || "#인기코스 #더현대",
        title: bookmark.title || fixture?.title || "추천 커뮤니티 코스",
        description:
          bookmark.description ||
          fixture?.description ||
          "더현대 서울 맞춤 추천 코스",
        image:
          fixture?.image ||
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=900&fit=crop",
        likes: Number(bookmark.likeCount ?? fixture?.likes) || 0,
        comments: Number(bookmark.commentCount ?? fixture?.comments) || 0,
        saves: Number(bookmark.bookmarkCount ?? fixture?.saves) || 0,
        stops: fixture?.stops || [],
      };
    }),
  };
}

export function MypageView() {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);
  const mounted = useIsMounted();

  const isLikedStored = useCommunityInteractionsStore((state) => state.isLiked);
  const isBookmarkedStored = useCommunityInteractionsStore((state) => state.isBookmarked);
  const likedPosts = useCommunityInteractionsStore((state) => state.likedPosts);
  const bookmarkedPosts = useCommunityInteractionsStore((state) => state.bookmarkedPosts);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [courseTotal, setCourseTotal] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState("내 코스");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadMypageData() {
      setLoading(true);
      setLoadError("");
      let currentUserName = "디또러버";
      try {
        const userProfile = await getMyProfile();
        if (isMounted && userProfile) {
          setProfile(userProfile);
          setUser(userProfile);
          currentUserName = userProfile.nickname || userProfile.name || "디또러버";
        }
      } catch {
        // Profile fetch error
      }

      try {
        const [myCoursesResult, bookmarksResult] = await Promise.allSettled([
          getMyCourses(),
          getMyBookmarks(),
        ]);

        if (isMounted) {
          const failures = [];

          if (myCoursesResult.status === "fulfilled") {
            const hydrated = await hydrateMyCourses(myCoursesResult.value, currentUserName);
            if (!isMounted) return;
            setCourses(hydrated.courses);
            setCourseTotal(hydrated.totalElements);
          } else {
            setCourses([]);
            setCourseTotal(0);
            failures.push("내 코스");
          }

          if (bookmarksResult.status === "fulfilled") {
            const normalized = normalizeBookmarks(bookmarksResult.value);
            setBookmarks(normalized.bookmarks);
          } else {
            setBookmarks([]);
            failures.push("저장한 코스");
          }

          setLoadError(
            failures.length > 0
              ? `${failures.join(", ")} 목록을 불러오지 못했어요. 잠시 후 새로고침해주세요.`
              : "",
          );
        }
      } catch {
        if (isMounted) {
          setLoadError("코스 목록을 불러오지 못했어요. 잠시 후 새로고침해주세요.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadMypageData();

    return () => {
      isMounted = false;
    };
  }, [setUser]);

  // If not logged in after loading, redirect to /login immediately
  useEffect(() => {
    if (!loading && !profile && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, profile, isAuthenticated, router]);

  // 찜한 코스 (좋아요한 코스) - Unconditional Hook Call
  const likedCourses = useMemo(() => {
    if (!mounted) return [];
    return communityCourses
      .filter((c, idx) => {
        const slugKey = c.slug ? String(c.slug) : "";
        const numKey = String(c.postId || c.id || idx + 1);
        return isLikedStored(slugKey, numKey);
      })
      .map((c, index) => ({
        id: c.slug || c.postId || index + 1,
        postId: c.postId || c.id || index + 1,
        slug: c.slug,
        href: `/community/${c.slug || c.postId || index + 1}`,
        badge: "LIKED",
        name: c.name,
        country: c.country,
        flag: c.flag,
        hash: c.hash,
        title: c.title,
        description: c.description,
        image: c.image,
        likes: c.likes || 0,
        comments: c.comments || 0,
        saves: c.saves || 0,
        stops: c.stops || [],
      }));
  }, [likedPosts, isLikedStored, mounted]);

  // 저장한 코스 (북마크한 코스) - Unconditional Hook Call
  const bookmarkedCourses = useMemo(() => {
    if (!mounted) return bookmarks;
    const map = new Map();

    // 1. Backend Bookmarks
    bookmarks.forEach((b) => map.set(String(b.slug || b.id), b));

    // 2. Locally Bookmarked
    communityCourses.forEach((c, index) => {
      const slugKey = c.slug ? String(c.slug) : "";
      const numKey = String(c.postId || c.id || index + 1);
      if (isBookmarkedStored(slugKey, numKey)) {
        const key = slugKey || numKey;
        if (!map.has(key)) {
          map.set(key, {
            id: key,
            postId: c.postId || c.id || index + 1,
            slug: c.slug,
            href: `/community/${slugKey || numKey}`,
            badge: "BOOKMARK",
            name: c.name,
            country: c.country,
            flag: c.flag,
            hash: c.hash,
            title: c.title,
            description: c.description,
            image: c.image,
            likes: c.likes || 0,
            comments: c.comments || 0,
            saves: c.saves || 0,
            stops: c.stops || [],
          });
        }
      }
    });

    return Array.from(map.values());
  }, [bookmarks, bookmarkedPosts, isBookmarkedStored, mounted]);

  // Displayed courses list based on active tab
  const displayedCourses = useMemo(() => {
    if (activeTab === "내 코스") return courses;
    if (activeTab === "찜한 코스") return likedCourses;
    if (activeTab === "저장한 코스") return bookmarkedCourses;
    return [];
  }, [activeTab, courses, likedCourses, bookmarkedCourses]);

  // Pagination calculation: 3 items per page (1 row of 3) - Unconditional Hook Call
  const totalPages = Math.ceil(displayedCourses.length / ITEMS_PER_PAGE) || 1;
  const paginatedCourses = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return displayedCourses.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [displayedCourses, currentPage]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  // Loading indicator
  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-3 border-brand border-t-transparent" />
          <p className="text-xs font-bold text-ink-muted">마이페이지 불러오는 중...</p>
        </div>
      </main>
    );
  }

  // If not logged in -> return null while redirecting
  const currentUser = profile || (isAuthenticated ? authUser : null);
  if (!currentUser) {
    return null;
  }

  // Resolve persona and profile details
  const personaRaw =
    currentUser.persona ||
    currentUser.personaId ||
    currentUser.shoppingType ||
    currentUser.personaType ||
    "openrun";
  const personaData = getPersonaById(personaRaw);

  const personaImage =
    currentUser.profileImageUrl ||
    currentUser.personaImageUrl ||
    currentUser.imageUrl ||
    currentUser.imgUrl ||
    personaData.imageSrc;

  const displayProfile = {
    name: currentUser.nickname || currentUser.name || "디또러버",
    description: currentUser.description || `${currentUser.country || "한국"} · DITTO 탐험가`,
    persona: {
      id: personaData.id,
      name: personaData.name,
      description: personaData.description,
      image: personaImage,
      bgColor: personaData.theme?.bgColor || "#fff1e6",
      badgeBg: personaData.theme?.badgeBg || "#f5f3ff",
      badgeBorder: personaData.theme?.badgeBorder || "#e0d8ff",
      badgeText: personaData.theme?.badgeText || "#5c2ef5",
    },
  };

  const displayStats = [
    { value: courseTotal.toLocaleString("ko-KR"), label: "만든 코스" },
    { value: likedCourses.length.toLocaleString("ko-KR"), label: "찜한 코스" },
    { value: bookmarkedCourses.length.toLocaleString("ko-KR"), label: "저장한 코스" },
  ];

  const emptyState = {
    "내 코스": {
      title: "아직 생성한 코스가 없어요",
      description: "AI 추천 또는 직접 추가로 나만의 첫 코스를 만들어보세요!",
      actionLabel: "+ 코스 만들러 가기",
      actionHref: "/ai-course",
    },
    "찜한 코스": {
      title: "아직 찜한(좋아요한) 코스가 없어요",
      description: "커뮤니티에서 마음에 드는 코스를 찾아 좋아요를 눌러보세요.",
      actionLabel: "커뮤니티 둘러보기",
      actionHref: "/community",
    },
    "저장한 코스": {
      title: "아직 저장한(북마크한) 코스가 없어요",
      description: "커뮤니티에서 마음에 드는 코스를 찾아 북마크로 저장해보세요.",
      actionLabel: "커뮤니티 둘러보기",
      actionHref: "/community",
    },
    후기: {
      title: "아직 작성한 후기가 없어요",
      description: "방문한 코스의 후기를 남기면 이곳에서 확인할 수 있어요.",
    },
    활동: {
      title: "아직 표시할 활동이 없어요",
      description: "DITTO에서 코스를 만들고 커뮤니티에 참여해보세요.",
    },
  }[activeTab];

  return (
    <main className="bg-background">
      <MypageProfile
        profile={displayProfile}
        stats={displayStats}
        onEditClick={() => setIsEditModalOpen(true)}
      />
      <section className="px-10 sm:px-14 py-[60px] lg:px-52 xl:px-60 2xl:px-72">
        {/* Custom Tab Navigation */}
        <div className="mb-[40px] flex gap-[22px] border-b border-line">
          {mypageTabs.map((tab) => {
            const count =
              tab === "내 코스"
                ? courses.length
                : tab === "찜한 코스"
                  ? likedCourses.length
                  : tab === "저장한 코스"
                    ? bookmarkedCourses.length
                    : null;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={`-mb-px flex items-center gap-1.5 border-b-2 pb-3.5 text-[15px] font-black transition cursor-pointer ${
                  activeTab === tab
                    ? "border-brand text-brand"
                    : "border-transparent text-ink-muted hover:text-ink"
                }`}
              >
                <span>{tab}</span>
                {count !== null && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold transition ${
                      activeTab === tab
                        ? "bg-brand text-white"
                        : "bg-surface-soft text-ink-muted"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loadError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700">
            {loadError}
          </div>
        )}

        {/* 3:4 Cards Grid (10% Reduced Size) */}
        <div className="max-w-[1020px] mx-auto">
          {paginatedCourses.length > 0 ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedCourses.map((course) => (
                  <MypageCourseCard
                    key={course.id || course.slug}
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
            <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-line bg-white p-16 text-center shadow-xs">
              <h3 className="text-xl font-black text-ink">{emptyState?.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">
                {emptyState?.description}
              </p>
              {emptyState?.actionLabel && emptyState?.actionHref && (
                <Link
                  href={emptyState.actionHref}
                  className="mt-6 rounded-full bg-brand px-8 py-3.5 text-sm font-black text-white shadow-control transition hover:bg-brand-dark"
                >
                  {emptyState.actionLabel}
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <ProfileEditModal
          profile={currentUser}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={(updatedProfile) => {
            setProfile(updatedProfile);
            setUser(updatedProfile);
          }}
        />
      )}

      {/* Login Required Modal */}
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
