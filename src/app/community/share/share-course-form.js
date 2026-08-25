"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createCoursePost } from "@/lib/api/community";
import { useCommunityPostImagesStore } from "@/stores/use-community-post-images-store";
import { compressImage } from "@/lib/utils/image-compression";

function CourseOption({ course, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-[20px] border bg-white px-3 py-3 text-left transition sm:gap-4 sm:rounded-[24px] sm:px-4 sm:py-4 ${
        selected
          ? "border-brand shadow-[0_8px_20px_rgba(92,46,245,0.1)] ring-1 ring-brand"
          : "border-line hover:border-line-hover"
      }`}
      aria-pressed={selected}
    >
      <div
        className={`h-[72px] w-[72px] shrink-0 rounded-[14px] bg-linear-to-br sm:h-[92px] sm:w-[116px] sm:rounded-[16px] ${course.gradient || "from-[#5c2ef5] to-[#9b5cf6]"}`}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black text-brand">{course.category}</p>
        <h2 className="mt-1.5 truncate text-base font-black text-ink sm:mt-3 sm:text-xl">
          {course.title}
        </h2>
        <p className="mt-2 truncate text-[11px] font-medium text-ink-muted">
          {course.tags}
        </p>
        <p className="mt-3 text-[11px] font-medium text-ink-muted">
          {course.meta}
        </p>
      </div>
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-black transition ${
          selected ? "bg-brand text-white" : "bg-brand-soft text-transparent"
        }`}
        aria-hidden="true"
      >
        ✓
      </span>
    </button>
  );
}

function PhotoTile({ image, onRemove }) {
  if (!image) return null;
  return (
    <div className="group relative h-[166px] w-[118px] shrink-0 overflow-hidden rounded-[18px] border border-line bg-surface shadow-xs">
      <img
        src={image}
        alt="첨부 사진"
        className="h-full w-full object-cover"
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label="사진 삭제"
        className="absolute right-2 top-2 flex size-6 cursor-pointer items-center justify-center rounded-full bg-black/65 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black"
      >
        ✕
      </button>
    </div>
  );
}

export function ShareCourseForm({ courses = [], loading = false }) {
  const t = useTranslations("community");
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedCourse = courses[selectedIndex] || courses[0] || null;

  const [customTitle, setCustomTitle] = useState("");
  const title = customTitle || selectedCourse?.title || "";
  const [caption, setCaption] = useState("");
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [createdPostId, setCreatedPostId] = useState(null);
  const [alertModalMessage, setAlertModalMessage] = useState("");

  const setPostImages = useCommunityPostImagesStore(
    (state) => state.setPostImages,
  );

  const shouldScroll = courses.length > 4;

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      try {
        const compressed = await compressImage(file);
        if (compressed) {
          setPhotos((prev) => [...prev, compressed].slice(0, 10));
        }
      } catch (err) {
        console.warn("[Photo Compress] Error:", err);
      }
    }

    e.target.value = "";
  };

  const handleRemovePhoto = (indexToRemove) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const publishCourse = async () => {
    if (!selectedCourse || submitting) return;

    const courseId = Number(selectedCourse.courseId || selectedCourse.id);
    if (!courseId || Number.isNaN(courseId)) {
      setAlertModalMessage("공유할 코스 정보가 올바르지 않습니다.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const result = await createCoursePost({
        courseId,
        title: title.trim() || selectedCourse.title || "나만의 코스",
        content: caption.trim() || "더현대 서울 맞춤 코스입니다.",
      });

      const newPostId =
        result?.postId ||
        result?.id ||
        result?.courseId ||
        (typeof result === "number" ? result : null) ||
        courseId;

      if (photos.length > 0) {
        setPostImages(newPostId, photos);
        setPostImages(courseId, photos);
        if (selectedCourse?.id) setPostImages(selectedCourse.id, photos);
      }

      setCreatedPostId(newPostId);
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error("Failed to publish course post:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "코스 게시글 공유에 실패했습니다. 로그인 상태를 확인해주세요.";
      setErrorMsg(message);
      setAlertModalMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-w-0 overflow-x-hidden bg-background">
      <section className="bg-white px-4 pb-6 pt-6 sm:px-14 lg:px-52 lg:pb-12 lg:pt-[94px] xl:px-60 2xl:px-72">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black text-brand">SHARE MY COURSE</p>
            <h1 className="mt-2 text-[22px] font-black leading-tight text-ink lg:mt-6 lg:text-[38px] lg:leading-none">
              {t("shareTitle")}
            </h1>
            <p className="mt-5 text-sm font-medium text-ink-muted">
              {t("shareDescription")}
            </p>
          </div>
          {selectedCourse && (
            <button
              type="button"
              onClick={publishCourse}
              disabled={submitting}
              className={`inline-flex w-fit items-center justify-center rounded-full px-10 py-4 text-sm font-black text-white shadow-control transition ${
                submitting
                  ? "cursor-not-allowed bg-brand/60"
                  : "cursor-pointer bg-brand hover:bg-brand-dark"
              }`}
            >
              {submitting ? "게시 중..." : "게시하기"}
            </button>
          )}
        </div>
      </section>

      <section className="bg-white px-4 pb-10 sm:px-14 lg:px-52 lg:pb-[120px] xl:px-60 2xl:px-72">
        {errorMsg && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-600">
            {errorMsg}
          </div>
        )}
        <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="min-w-0 rounded-[22px] bg-surface-soft p-4 sm:rounded-[28px] sm:p-7 lg:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-ink">{t("myCourses")}</h2>
              <span className="text-sm font-black text-brand">
                {courses.length}개
              </span>
            </div>
            <div className="mt-8">
              <span className="rounded-full bg-brand px-4 py-2 text-xs font-black text-white">
                {t("myCourses")}
              </span>
            </div>

            {loading ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center gap-3">
                <div className="size-7 animate-spin rounded-full border-3 border-brand border-t-transparent" />
                <p className="text-xs font-bold text-ink-muted">
                  내 코스를 불러오는 중...
                </p>
              </div>
            ) : courses.length === 0 ? (
              <div className="mt-6 flex flex-col items-center justify-center rounded-[24px] border border-dashed border-line bg-white p-10 text-center">
                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-black text-ink">
                  아직 생성된 코스가 없어요
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                  AI 맞춤 코스 만들기에서 먼저 나만의 코스를 생성해보세요!
                </p>
                <Link
                  href="/ai-course"
                  className="mt-5 cursor-pointer rounded-full bg-brand px-6 py-3 text-xs font-black text-white shadow-xs transition hover:bg-brand-dark"
                >
                  + AI 코스 만들기
                </Link>
              </div>
            ) : (
              <div
                className={`mt-6 flex flex-col gap-4 pr-1 ${
                  shouldScroll
                    ? "max-h-[530px] overflow-y-auto overscroll-contain"
                    : ""
                }`}
              >
                {courses.map((course, index) => (
                  <CourseOption
                    key={course.id || course.title}
                    course={course}
                    selected={selectedIndex === index}
                    onSelect={() => {
                      setSelectedIndex(index);
                      setCustomTitle("");
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          {selectedCourse ? (
            <section className="min-w-0 rounded-[22px] border border-line bg-white p-4 sm:rounded-[28px] sm:p-7 lg:p-8">
              <h2 className="text-xl font-black text-ink sm:text-2xl">
                선택한 코스에 사진 및 후기 첨부
              </h2>

              <label
                htmlFor="course-title-input"
                className="mt-6 block text-sm font-black text-ink"
              >
                게시글 제목
              </label>
              <input
                id="course-title-input"
                type="text"
                value={title}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="코스 제목을 입력하세요"
                className="mt-2 w-full rounded-[16px] border border-line bg-surface-soft px-4 py-3.5 text-base font-bold text-ink outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
              />

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-ink">사진 첨부</span>
                  <span className="text-xs font-medium text-ink-muted">
                    {photos.length}/10장
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="mt-3 flex gap-4 overflow-x-auto rounded-[28px] bg-surface-soft p-6">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-[166px] w-[176px] shrink-0 cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed border-line bg-white text-center transition hover:border-brand hover:bg-brand-soft/20"
                  >
                    <span className="text-[34px] font-black leading-none text-brand">
                      +
                    </span>
                    <span className="mt-4 text-sm font-black text-ink">
                      사진 첨부
                    </span>
                    <span className="mt-2 text-xs font-medium text-ink-muted">
                      최대 10장
                    </span>
                  </button>

                  {photos.map((photoUrl, idx) => (
                    <PhotoTile
                      key={idx}
                      image={photoUrl}
                      onRemove={() => handleRemovePhoto(idx)}
                    />
                  ))}
                </div>
              </div>

              <label
                htmlFor="review-caption"
                className="mt-7 block text-sm font-black text-ink"
              >
                후기 캡션
              </label>
              <textarea
                id="review-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={5}
                className="mt-2 w-full resize-none rounded-[20px] border border-line bg-surface-soft p-5 text-sm font-medium leading-6 text-ink outline-none transition placeholder:text-ink-muted/50 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                placeholder="코스에 대한 방문 후기 및 동선 꿀팁을 작성해보세요. (예: 사진 순서대로 이동하면 동선이 편리해요)"
              />

              <div className="mt-8 flex flex-col gap-5 rounded-[24px] bg-surface-soft p-4 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex min-w-0 items-center gap-3 sm:gap-5">
                  {photos.length > 0 ? (
                    <div className="relative size-[100px] shrink-0 overflow-hidden rounded-[18px] border border-line bg-slate-950 shadow-xs">
                      <img
                        src={photos[0]}
                        alt="대표 사진 미리보기"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={`size-[100px] shrink-0 rounded-[18px] bg-linear-to-br ${selectedCourse.gradient || "from-[#5c2ef5] to-[#9b5cf6]"}`}
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-black text-brand">
                      공유 미리보기
                    </p>
                    <h3 className="mt-2 break-keep text-lg font-black text-ink sm:mt-3 sm:text-xl">
                      {title || selectedCourse.title}
                    </h3>
                    <p className="mt-2 text-xs font-medium text-ink-muted">
                      {selectedCourse.tags}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={publishCourse}
                  disabled={submitting}
                  className={`inline-flex w-full shrink-0 items-center justify-center rounded-full px-9 py-4 text-sm font-black text-white shadow-control transition sm:w-auto ${
                    submitting
                      ? "cursor-not-allowed bg-brand/60"
                      : "cursor-pointer bg-brand hover:bg-brand-dark"
                  }`}
                >
                  {submitting ? "게시 중..." : "게시하기"}
                </button>
              </div>
            </section>
          ) : (
            <section className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-line bg-white p-12 text-center">
              <p className="text-sm font-bold text-ink-muted">
                왼쪽에서 공유할 내 코스를 선택해주세요.
              </p>
            </section>
          )}
        </div>
      </section>

      {isSuccessModalOpen ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 px-5 backdrop-blur-xs animate-in fade-in duration-150"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[390px] rounded-[28px] bg-white p-8 text-center shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand">
              <svg
                className="size-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-5 text-[22px] font-black text-ink">
              코스 공유 완료!
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              <strong className="font-bold text-ink">
                {title || selectedCourse?.title || "나만의 코스"}
              </strong>
              이(가) 커뮤니티에 성공적으로 등록되었어요.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-2.5">
              <Link
                href="/mypage"
                className="rounded-full border border-line bg-surface-soft px-4 py-3.5 text-center text-xs font-bold text-ink transition hover:bg-line"
              >
                마이페이지 보기
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  if (createdPostId) {
                    router.push(`/community/${createdPostId}`);
                  } else {
                    router.push("/community");
                  }
                }}
                className="cursor-pointer rounded-full bg-brand px-4 py-3.5 text-xs font-black text-white shadow-xs transition hover:bg-brand-dark"
              >
                커뮤니티 보기 →
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {alertModalMessage ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 px-5 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAlertModalMessage("");
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[340px] rounded-[24px] bg-white p-6 text-center shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <div className="mx-auto mb-3.5 flex size-12 items-center justify-center rounded-full bg-amber-50 text-amber-500">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-base font-black text-ink">알림</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              {alertModalMessage}
            </p>
            <button
              type="button"
              onClick={() => setAlertModalMessage("")}
              className="mt-5 w-full cursor-pointer rounded-full bg-brand py-2.5 text-xs font-black text-white shadow-xs transition hover:bg-brand-dark"
            >
              확인
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
