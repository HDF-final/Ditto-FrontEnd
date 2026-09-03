"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/use-auth-store";
import { useCommunityPostAuthorsStore } from "@/stores/use-community-post-authors-store";
import { useCommunityInteractionsStore } from "@/stores/use-community-interactions-store";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { getPersonaById } from "@/lib/fixtures/personas";
import {
  createComment,
  getComments,
  getPublicCourse,
  getPublicCourses,
  updateComment,
  deleteComment,
  likeCourse,
  unlikeCourse,
  bookmarkCourse,
  unbookmarkCourse,
} from "@/lib/api/community";
import { CommunityDetailHeroImage } from "./community-detail-hero-image";

function formatTimeAgo(dateStr, t) {
  if (!dateStr) return t("justNow");
  try {
    let d = new Date(dateStr);
    if (
      typeof dateStr === "string" &&
      !dateStr.endsWith("Z") &&
      !dateStr.includes("+") &&
      !dateStr.includes("-", 10)
    ) {
      const utcDate = new Date(`${dateStr}Z`);
      if (!Number.isNaN(utcDate.getTime())) {
        d = utcDate;
      }
    }
    if (Number.isNaN(d.getTime())) return t("justNow");

    const now = new Date();
    const diffMs = now - d;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) return t("daysAgo", { count: diffDay });
    if (diffHour > 0) return t("hoursAgo", { count: diffHour });
    if (diffMin > 0) return t("minutesAgo", { count: diffMin });
    return t("justNow");
  } catch {
    return t("justNow");
  }
}

function deduplicateComments(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  return list.filter((item, idx) => {
    const id = item?.commentId ?? `idx-${idx}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function CommunityChatButton({ course = {}, variant = "default" }) {
  const t = useTranslations("community");
  const locale = useLocale();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const getPostAuthor = useCommunityPostAuthorsStore(
    (state) => state.getPostAuthor,
  );
  const setStoredPostAuthor = useCommunityPostAuthorsStore(
    (state) => state.setPostAuthor,
  );

  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const mounted = useIsMounted();
  const postId =
    course?.postId ||
    course?.courseId ||
    course?.id ||
    (typeof course?.slug === "number" || /^\d+$/.test(course?.slug)
      ? Number(course.slug)
      : null);

  const postIdentifier = String(course?.postId || course?.slug || postId || "1");

  // Synchronized Likes and Bookmarks store
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
  const clearLikesDelta = useCommunityInteractionsStore(
    (state) => state.clearLikesDelta,
  );
  const setBookmarked = useCommunityInteractionsStore(
    (state) => state.setBookmarked,
  );

  const [postLikes, setPostLikes] = useState(
    typeof course?.likes === "number"
      ? course.likes
      : typeof course?.likeCount === "number"
        ? course.likeCount
        : 0,
  );
  const [postContent, setPostContent] = useState(
    course?.description || course?.content || course?.note || "",
  );
  const [postCreatedAt, setPostCreatedAt] = useState(
    course?.createdAt || course?.created_at || course?.createdDate || "",
  );

  const isLiked = mounted ? isLikedStored : false;
  const isBookmarked = mounted ? isBookmarkedStored : false;
  const baseLikes = postLikes;
  const likesCount = Math.max(0, baseLikes + (mounted ? likesDeltaStored : 0));

  // Edit / Delete states
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Comment Likes Map
  const [likedComments, setLikedComments] = useState({});

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [postAuthor, setPostAuthorName] = useState(
    course?.name || course?.nickname || course?.author || "",
  );
  const localAuthor = mounted
    ? getPostAuthor(course?.postId, course?.courseId, course?.slug, postId)
    : null;

  const authorName =
    postAuthor ||
    course?.name ||
    course?.writerNickname ||
    course?.authorNickname ||
    course?.userNickname ||
    course?.nickname ||
    course?.author ||
    localAuthor?.name ||
    t("traveler");

  const authorPersona = getPersonaById(
    course?.persona ||
      course?.shoppingType ||
      course?.personaId ||
      "sohwak",
    locale,
  );

  const courseImage =
    course?.image ||
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&h=1200&fit=crop";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && comments.length > 0) {
      scrollToBottom();
    }
  }, [isOpen, comments]);

  const loadComments = async (id) => {
    if (!id) {
      setComments([]);
      return;
    }
    setIsLoading(true);
    try {
      const [res, postDetail, postSummary] = await Promise.allSettled([
        getComments(id),
        getPublicCourse(id),
        getPublicCourses({ page: 0, size: 100 }),
      ]);
      const commentData = res.status === "fulfilled" ? res.value : null;
      const list = Array.isArray(commentData)
        ? commentData
        : Array.isArray(commentData?.content)
          ? commentData.content
          : Array.isArray(commentData?.data)
            ? commentData.data
            : [];
      setComments(deduplicateComments(list));

      if (postDetail.status === "fulfilled" && postDetail.value) {
        const detail = postDetail.value;
        const serverAuthor =
          detail?.writerNickname ||
          detail?.writerName ||
          detail?.authorNickname ||
          detail?.createdByNickname ||
          detail?.userNickname ||
          detail?.name ||
          detail?.nickname ||
          detail?.userName ||
          detail?.authorName ||
          detail?.author ||
          detail?.user?.nickname ||
          detail?.user?.name ||
          detail?.course?.userName ||
          detail?.course?.author;
        if (serverAuthor) {
          setPostAuthorName(serverAuthor);
          setStoredPostAuthor(id, {
            id: detail?.writerId || detail?.userId || detail?.authorId || "",
            name: serverAuthor,
            country: detail?.country || detail?.user?.country || "",
            persona: detail?.persona || detail?.user?.persona || "",
          });
        }

        const serverContent =
          detail?.content ||
          detail?.description ||
          detail?.note ||
          detail?.course?.description;
        if (serverContent) {
          setPostContent(serverContent);
        }

        const serverLikes =
          typeof detail?.likeCount === "number"
            ? detail.likeCount
            : typeof detail?.likes === "number"
              ? detail.likes
              : typeof detail?.course?.likeCount === "number"
                ? detail.course.likeCount
                : null;
        if (serverLikes !== null) {
          setPostLikes(serverLikes);
        }

        const serverCreatedAt =
          detail?.createdAt ||
          detail?.created_at ||
          detail?.createdDate ||
          detail?.created_date ||
          detail?.regDate ||
          detail?.reg_date;
        if (serverCreatedAt) {
          setPostCreatedAt(serverCreatedAt);
        }
      }

      if (postSummary.status === "fulfilled" && postSummary.value) {
        const content = Array.isArray(postSummary.value?.content)
          ? postSummary.value.content
          : [];
        const matched = content.find(
          (post) => String(post?.postId) === String(id),
        );
        if (matched) {
          const summaryLikes =
            typeof matched?.likeCount === "number"
              ? matched.likeCount
              : typeof matched?.likes === "number"
                ? matched.likes
                : null;
          if (summaryLikes !== null) {
            setPostLikes(summaryLikes);
          }

          const summaryCreatedAt =
            matched?.createdAt ||
            matched?.created_at ||
            matched?.createdDate ||
            matched?.created_date ||
            matched?.regDate ||
            matched?.reg_date;
          if (summaryCreatedAt) {
            setPostCreatedAt(summaryCreatedAt);
          }
        }
      }
    } catch (err) {
      console.warn("[CommunityChat] Error loading comments:", err.message);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    loadComments(postId);
  };

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }

    const nextState = !isLiked;
    const nextLikesCount = Math.max(0, likesCount + (nextState ? 1 : -1));
    setLiked(postIdentifier, nextState);

    if (postId) {
      try {
        if (nextState) {
          await likeCourse(postId);
        } else {
          await unlikeCourse(postId);
        }
        setPostLikes(nextLikesCount);
        clearLikesDelta(postIdentifier);
      } catch (err) {
        console.warn("[Like Toggle] Failed:", err.message);
      }
    }
  };

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }

    const nextState = !isBookmarked;
    setBookmarked(postIdentifier, nextState);

    if (postId) {
      try {
        if (nextState) {
          await bookmarkCourse(postId);
        } else {
          await unbookmarkCourse(postId);
        }
      } catch (err) {
        console.warn("[Bookmark Toggle] Failed:", err.message);
      }
    }
  };

  const handleCommentLikeToggle = (commentId) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }

    setLikedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleFollowToggle = () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    setIsFollowing((prev) => !prev);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }

    const content = inputText.trim();
    if (!content || isSubmitting) return;

    setSubmitError("");
    setInputText("");
    setIsSubmitting(true);

    if (postId) {
      try {
        await createComment(postId, { content });
        await loadComments(postId);
      } catch (err) {
        console.error("[CommunityChat] Failed to post:", err.message);
        setInputText(content);
        setSubmitError(t("commentPostFailed"));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const mockComment = {
        commentId: `local-${Date.now()}`,
        nickname: user?.nickname || user?.name || "나",
        isAuthor: false,
        content,
        createdAt: new Date().toISOString(),
        isMine: true,
      };
      setComments((prev) => deduplicateComments([...prev, mockComment]));
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (comment) => {
    setEditingCommentId(comment.commentId);
    setEditText(comment.content || "");
  };

  const handleSaveEdit = async (commentId) => {
    const nextContent = editText.trim();
    if (!nextContent || !commentId) return;

    if (postId) {
      try {
        await updateComment(postId, commentId, { content: nextContent });
        await loadComments(postId);
      } catch (err) {
        console.warn("[Comment Update] Error:", err.message);
        return;
      }
    } else {
      setComments((prev) =>
        prev.map((c) =>
          c.commentId === commentId ? { ...c, content: nextContent } : c,
        ),
      );
    }
    setEditingCommentId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCommentId || isDeleting) return;
    setIsDeleting(true);

    if (postId) {
      try {
        await deleteComment(postId, deletingCommentId);
        await loadComments(postId);
      } catch (err) {
        console.warn("[Comment Delete] Error:", err.message);
        setIsDeleting(false);
        return;
      }
    } else {
      setComments((prev) => prev.filter((c) => c.commentId !== deletingCommentId));
    }

    setDeletingCommentId(null);
    setIsDeleting(false);
  };

  return (
    <>
      {/* 대화 참여 버튼 */}
      <button
        type="button"
        onClick={handleOpen}
        className={
          variant === "primary"
            ? "inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-black text-white shadow-control transition hover:bg-brand-dark cursor-pointer sm:h-13 sm:text-base"
            : variant === "secondary"
              ? "inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-line bg-white px-5 text-sm font-black text-ink-muted shadow-xs transition hover:border-brand/40 hover:bg-brand-soft/30 hover:text-brand cursor-pointer sm:h-13 sm:flex-[0.82] sm:text-base"
            : "inline-flex h-11 min-w-0 flex-1 basis-[calc(50%-0.25rem)] items-center justify-center gap-1.5 rounded-full bg-brand px-3 text-xs font-black text-white shadow-control transition hover:bg-brand-dark cursor-pointer sm:h-12 sm:min-w-[142px] sm:flex-none sm:basis-auto sm:gap-2 sm:px-8 sm:text-sm"
        }
      >
        <svg
          aria-hidden="true"
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {t("joinConversation")}
      </button>

      {/* 인스타그램 피드 형태 대화 참여 모달 (스플릿 레이아웃) */}
      {isOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 p-0 sm:items-center sm:p-6 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={course?.title || "코스 대화"}
            className="relative flex h-[min(92dvh,720px)] max-h-[calc(100dvh-0.5rem)] w-full max-w-[1020px] flex-col overflow-hidden rounded-t-[24px] bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150 sm:rounded-[24px] md:flex-row"
          >
            {/* 좌측: 인스타그램 피드 포스트 비주얼 카드 (Full Photo Carousel) */}
            <div className="relative flex h-[180px] shrink-0 flex-col justify-between overflow-hidden bg-slate-950 p-4 select-none sm:h-[280px] sm:p-6 md:h-full md:w-[56%]">
              <div className="absolute inset-0">
                <CommunityDetailHeroImage
                  images={course?.images}
                  fallbackImage={course?.image}
                  alt={course?.title || t("courseImage")}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none" />

              {/* 상단 뱃지 */}
              <div className="relative z-10 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-xs font-black text-white backdrop-blur-xs border border-white/10">
                  <span className="flex size-2 rounded-full bg-brand animate-pulse" />
                  <span>DITTO COURSE</span>
                </div>
              </div>
            </div>

            {/* 우측: 인스타그램 피드 댓글 패널 */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col border-t border-line bg-white md:h-full md:w-[44%] md:border-t-0 md:border-l">
              {/* 1. 상단 프로필 헤더 */}
              <div className="flex items-center justify-between px-5 pt-4 pb-2 bg-white shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full shadow-xs ring-2 ring-black/5"
                    style={{ backgroundColor: authorPersona.theme?.bgColor || "#fff1e6" }}
                  >
                    <Image
                      src={authorPersona.imageSrc}
                      alt={authorName}
                      width={34}
                      height={34}
                      className="size-[34px] object-contain"
                      unoptimized
                    />
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate text-sm font-black text-ink">
                      {authorName}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex size-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-soft hover:text-ink cursor-pointer"
                  aria-label={t("closeConversation")}
                >
                  <svg
                    aria-hidden="true"
                    className="size-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* 2. 스크롤 본문 (상단 게시물 본문 + 댓글 피드 목록) */}
              <div className="flex-1 overflow-y-auto px-5 pt-1 pb-4 space-y-4 text-sm bg-white">
                {postContent ? (
                  <div className="pl-12 pb-3 border-b border-line/60">
                    <p className="text-xs leading-relaxed text-ink/90 whitespace-pre-line break-words">
                      {postContent}
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-ink-muted">
                      {postCreatedAt ? formatTimeAgo(postCreatedAt, t) : t("justNow")}
                    </p>
                  </div>
                ) : null}

                {isLoading ? (
                  <div className="flex h-36 items-center justify-center text-xs font-bold text-ink-muted">
                    {t("loadingConversation")}
                  </div>
                ) : comments.length === 0 ? (
                  <div className="flex flex-col h-36 items-center justify-center text-center">
                    <p className="text-sm font-black text-ink">{t("noComments")}</p>
                    <p className="mt-1 text-xs text-ink-muted">{t("firstComment")}</p>
                  </div>
                ) : (
                  comments.map((message, index) => {
                    const cId = message.commentId ?? `idx-${index}`;
                    const commenterName = message.nickname || message.author || t("traveler");
                    const currentUserId = Number(user?.id || user?.userId || 0);
                    const commentUserId = Number(
                      message.userId || message.writerId || message.authorId || 0,
                    );
                    const isMine =
                      message.isMine === true ||
                      (currentUserId > 0 && commentUserId > 0 && commentUserId === currentUserId) ||
                      String(cId).startsWith("user-") ||
                      String(cId).startsWith("local-");
                    const isLikedComment = Boolean(likedComments[cId]);

                    const commenterPersona = getPersonaById(
                      isMine
                        ? (user?.persona || "sohwak")
                        : (message.persona || (message.isAuthor ? authorPersona.id : "openrun")),
                      locale,
                    );

                    return (
                      <div key={cId} className="flex items-start justify-between gap-2.5 group">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div
                            className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full shadow-xs ring-1 ring-black/5"
                            style={{ backgroundColor: commenterPersona.theme?.bgColor || "#fff1e6" }}
                          >
                            <Image
                              src={commenterPersona.imageSrc}
                              alt={commenterName}
                              width={26}
                              height={26}
                              className="size-[26px] object-contain"
                              unoptimized
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            {editingCommentId === cId ? (
                              <div className="flex flex-col gap-2 rounded-xl bg-surface-soft p-2.5">
                                <input
                                  type="text"
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="w-full rounded-lg bg-white px-2.5 py-1.5 text-xs text-ink outline-hidden ring-1 ring-line focus:ring-brand"
                                  autoFocus
                                />
                                <div className="flex justify-end gap-2 text-[11px] font-bold">
                                  <button
                                    type="button"
                                    onClick={() => setEditingCommentId(null)}
                                    className="px-2 py-0.5 text-ink-muted hover:text-ink cursor-pointer"
                                  >
                                    {t("cancel")}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEdit(cId)}
                                    className="rounded-full bg-brand px-3 py-0.5 text-white shadow-xs hover:bg-brand-dark cursor-pointer"
                                  >
                                    {t("edit")}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-xs text-ink">
                                  {commenterName}
                                </span>
                                <p className="mt-0.5 text-xs leading-relaxed text-ink break-words">
                                  {message.content || message.text}
                                </p>
                                <div className="mt-1 flex items-center gap-3 text-[11px] font-medium text-ink-muted select-none">
                                  <span>{formatTimeAgo(message.createdAt, t)}</span>
                                  {isMine && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleStartEdit(message)}
                                        className="font-bold hover:text-brand cursor-pointer"
                                      >
                                        {t("edit")}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeletingCommentId(cId)}
                                        className="font-bold hover:text-danger cursor-pointer"
                                      >
                                        {t("delete")}
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 3. 하단 액션 아이콘 & 댓글 입력창 */}
              <div className="border-t border-line bg-white shrink-0">
                <div className="flex items-center justify-between px-5 pt-3">
                  <div className="flex items-center gap-4 text-ink">
                    <button
                      type="button"
                      onClick={handleLikeToggle}
                      className="transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                      aria-label={t("like")}
                    >
                      <svg
                        aria-hidden="true"
                        className={`size-6.5 transition-colors ${
                          isLiked ? "text-brand fill-brand" : "text-ink hover:text-brand"
                        }`}
                        viewBox="0 0 24 24"
                        fill={isLiked ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleBookmarkToggle}
                    className="transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                    aria-label={t("bookmarkCourse")}
                  >
                    <svg
                      aria-hidden="true"
                      className={`size-6.5 transition-colors ${
                        isBookmarked ? "text-brand fill-brand" : "text-ink hover:text-brand"
                      }`}
                      viewBox="0 0 24 24"
                      fill={isBookmarked ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                </div>

                <div className="px-5 pt-2 pb-2.5">
                  <p className="text-xs font-black text-brand">
                    {t("likedBy", { count: likesCount.toLocaleString(locale) })}
                  </p>
                  <p className="text-[10px] font-semibold text-ink-muted uppercase mt-0.5">
                    {postCreatedAt ? formatTimeAgo(postCreatedAt, t) : t("justNow")}
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!isAuthenticated) {
                      setIsLoginModalOpen(true);
                      return;
                    }
                    handleSend(e);
                  }}
                  className="flex flex-wrap items-center gap-2 border-t border-line bg-white px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (!isAuthenticated) {
                        setIsLoginModalOpen(true);
                        return;
                      }
                      setSubmitError("");
                      setInputText((prev) => `${prev}😊`);
                    }}
                    className="text-ink-muted hover:text-ink transition cursor-pointer p-1"
                    aria-label={t("addEmoji")}
                  >
                    <svg
                      aria-hidden="true"
                      className="size-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                      <line x1="9" y1="9" x2="9.01" y2="9" />
                      <line x1="15" y1="9" x2="15.01" y2="9" />
                    </svg>
                  </button>

                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => {
                      setSubmitError("");
                      setInputText(e.target.value);
                    }}
                    onFocus={() => {
                      if (!isAuthenticated) {
                        inputRef.current?.blur();
                        setIsLoginModalOpen(true);
                      }
                    }}
                    placeholder={
                      isAuthenticated
                        ? t("commentPlaceholder")
                        : t("loginCommentPlaceholder")
                    }
                    className={`min-w-0 flex-1 bg-transparent text-xs sm:text-sm font-medium text-ink placeholder:text-ink-muted outline-hidden ${
                      !isAuthenticated ? "cursor-pointer" : ""
                    }`}
                  />

                  {isAuthenticated ? (
                    <button
                      type="submit"
                      disabled={!inputText.trim() || isSubmitting}
                      className={`text-xs sm:text-sm font-black transition cursor-pointer px-2 ${
                        inputText.trim() && !isSubmitting
                          ? "text-brand hover:text-brand-dark"
                          : "text-brand/40 cursor-not-allowed"
                      }`}
                    >
                      {t("post")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsLoginModalOpen(true)}
                      className="text-xs sm:text-sm font-black text-brand hover:text-brand-dark transition cursor-pointer px-2"
                    >
                      {t("loginShort")}
                    </button>
                  )}

                  {submitError ? (
                    <p className="basis-full pl-9 text-[10px] font-bold text-danger">
                      {submitError}
                    </p>
                  ) : null}
                </form>
              </div>
            </div>
          </section>
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
              {t("conversationLoginDescription")}
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

      {/* 댓글 삭제 확인 팝업 모달 */}
      {deletingCommentId ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 px-5 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) setDeletingCommentId(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            className="w-full max-w-[320px] rounded-[24px] bg-white p-6 shadow-2xl text-center"
          >
            <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-danger/10 text-danger">
              <svg
                aria-hidden="true"
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <h3 id="delete-dialog-title" className="text-base font-black text-ink">
              {t("deleteCommentTitle")}
            </h3>
            <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">
              {t("deleteCommentDescription")}
            </p>
            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingCommentId(null)}
                className="flex-1 rounded-full bg-surface-soft py-2.5 text-xs font-black text-ink hover:bg-line transition cursor-pointer"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 rounded-full bg-danger py-2.5 text-xs font-black text-white shadow-xs hover:bg-danger-dark transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? t("deleting") : t("delete")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
