"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import { getMyProfile, getMyBookmarks } from "@/lib/api/users";
import { getCourseDetail, getMyCourses } from "@/lib/api/courses";
import { logout } from "@/lib/api/auth";
import {
  getPublicCourses,
  updateCoursePost,
  uploadCoursePostImages,
} from "@/lib/api/community";
import { useCommunityInteractionsStore } from "@/stores/use-community-interactions-store";
import { compressImage, dataUrlToBlob } from "@/lib/utils/image-compression";
import { communityCourses } from "@/lib/fixtures/community-courses";
import { getPersonaById } from "@/lib/fixtures/personas";
import { MypageProfile } from "@/components/mypage/mypage-profile";
import { MypageCourseCard } from "@/components/mypage/mypage-course-card";
import { MypageCourseCarousel } from "@/components/mypage/mypage-course-carousel";
import { MyCoursePrivateCard } from "@/components/mypage/my-course-private-card";
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

function normalizeSharedCourses(publicPosts, userCourses, userName = "디또러버") {
  const userCourseMap = new Map();
  (userCourses || []).forEach((c) => {
    userCourseMap.set(Number(c.courseId || c.id || c.postId), c);
  });

  const list = Array.isArray(publicPosts)
    ? publicPosts
    : Array.isArray(publicPosts?.content)
      ? publicPosts.content
      : [];

  return list
    .filter((post) => userCourseMap.has(Number(post.courseId)))
    .map((post) => {
      const linkedCourse = userCourseMap.get(Number(post.courseId));
      const stops = linkedCourse?.stops || [];
      const spotCount =
        linkedCourse?.spotCount ||
        (stops.length > 0 ? `${stops.length}개 스팟` : "맞춤 코스");

      return {
        id: post.postId,
        postId: post.postId,
        courseId: post.courseId,
        slug: String(post.postId),
        href: `/community/${post.postId}`,
        badge: "SHARED",
        name: userName,
        country: "KR",
        flag: "KR",
        hash: "#공유한코스 #더현대",
        title: post.title || linkedCourse?.title || "공유한 코스",
        description:
          post.content ||
          linkedCourse?.description ||
          "커뮤니티에 공유한 코스입니다.",
        image:
          (Array.isArray(post.imageUrls) && post.imageUrls[0]) ||
          linkedCourse?.image ||
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=900&fit=crop",
        images: Array.isArray(post.imageUrls) ? post.imageUrls.filter(Boolean) : [],
        likes: Number(post.likeCount) || 0,
        comments: Number(post.commentCount) || 0,
        saves: Number(post.bookmarkCount) || 0,
        spotCount,
        stops,
      };
    });
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
        href: `/ai-course?courseId=${course.courseId}&from=mypage`,
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
  const clearUser = useAuthStore((state) => state.clearUser);
  const mounted = useIsMounted();

  const handleLogout = async () => {
    clearUser();
    try {
      await logout();
    } catch (err) {
      console.warn("[MypageView] Error calling logout:", err?.message);
    } finally {
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
    }
  };

  const isLikedStored = useCommunityInteractionsStore((state) => state.isLiked);
  const isBookmarkedStored = useCommunityInteractionsStore((state) => state.isBookmarked);
  const likedPosts = useCommunityInteractionsStore((state) => state.likedPosts);
  const bookmarkedPosts = useCommunityInteractionsStore((state) => state.bookmarkedPosts);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [sharedCourses, setSharedCourses] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [courseTotal, setCourseTotal] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState("내 코스");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editPhotos, setEditPhotos] = useState([]);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const fileInputRef = useRef(null);
  const handleEditFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      try {
        const compressed = await compressImage(file);
        if (compressed) {
          setEditPhotos((prev) => [...prev, compressed].slice(0, 10));
        }
      } catch (err) {
        console.warn("[Edit Photo Compress] Error:", err);
      }
    }

    e.target.value = "";
  };

  const handleRemoveEditPhoto = (indexToRemove) => {
    setEditPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleConfirmEditPost = async (e) => {
    e?.preventDefault();
    if (!postToEdit) return;
    const targetId = postToEdit.postId || postToEdit.id;
    if (!editTitle.trim()) {
      alert("게시글 제목을 입력해주세요.");
      return;
    }
    setIsEditingPost(true);
    try {
      await updateCoursePost(targetId, {
        title: editTitle.trim(),
        content: editContent.trim(),
      });

      // 새로 추가한 사진만 업로드합니다(백엔드는 기존 뒤에 이어 붙임). 편집창에
      // 이미 있던 사진은 http URL 이라 dataUrlToBlob 이 걸러내고, 방금 고른 사진만
      // base64 → Blob 으로 변환되어 전송됩니다. 응답의 imageUrls 로 목록을 갱신합니다.
      let nextImages = Array.isArray(postToEdit.images)
        ? postToEdit.images.filter(Boolean)
        : [];
      const newBlobs = editPhotos.map(dataUrlToBlob).filter(Boolean);
      if (newBlobs.length > 0) {
        try {
          const uploaded = await uploadCoursePostImages(targetId, newBlobs);
          if (Array.isArray(uploaded?.imageUrls)) {
            nextImages = uploaded.imageUrls.filter(Boolean);
          }
        } catch (uploadError) {
          console.warn("Failed to upload edited course post images:", uploadError);
        }
      }

      setSharedCourses((prev) =>
        prev.map((p) =>
          (p.postId || p.id) === targetId
            ? {
                ...p,
                title: editTitle.trim(),
                description: editContent.trim(),
                images: nextImages,
                image: nextImages[0] || p.image,
              }
            : p,
        ),
      );
      setPostToEdit(null);
    } catch (err) {
      alert(err.message || "게시글 수정에 실패했습니다.");
    } finally {
      setIsEditingPost(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadMypageData() {
      setLoading(true);
      setLoadError("");
      let currentUserName = "사토 유키";
      try {
        const userProfile = await getMyProfile();
        if (isMounted && userProfile) {
          setProfile(userProfile);
          setUser(userProfile);
          currentUserName = userProfile.nickname || userProfile.name || "사토 유키";
        } else if (isMounted) {
          setUser();
        }
      } catch {
        if (isMounted) {
          setUser();
        }
      }

      try {
        const [myCoursesResult, bookmarksResult, publicCoursesResult] =
          await Promise.allSettled([
            getMyCourses(),
            getMyBookmarks(),
            getPublicCourses({ page: 0, size: 100 }),
          ]);

        if (isMounted) {
          const failures = [];
          let hydratedCourses = [];

          if (myCoursesResult.status === "fulfilled") {
            const hydrated = await hydrateMyCourses(myCoursesResult.value, currentUserName);
            if (!isMounted) return;
            hydratedCourses = hydrated.courses;
            setCourses(hydrated.courses);
            setCourseTotal(hydrated.totalElements);
          } else {
            setCourses([]);
            setCourseTotal(0);
            failures.push("내 코스");
          }

          if (publicCoursesResult.status === "fulfilled") {
            const publicList = Array.isArray(publicCoursesResult.value?.content)
              ? publicCoursesResult.value.content
              : Array.isArray(publicCoursesResult.value)
                ? publicCoursesResult.value
                : [];
            setSharedCourses(
              normalizeSharedCourses(
                publicList,
                hydratedCourses,
                currentUserName,
              ),
            );
          } else {
            setSharedCourses([]);
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
    if (activeTab === "공유한 코스") return sharedCourses;
    if (activeTab === "찜한 코스") return likedCourses;
    if (activeTab === "저장한 코스") return bookmarkedCourses;
    return [];
  }, [activeTab, courses, sharedCourses, likedCourses, bookmarkedCourses]);

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

  const renderCourseCard = (course) => {
    if (activeTab === "내 코스") {
      return <MyCoursePrivateCard course={course} />;
    }

    if (activeTab === "공유한 코스") {
      return (
        <MypageCourseCard
          course={course}
          onAuthRequired={() => setIsLoginModalOpen(true)}
          onEdit={(post) => {
            setPostToEdit(post);
            setEditTitle(post.title || "");
            setEditContent(post.description || "");
            const serverImages = Array.isArray(post.images)
              ? post.images.filter(Boolean)
              : [];
            if (serverImages.length > 0) {
              setEditPhotos(serverImages);
            } else if (post.image && !post.image.includes("unsplash.com")) {
              setEditPhotos([post.image]);
            } else {
              setEditPhotos([]);
            }
          }}
        />
      );
    }

    return (
      <MypageCourseCard
        course={course}
        onAuthRequired={() => setIsLoginModalOpen(true)}
      />
    );
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
      primaryColor: personaData.theme?.primaryColor || "#5c2ef5",
      primaryHover: personaData.theme?.primaryHover || "#4c1dd4",
      bgColor: personaData.theme?.bgColor || "#fff1e6",
      badgeBg: personaData.theme?.badgeBg || "#f5f3ff",
      badgeBorder: personaData.theme?.badgeBorder || "#e0d8ff",
      badgeText: personaData.theme?.badgeText || "#5c2ef5",
      statBg: personaData.theme?.statBg || "#f9f7ff",
      statBorder: personaData.theme?.statBorder || "#ede9fe",
      softButtonBg: personaData.theme?.softButtonBg || "#f5f3ff",
      softButtonBorder: personaData.theme?.softButtonBorder || "#e0d8ff",
      softButtonText: personaData.theme?.softButtonText || "#5c2ef5",
      softButtonHover: personaData.theme?.softButtonHover || "#ede9fe",
    },
  };

  const displayStats = [
    { value: courseTotal.toLocaleString("ko-KR"), label: "만든 코스" },
    { value: sharedCourses.length.toLocaleString("ko-KR"), label: "공유한 코스" },
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
    "공유한 코스": {
      title: "아직 커뮤니티에 공유한 코스가 없어요",
      description: "내가 만든 맞춤 코스를 여행자 커뮤니티에 공유해보세요!",
      actionLabel: "코스 공유하러 가기",
      actionHref: "/community/share",
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
    <main className="min-w-0 overflow-x-hidden bg-background lg:flex lg:min-h-[calc(100dvh-94px)] lg:flex-col">
      <MypageProfile
        profile={displayProfile}
        stats={displayStats}
        onEditClick={() => setIsEditModalOpen(true)}
        onLogoutClick={handleLogout}
      />
      <section className="min-w-0 overflow-x-hidden px-4 py-5 sm:px-8 sm:py-6 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:px-52 lg:py-6 xl:px-60 2xl:px-72">
        <div className="mb-5 flex gap-4 overflow-x-auto border-b border-line [-ms-overflow-style:none] [scrollbar-width:none] lg:mb-5 lg:gap-[22px] lg:overflow-visible [&::-webkit-scrollbar]:hidden">
          {mypageTabs.map((tab) => {
            return (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={`-mb-px flex shrink-0 cursor-pointer items-center gap-1.5 border-b-2 pb-2.5 text-[13px] font-black transition lg:pb-3.5 lg:text-[15px] ${
                  activeTab === tab
                    ? "border-brand text-brand"
                    : "border-transparent text-ink-muted hover:text-ink"
                }`}
              >
                <span>{tab}</span>
              </button>
            );
          })}
        </div>

        {loadError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700">
            {loadError}
          </div>
        )}

        <div className="mx-auto flex w-full min-w-0 max-w-[720px] flex-1 flex-col lg:max-w-[1020px]">
          {displayedCourses.length > 0 ? (
            <>
              <div className="lg:hidden">
                <MypageCourseCarousel
                  items={displayedCourses}
                  getItemKey={(course) => course.id || course.slug}
                  renderItem={renderCourseCard}
                />
              </div>

              <div className="hidden min-h-0 lg:grid lg:flex-1 lg:grid-cols-3 lg:content-start lg:items-stretch lg:gap-5">
                {paginatedCourses.map((course) => (
                  <div
                    key={course.id || course.slug}
                    className="min-h-0 min-w-0"
                  >
                    {renderCourseCard(course)}
                  </div>
                ))}
              </div>

              {totalPages > 1 ? (
                <div className="mt-5 hidden shrink-0 items-center justify-center gap-2 lg:flex">
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`flex size-9 items-center justify-center rounded-xl font-bold transition ${
                      currentPage === 1
                        ? "cursor-not-allowed border border-line bg-white/50 text-ink-muted/40"
                        : "cursor-pointer border border-line bg-white text-ink shadow-xs hover:border-line-strong"
                    }`}
                    aria-label="이전 페이지"
                  >
                    ‹
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        className={`flex size-9 cursor-pointer items-center justify-center rounded-xl text-xs font-black transition ${
                          currentPage === pageNum
                            ? "bg-brand text-white shadow-md"
                            : "border border-line bg-white text-ink-muted shadow-xs hover:border-line-strong"
                        }`}
                        aria-current={
                          currentPage === pageNum ? "page" : undefined
                        }
                      >
                        {pageNum}
                      </button>
                    ),
                  )}

                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`flex size-9 items-center justify-center rounded-xl font-bold transition ${
                      currentPage === totalPages
                        ? "cursor-not-allowed border border-line bg-white/50 text-ink-muted/40"
                        : "cursor-pointer border border-line bg-white text-ink shadow-xs hover:border-line-strong"
                    }`}
                    aria-label="다음 페이지"
                  >
                    ›
                  </button>
                </div>
              ) : null}
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
          isOpen={isEditModalOpen}
          profile={currentUser}
          currentProfile={currentUser}
          onClose={() => setIsEditModalOpen(false)}
          onProfileUpdated={(updatedProfile) => {
            setProfile(updatedProfile);
            setUser(updatedProfile);
          }}
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

      {postToEdit ? (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 px-5 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isEditingPost) {
              setPostToEdit(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[90vh] w-full max-w-[500px] overflow-y-auto rounded-[28px] bg-white p-7 text-left shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-ink">공유한 코스 수정</h3>
              <button
                type="button"
                onClick={() => setPostToEdit(null)}
                className="text-sm font-bold text-ink-muted transition hover:text-ink"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmEditPost} className="mt-5 flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink">
                  게시글 제목
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="코스 제목을 입력하세요"
                  required
                  className="w-full rounded-xl border border-line bg-surface-soft px-3.5 py-2.5 text-sm font-bold text-ink outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink">
                  후기 및 코스 설명
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  placeholder="코스에 대한 후기나 팁을 작성하세요"
                  className="w-full resize-none rounded-xl border border-line bg-surface-soft px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-xs font-bold text-ink">
                    첨부 사진
                  </label>
                  <span className="text-[11px] font-medium text-ink-muted">
                    {editPhotos.length}/10장
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleEditFileChange}
                  className="hidden"
                />

                <div className="flex gap-2.5 overflow-x-auto rounded-xl bg-surface-soft p-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-20 w-20 shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-line bg-white text-center transition hover:border-brand hover:bg-brand-soft/20"
                  >
                    <span className="text-xl font-black leading-none text-brand">
                      +
                    </span>
                    <span className="mt-1 text-[11px] font-bold text-ink">
                      사진 추가
                    </span>
                  </button>

                  {editPhotos.map((photoUrl, idx) => (
                    <div
                      key={idx}
                      className="group/photo relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-slate-950 shadow-xs"
                    >
                      <img
                        src={photoUrl}
                        alt={`첨부 사진 ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="pointer-events-none absolute bottom-1 left-1 rounded bg-brand/90 px-1 py-0.5 text-[9px] font-black text-white">
                          대표
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveEditPhoto(idx)}
                        aria-label="사진 삭제"
                        className="absolute right-1 top-1 flex size-5 cursor-pointer items-center justify-center rounded-full bg-black/70 text-xs font-bold leading-none text-white shadow-sm transition hover:bg-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  disabled={isEditingPost}
                  onClick={() => setPostToEdit(null)}
                  className="flex-1 cursor-pointer rounded-full border border-line bg-surface-soft py-2.5 text-xs font-bold text-ink transition hover:bg-line disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isEditingPost}
                  className="flex-1 cursor-pointer rounded-full bg-brand py-2.5 text-xs font-black text-white shadow-xs transition hover:bg-brand-dark disabled:opacity-50"
                >
                  {isEditingPost ? "저장 중..." : "수정 완료"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
