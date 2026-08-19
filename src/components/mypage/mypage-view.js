"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import { getMyProfile, getMyBookmarks } from "@/lib/api/users";
import { getCourseDetail, getMyCourses } from "@/lib/api/courses";
import { getPersonaById } from "@/lib/fixtures/personas";
import { MypageProfile } from "@/components/mypage/mypage-profile";
import { MypageCourseCard } from "@/components/mypage/mypage-course-card";
import { ProfileEditModal } from "@/components/mypage/profile-edit-modal";
import { mypageTabs } from "@/lib/fixtures/mypage";

const COURSE_GRADIENTS = [
  "from-[#5c2ef5] to-[#8c57fa]",
  "from-[#2d1b8e] to-[#5c2ef5]",
  "from-[#6d28d9] to-[#c084fc]",
  "from-[#4a2fa8] to-[#7c5cf0]",
];

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

async function hydrateMyCourses(data) {
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

      return {
        id: course.courseId,
        badge: "MY COURSE",
        englishTitle: "My Course",
        subtitle: `더현대 서울 · ${placeCount}개 스팟 코스`,
        title: detail?.name || course.name || "나만의 코스",
        spotCount: `${placeCount}개 스팟`,
        gradient: COURSE_GRADIENTS[index % COURSE_GRADIENTS.length],
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
    bookmarks: page.content.map((bookmark, index) => ({
      id: bookmark.postId || bookmark.courseId,
      href: bookmark.postId ? `/community/${bookmark.postId}` : undefined,
      badge: "BOOKMARK",
      englishTitle: "Favorite Course",
      subtitle: "찜한 커뮤니티 코스",
      title: bookmark.title || "이름 없는 코스",
      likes: Number(bookmark.likeCount) || 0,
      bookmarkCount: Number(bookmark.bookmarkCount) || 0,
      gradient: COURSE_GRADIENTS[index % COURSE_GRADIENTS.length],
      stops: [],
    })),
  };
}

function formatOptionalCount(value) {
  if (value === null || value === undefined) return "—";
  const count = Number(value);
  return Number.isFinite(count) ? count.toLocaleString("ko-KR") : "—";
}

export function MypageView() {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [courseTotal, setCourseTotal] = useState(0);
  const [bookmarkTotal, setBookmarkTotal] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState("내 코스");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadMypageData() {
      setLoading(true);
      setLoadError("");
      try {
        const userProfile = await getMyProfile();
        if (isMounted && userProfile) {
          setProfile(userProfile);
          setUser(userProfile);
        }
      } catch {
        // If unauthenticated or request fails, profile remains null
      }

      try {
        const [myCoursesResult, bookmarksResult] = await Promise.allSettled([
          getMyCourses(),
          getMyBookmarks(),
        ]);

        if (isMounted) {
          const failures = [];

          if (myCoursesResult.status === "fulfilled") {
            const hydrated = await hydrateMyCourses(myCoursesResult.value);
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
            setBookmarkTotal(normalized.totalElements);
          } else {
            setBookmarks([]);
            setBookmarkTotal(0);
            failures.push("찜한 코스");
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
    { value: bookmarkTotal.toLocaleString("ko-KR"), label: "찜한 코스" },
    { value: formatOptionalCount(currentUser.followerCount), label: "팔로워" },
    { value: formatOptionalCount(currentUser.followingCount), label: "팔로잉" },
  ];

  const displayedCourses =
    activeTab === "내 코스"
      ? courses
      : activeTab === "찜한 코스"
        ? bookmarks
        : [];

  const emptyState = {
    "내 코스": {
      title: "아직 저장한 코스가 없어요",
      description: "AI 추천 또는 직접 추가로 나만의 첫 코스를 만들어보세요!",
      actionLabel: "+ 코스 만들러 가기",
      actionHref: "/ai-course",
    },
    "찜한 코스": {
      title: "아직 찜한 코스가 없어요",
      description: "커뮤니티에서 마음에 드는 코스를 찾아 저장해보세요.",
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
        <div className="mb-[60px] flex gap-[22px] border-b border-line">
          {mypageTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`-mb-px border-b-2 pb-3.5 text-[15px] font-black transition cursor-pointer ${
                activeTab === tab
                  ? "border-brand text-brand"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loadError ? (
          <p className="mb-5 rounded-[14px] border border-[#f3ccc4] bg-[#fef5f3] px-4 py-3 text-sm font-medium text-[#c0392b]">
            {loadError}
          </p>
        ) : null}

        {/* Courses Grid */}
        {displayedCourses.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {displayedCourses.map((course, idx) => (
              <MypageCourseCard
                key={course.id || course.title || idx}
                course={course}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-line bg-white p-12 text-center">
            <p className="text-base font-bold text-ink">{emptyState.title}</p>
            <p className="mt-1 text-xs text-ink-muted">{emptyState.description}</p>
            {emptyState.actionHref ? (
              <Link
                href={emptyState.actionHref}
                className="mt-5 rounded-full bg-brand px-6 py-2.5 text-xs font-bold text-white transition hover:bg-brand-dark"
              >
                {emptyState.actionLabel}
              </Link>
            ) : null}
          </div>
        )}
      </section>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentProfile={displayProfile}
        onProfileUpdated={(updated) => setProfile(updated)}
      />
    </main>
  );
}
