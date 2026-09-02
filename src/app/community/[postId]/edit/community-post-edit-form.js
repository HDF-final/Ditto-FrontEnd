"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { updateCoursePost } from "@/lib/api/community";
import { isCommunityPostOwner } from "@/lib/community/author-ownership";
import { compressImage, dataUrlToBlob } from "@/lib/utils/image-compression";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { useAuthStore } from "@/stores/use-auth-store";

function getPhotoKey(prefix, value, index) {
  return `${prefix}-${String(value || "photo")}-${index}`;
}

function buildInitialPhotos(course = {}) {
  if (Array.isArray(course.imageItems) && course.imageItems.length > 0) {
    return course.imageItems
      .map((image, index) => ({
        key: getPhotoKey("existing", image.postImageId || image.imageUrl, index),
        type: "existing",
        postImageId: image.postImageId || "",
        url: image.imageUrl,
      }))
      .filter((image) => image.url);
  }

  return (Array.isArray(course.images) ? course.images : [])
    .map((url, index) => ({
      key: getPhotoKey("existing", url, index),
      type: "existing",
      postImageId: "",
      url,
    }))
    .filter((image) => image.url);
}

function CourseSummary({ course }) {
  return (
    <article className="rounded-[22px] border border-brand bg-white p-3 shadow-[0_8px_20px_rgba(92,46,245,0.1)] ring-1 ring-brand sm:rounded-[24px] sm:p-4">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <div className="relative h-[74px] w-[74px] shrink-0 overflow-hidden rounded-[16px] bg-slate-950 sm:h-[104px] sm:w-[132px]">
          {course.image ? (
            <img
              src={course.image}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className={`h-full w-full bg-linear-to-br ${course.gradient || "from-[#5c2ef5] to-[#9b5cf6]"}`}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black text-brand">COMMUNITY POST</p>
          <h2 className="mt-1 line-clamp-2 text-base font-black text-ink sm:mt-2 sm:text-xl">
            {course.title}
          </h2>
          <p className="mt-1.5 text-[11px] font-medium text-ink-muted sm:mt-2">
            총 {course.stops?.length || 0}개 스팟
          </p>
        </div>
      </div>
    </article>
  );
}

function PhotoTile({ photo, onRemove }) {
  if (!photo?.url) return null;

  return (
    <div className="group relative h-[128px] w-[92px] shrink-0 overflow-hidden rounded-[18px] border border-line bg-surface shadow-xs sm:h-[166px] sm:w-[118px]">
      <img
        src={photo.url}
        alt="첨부 사진"
        className="h-full w-full object-cover"
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label="사진 삭제"
        className="absolute right-2 top-2 flex size-6 cursor-pointer items-center justify-center rounded-full bg-black/65 text-xs text-white opacity-100 transition hover:bg-black sm:opacity-0 sm:group-hover:opacity-100"
      >
        x
      </button>
    </div>
  );
}

function PermissionNotice({ course }) {
  return (
    <main className="min-w-0 bg-background px-4 py-20 sm:px-14 lg:px-52">
      <section className="mx-auto max-w-[520px] rounded-[28px] bg-white p-8 text-center shadow-[0_12px_30px_rgba(43,28,89,0.08)]">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand">
          <svg
            className="size-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2Zm10-10V7a4 4 0 0 0-8 0v4"
            />
          </svg>
        </div>
        <h1 className="mt-5 text-2xl font-black text-ink">수정 권한이 없어요</h1>
        <p className="mt-3 text-sm font-medium leading-6 text-ink-muted">
          이 게시글을 작성한 사용자만 제목, 후기, 사진을 수정할 수 있어요.
        </p>
        <div className="mt-7 grid grid-cols-2 gap-2.5">
          <Link
            href="/community"
            className="rounded-full border border-line bg-surface-soft px-4 py-3.5 text-center text-xs font-bold text-ink transition hover:bg-line"
          >
            목록으로
          </Link>
          <Link
            href={`/community/${course.postId || course.slug}`}
            className="rounded-full bg-brand px-4 py-3.5 text-center text-xs font-black text-white shadow-xs transition hover:bg-brand-dark"
          >
            상세로 돌아가기
          </Link>
        </div>
      </section>
    </main>
  );
}

export function CommunityPostEditForm({ course = {} }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const mounted = useIsMounted();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authHydrated = useAuthStore((state) => state.hydrated);
  const currentUser = useAuthStore((state) => state.user);

  const initialPhotos = useMemo(() => buildInitialPhotos(course), [course]);
  const [title, setTitle] = useState(course.title || "");
  const [caption, setCaption] = useState(
    course.note || course.description || "",
  );
  const [photos, setPhotos] = useState(() => initialPhotos);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [alertModalMessage, setAlertModalMessage] = useState("");

  const isOwner =
    mounted && isAuthenticated && isCommunityPostOwner(course, currentUser);
  const postId = course.postId || course.slug;
  const existingCount = photos.filter((photo) => photo.type === "existing").length;
  const previewPhoto = photos[0]?.url || course.image || "";

  async function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      try {
        const compressed = await compressImage(file);
        if (compressed) {
          setPhotos((prev) => [
            ...prev,
            {
              key: getPhotoKey("new", file.name || Date.now(), prev.length),
              type: "new",
              postImageId: "",
              url: compressed,
            },
          ].slice(0, 10));
        }
      } catch (err) {
        console.warn("[Community Post Edit] Photo compress failed:", err);
      }
    }

    e.target.value = "";
  }

  function handleRemovePhoto(indexToRemove) {
    setPhotos((prev) => {
      const target = prev[indexToRemove];
      if (target?.type === "existing" && target.postImageId) {
        setRemovedImageIds((ids) =>
          ids.includes(target.postImageId) ? ids : [...ids, target.postImageId],
        );
      }
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  }

  async function handleSubmit() {
    if (!postId || submitting) return;

    if (!title.trim()) {
      setAlertModalMessage("게시글 제목을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const newImages = photos
        .filter((photo) => photo.type === "new")
        .map((photo) => dataUrlToBlob(photo.url))
        .filter(Boolean);
      const hadExistingImages = initialPhotos.length > 0;
      const deleteAllImages = hadExistingImages && existingCount === 0;

      await updateCoursePost(postId, {
        title: title.trim(),
        content: caption.trim() || "더현대 서울 맞춤 코스입니다.",
        deleteImageIds: deleteAllImages ? [] : removedImageIds,
        deleteAllImages,
        images: newImages,
        userId: course.authorId || currentUser?.id || currentUser?.userId,
      });

      router.push(`/community/${postId}`);
      router.refresh();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "게시글 수정에 실패했습니다.";
      setErrorMsg(message);
      setAlertModalMessage(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted || !authHydrated) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-3 border-brand border-t-transparent" />
      </main>
    );
  }

  if (!isOwner) {
    return <PermissionNotice course={course} />;
  }

  return (
    <main className="min-w-0 overflow-x-hidden bg-background">
      <section className="bg-white px-4 pb-5 pt-5 sm:px-14 sm:pb-6 sm:pt-6 lg:px-52 lg:pb-12 lg:pt-[94px] xl:px-60 2xl:px-72">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <div>
            <p className="text-xs font-black text-brand">EDIT COMMUNITY POST</p>
            <h1 className="mt-2 text-[22px] font-black leading-tight text-ink lg:mt-6 lg:text-[38px] lg:leading-none">
              커뮤니티 게시글 수정
            </h1>
            <p className="mt-3 text-sm font-medium text-ink-muted sm:mt-5">
              제목, 후기 캡션, 첨부 사진만 수정할 수 있어요.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className={`hidden w-fit items-center justify-center rounded-full px-10 py-4 text-sm font-black text-white shadow-control transition lg:inline-flex ${
              submitting
                ? "cursor-not-allowed bg-brand/60"
                : "cursor-pointer bg-brand hover:bg-brand-dark"
            }`}
          >
            {submitting ? "저장 중..." : "수정 저장"}
          </button>
        </div>
      </section>

      <section className="bg-white px-4 pb-8 sm:px-14 sm:pb-10 lg:px-52 lg:pb-[120px] xl:px-60 2xl:px-72">
        {errorMsg ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-600">
            {errorMsg}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-7">
          <section className="min-w-0 rounded-[22px] bg-surface-soft p-4 sm:rounded-[28px] sm:p-7 lg:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-ink">수정할 코스</h2>
              <span className="text-sm font-black text-brand">
                {course.stops?.length || 0}개
              </span>
            </div>
            <div className="mt-5 sm:mt-8">
              <span className="rounded-full bg-brand px-4 py-2 text-xs font-black text-white">
                COMMUNITY
              </span>
            </div>
            <div className="mt-4 sm:mt-6">
              <CourseSummary course={course} />
            </div>
          </section>

          <section className="min-w-0 rounded-[22px] border border-line bg-white p-4 sm:rounded-[28px] sm:p-7 lg:p-8">
            <h2 className="text-xl font-black text-ink sm:text-2xl">
              사진 및 후기 수정
            </h2>

            <label
              htmlFor="community-edit-title"
              className="mt-5 block text-sm font-black text-ink sm:mt-6"
            >
              게시글 제목
            </label>
            <input
              id="community-edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="게시글 제목을 입력하세요"
              className="mt-2 w-full rounded-[16px] border border-line bg-surface-soft px-4 py-3.5 text-base font-bold text-ink outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
            />

            <div className="mt-5 sm:mt-6">
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

              <div className="mt-3 flex gap-3 overflow-x-auto rounded-[20px] bg-surface-soft p-4 sm:gap-4 sm:rounded-[28px] sm:p-6">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photos.length >= 10}
                  className={`flex h-[128px] w-[132px] shrink-0 flex-col items-center justify-center rounded-[18px] border border-dashed bg-white text-center transition sm:h-[166px] sm:w-[176px] ${
                    photos.length >= 10
                      ? "cursor-not-allowed border-line text-ink-muted/40"
                      : "cursor-pointer border-line hover:border-brand hover:bg-brand-soft/20"
                  }`}
                >
                  <span className="text-[30px] font-black leading-none text-brand sm:text-[34px]">
                    +
                  </span>
                  <span className="mt-3 text-sm font-black text-ink sm:mt-4">
                    사진 첨부
                  </span>
                  <span className="mt-1.5 text-xs font-medium text-ink-muted sm:mt-2">
                    최대 10장
                  </span>
                </button>

                {photos.map((photo, idx) => (
                  <PhotoTile
                    key={photo.key}
                    photo={photo}
                    onRemove={() => handleRemovePhoto(idx)}
                  />
                ))}
              </div>
            </div>

            <label
              htmlFor="community-edit-caption"
              className="mt-5 block text-sm font-black text-ink sm:mt-7"
            >
              후기 캡션
            </label>
            <textarea
              id="community-edit-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              className="mt-2 w-full resize-none rounded-[20px] border border-line bg-surface-soft p-4 text-sm font-medium leading-6 text-ink outline-none transition placeholder:text-ink-muted/50 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 sm:p-5"
              placeholder="코스에 대한 방문 후기 및 동선 꿀팁을 작성해보세요."
            />

            <div className="mt-6 flex flex-col gap-4 rounded-[24px] bg-surface-soft p-4 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:p-5">
              <div className="flex min-w-0 items-center gap-3 sm:gap-5">
                {previewPhoto ? (
                  <div className="relative size-[76px] shrink-0 overflow-hidden rounded-[18px] border border-line bg-slate-950 shadow-xs sm:size-[100px]">
                    <img
                      src={previewPhoto}
                      alt="대표 사진 미리보기"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className={`size-[76px] shrink-0 rounded-[18px] bg-linear-to-br sm:size-[100px] ${course.gradient || "from-[#5c2ef5] to-[#9b5cf6]"}`}
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-black text-brand">수정 미리보기</p>
                  <h3 className="mt-2 break-keep text-lg font-black text-ink sm:mt-3 sm:text-xl">
                    {title || "나만의 코스"}
                  </h3>
                  <p className="mt-2 line-clamp-1 text-xs font-medium text-ink-muted">
                    {caption || "후기 캡션을 입력해주세요."}
                  </p>
                </div>
              </div>
              <div className="grid w-full grid-cols-2 gap-2 sm:w-auto">
                <Link
                  href={`/community/${postId}`}
                  className="inline-flex items-center justify-center rounded-full border border-line bg-white px-5 py-4 text-sm font-black text-ink transition hover:bg-line"
                >
                  취소
                </Link>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`inline-flex shrink-0 items-center justify-center rounded-full px-6 py-4 text-sm font-black text-white shadow-control transition ${
                    submitting
                      ? "cursor-not-allowed bg-brand/60"
                      : "cursor-pointer bg-brand hover:bg-brand-dark"
                  }`}
                >
                  {submitting ? "저장 중..." : "수정 저장"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </section>

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
