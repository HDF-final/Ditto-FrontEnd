"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import { bookmarkCourse, unbookmarkCourse } from "@/lib/api/courses";
import { getMySavedCourses } from "@/lib/api/users";
import { useCommunityInteractionsStore } from "@/stores/use-community-interactions-store";
import { CommunityShareButton } from "@/app/community/[postId]/community-share-button";
import { useTranslations } from "next-intl";

export function CourseDetailActions({ course = {} }) {
  const t = useTranslations("community");
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const courseId =
    course.courseId ||
    course.postId ||
    course.id ||
    (typeof course.slug === "number" || /^\d+$/.test(course.slug)
      ? Number(course.slug)
      : null);

  const courseSlug = course.slug ? String(course.slug) : "";
  const courseIdStr = courseId ? String(courseId) : "";

  const isBookmarkedStored = useCommunityInteractionsStore((state) =>
    state.isBookmarked(courseSlug, courseIdStr),
  );
  const setBookmarked = useCommunityInteractionsStore(
    (state) => state.setBookmarked,
  );

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error
  const [savedCourseId, setSavedCourseId] = useState(null);
  const [saveError, setSaveError] = useState("");
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const isSaved =
    saveStatus === "saved" ||
    savedCourseId !== null ||
    isBookmarkedStored;

  useEffect(() => {
    let alive = true;

    async function syncSavedState() {
      if (!isAuthenticated || !courseId) {
        setSavedCourseId(null);
        setSaveStatus("idle");
        return;
      }

      try {
        const savedCourses = await getMySavedCourses({ page: 0, size: 100 });
        if (!alive) return;
        const content = Array.isArray(savedCourses?.content)
          ? savedCourses.content
          : Array.isArray(savedCourses)
            ? savedCourses
            : [];
        const alreadySaved = content.some(
          (saved) => Number(saved.courseId || saved.id) === Number(courseId),
        );
        if (alreadySaved) {
          setSavedCourseId(courseId);
          setSaveStatus("saved");
          setBookmarked(courseSlug, true, courseIdStr);
        } else if (!isBookmarkedStored) {
          setSavedCourseId(null);
          setSaveStatus("idle");
        }
      } catch (err) {
        if (alive) {
          console.warn("[CourseDetailActions] Failed to sync saved state:", err?.message);
        }
      }
    }

    syncSavedState();

    return () => {
      alive = false;
    };
  }, [courseId, courseSlug, courseIdStr, isAuthenticated, isBookmarkedStored, setBookmarked]);

  async function handleSaveCourse() {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    if (saveStatus === "saving") return;

    if (!courseId) {
      setSaveError("이 코스는 지금 저장할 수 없어요. 잠시 후 다시 시도해 주세요.");
      setSaveStatus("error");
      return;
    }

    setSaveStatus("saving");
    setSaveError("");

    if (isSaved) {
      // 이미 저장된 경우 -> 저장 취소 토글
      try {
        await unbookmarkCourse(courseId);
        setSavedCourseId(null);
        setSaveStatus("idle");
        setBookmarked(courseSlug, false, courseIdStr);
      } catch (err) {
        setSaveError(err?.message || "저장 취소에 실패했어요. 다시 시도해 주세요.");
        setSaveStatus("error");
      }
    } else {
      // 저장되지 않은 경우 -> 저장 토글
      try {
        const saved = await bookmarkCourse(courseId);
        setSavedCourseId(saved?.courseId ?? courseId ?? true);
        setSaveStatus("saved");
        setIsSuccessOpen(true);
        setBookmarked(courseSlug, true, courseIdStr);
      } catch (err) {
        if (err?.status === 409 || err?.code === "CM004") {
          setSavedCourseId(courseId);
          setSaveStatus("saved");
          setSaveError("");
          setBookmarked(courseSlug, true, courseIdStr);
          return;
        }
        setSaveError(err?.message || "코스 저장에 실패했어요. 다시 시도해 주세요.");
        setSaveStatus("error");
      }
    }
  }

  const saveLabel =
    saveStatus === "saving"
      ? "저장 중…"
      : isSaved
        ? t("saved")
        : t("saveCourse");

  return (
    <>
      <div className="mt-4 flex min-w-0 flex-wrap items-center gap-2 sm:gap-3 lg:mt-5">
        {/* 코스 저장 — 마이페이지 '저장한 코스'에 표시 */}
        <button
          type="button"
          onClick={handleSaveCourse}
          disabled={saveStatus === "saving"}
          aria-busy={saveStatus === "saving"}
          className={`inline-flex h-11 min-w-0 flex-1 basis-[calc(50%-0.25rem)] items-center justify-center gap-1.5 rounded-full px-3 text-xs font-black transition shadow-xs hover:scale-[1.02] cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 sm:h-12 sm:min-w-[142px] sm:flex-none sm:basis-auto sm:gap-2 sm:px-8 sm:text-sm ${
            isSaved
              ? "border border-brand bg-brand-soft text-brand hover:bg-[#e7ddff]"
              : "bg-brand text-white hover:bg-brand-dark"
          }`}
        >
          <svg
            className={`size-4.5 ${isSaved ? "fill-current" : ""}`}
            viewBox="0 0 24 24"
            fill={isSaved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <span>{saveLabel}</span>
        </button>

        {/* 공유하기 버튼 */}
        <CommunityShareButton />
      </div>

      {saveStatus === "error" && saveError ? (
        <p className="mt-2.5 rounded-xl bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600">
          {saveError}
        </p>
      ) : null}

      {/* 저장 완료 안내 모달 */}
      {isSuccessOpen ? (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 px-5 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSuccessOpen(false);
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
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-base font-black text-ink">코스 저장 완료!</h3>
            <p className="mt-2 text-xs text-ink-muted leading-relaxed">
              <strong className="font-bold text-ink">
                {course.title || "이 코스"}
              </strong>
              를 마이페이지 &lsquo;저장한 코스&rsquo;에 저장했어요.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSuccessOpen(false)}
                className="flex-1 rounded-full border border-line bg-surface-soft py-2.5 text-xs font-bold text-ink hover:bg-line transition cursor-pointer"
              >
                닫기
              </button>
              <Link
                href="/mypage"
                className="flex-1 rounded-full bg-brand py-2.5 text-xs font-black text-white shadow-xs hover:bg-brand-dark transition cursor-pointer"
              >
                마이페이지 보기
              </Link>
            </div>
          </div>
        </div>
      ) : null}

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
    </>
  );
}
