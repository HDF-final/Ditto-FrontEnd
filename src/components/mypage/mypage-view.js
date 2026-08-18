"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import { getMyProfile, getMyCourses, getMyBookmarks } from "@/lib/api/users";
import { getPersonaById } from "@/lib/fixtures/personas";
import { MypageProfile } from "@/components/mypage/mypage-profile";
import { MypageCourseCard } from "@/components/mypage/mypage-course-card";
import { ProfileEditModal } from "@/components/mypage/profile-edit-modal";
import {
  mypageCourses as fixtureCourses,
  mypageStats as fixtureStats,
  mypageTabs,
} from "@/lib/fixtures/mypage";

export function MypageView() {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [activeTab, setActiveTab] = useState("내 코스");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadMypageData() {
      setLoading(true);
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
        const [myCoursesData, bookmarksData] = await Promise.allSettled([
          getMyCourses(),
          getMyBookmarks(),
        ]);

        if (isMounted) {
          if (myCoursesData.status === "fulfilled" && Array.isArray(myCoursesData.value)) {
            setCourses(myCoursesData.value);
          }
          if (bookmarksData.status === "fulfilled" && Array.isArray(bookmarksData.value)) {
            setBookmarks(bookmarksData.value);
          }
        }
      } catch {
        // Ignore secondary data failure
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
    { value: String(courses.length > 0 ? courses.length : fixtureStats[0].value), label: "만든 코스" },
    { value: String(bookmarks.length > 0 ? bookmarks.length : fixtureStats[1].value), label: "찜한 코스" },
    { value: fixtureStats[2].value, label: "팔로워" },
    { value: fixtureStats[3].value, label: "팔로잉" },
  ];

  const displayedCourses =
    activeTab === "내 코스"
      ? (courses.length > 0 ? courses : fixtureCourses)
      : (bookmarks.length > 0 ? bookmarks : fixtureCourses.slice(0, 2));

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

        {/* Courses Grid */}
        {displayedCourses.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {displayedCourses.map((course, idx) => (
              <MypageCourseCard
                key={course.id || course.title || idx}
                course={{
                  badge: course.badge || "AI COURSE",
                  englishTitle: course.englishTitle || course.name || "Custom Course",
                  subtitle: course.subtitle || "더현대 서울 맞춤 코스",
                  title: course.title || course.name || "나만의 코스",
                  likes: course.likes || "0",
                  spotCount: course.spotCount || `${course.places?.length || 3}개 스팟`,
                  gradient: course.gradient || "from-[#5c2ef5] to-[#8c57fa]",
                  stops: course.stops || [
                    { floor: "B2", name: "나이키 라이즈" },
                    { floor: "1F", name: "워터폴 가든" },
                    { floor: "5F", name: "사운즈 포레스트" },
                  ],
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-line bg-white p-12 text-center">
            <p className="text-base font-bold text-ink">아직 등록된 코스가 없어요</p>
            <p className="mt-1 text-xs text-ink-muted">AI 추천을 통해 나만의 첫 번째 코스를 만들어보세요!</p>
            <Link
              href="/ai-course"
              className="mt-5 rounded-full bg-brand px-6 py-2.5 text-xs font-bold text-white transition hover:bg-brand-dark"
            >
              + 코스 만들러 가기
            </Link>
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
