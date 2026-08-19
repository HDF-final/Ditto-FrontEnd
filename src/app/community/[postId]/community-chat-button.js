"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  likeCourse,
  unlikeCourse,
  bookmarkCourse,
  unbookmarkCourse,
} from "@/lib/api/community";

const fallbackChatMessages = [
  {
    commentId: "fallback-1",
    nickname: "Yuki_T",
    isAuthor: true,
    content: "워터폴 가든은 오전에 가면 사람이 적어서 사진 찍기 정말 좋아요!",
    createdAt: "2026-08-18T10:14:00Z",
    likes: 12,
  },
  {
    commentId: "fallback-2",
    nickname: "lujah1213",
    isAuthor: false,
    content: "5F 사운즈 포레스트에서 쉬다가 B2로 내려가는 동선 진짜 꿀팁이네요 ㅎㅎ",
    createdAt: "2026-08-18T15:20:00Z",
    likes: 5,
  },
  {
    commentId: "fallback-3",
    nickname: "Emma_R",
    isAuthor: false,
    content: "B2 크리에이티브 그라운드는 팝업 일정 미리 확인하고 가면 더 알차게 구경할 수 있어요 ✨",
    createdAt: "2026-08-18T18:31:00Z",
    likes: 8,
  },
];

function formatTimeAgo(dateStr) {
  if (!dateStr) return "방금";
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
    if (Number.isNaN(d.getTime())) return "방금";

    const now = new Date();
    const diffMs = now - d;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) return `${diffDay}일`;
    if (diffHour > 0) return `${diffHour}시간`;
    if (diffMin > 0) return `${diffMin}분`;
    return "방금";
  } catch {
    return "방금";
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

function getAvatarColor(name = "") {
  const colors = [
    "bg-gradient-to-br from-purple-500 to-indigo-600 text-white",
    "bg-gradient-to-br from-pink-500 to-rose-500 text-white",
    "bg-gradient-to-br from-amber-500 to-orange-600 text-white",
    "bg-gradient-to-br from-emerald-500 to-teal-600 text-white",
    "bg-gradient-to-br from-blue-500 to-cyan-600 text-white",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function CommunityChatButton({ course = {} }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Likes and Bookmarks state
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(course?.likes || 508);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Edit / Delete states
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Comment Likes Map
  const [likedComments, setLikedComments] = useState({});

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const postId =
    course?.postId ||
    (typeof course?.slug === "number" || /^\d+$/.test(course?.slug)
      ? Number(course.slug)
      : null);

  const courseImage =
    course?.image ||
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&h=1200&fit=crop";

  const authorName = course?.name || "Yuki_T";

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
      setComments(fallbackChatMessages);
      return;
    }
    setIsLoading(true);
    try {
      const res = await getComments(id);
      const list = Array.isArray(res) ? res : res?.data || [];
      setComments(list.length > 0 ? deduplicateComments(list) : fallbackChatMessages);
    } catch (err) {
      console.warn("[CommunityChat] Fallback comments:", err.message);
      setComments(fallbackChatMessages);
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
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    if (postId) {
      try {
        if (nextState) {
          await likeCourse(postId);
        } else {
          await unlikeCourse(postId);
        }
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
    setIsBookmarked(nextState);

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

    setInputText("");
    setIsSubmitting(true);

    if (postId) {
      try {
        const newComment = await createComment(postId, { content });
        if (newComment) {
          setComments((prev) => deduplicateComments([...prev, newComment]));
        }
      } catch (err) {
        console.error("[CommunityChat] Failed to post:", err.message);
        // Optimistic fallback for immediate UX
        const fallbackObj = {
          commentId: `user-${Date.now()}`,
          nickname: "나",
          isAuthor: false,
          content,
          createdAt: new Date().toISOString(),
          isMine: true,
        };
        setComments((prev) => deduplicateComments([...prev, fallbackObj]));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const mockComment = {
        commentId: `local-${Date.now()}`,
        nickname: "나",
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
      } catch (err) {
        console.warn("[Comment Update] Error:", err.message);
      }
    }

    setComments((prev) =>
      prev.map((c) =>
        c.commentId === commentId ? { ...c, content: nextContent } : c,
      ),
    );
    setEditingCommentId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCommentId || isDeleting) return;
    setIsDeleting(true);

    if (postId) {
      try {
        await deleteComment(postId, deletingCommentId);
      } catch (err) {
        console.warn("[Comment Delete] Error:", err.message);
      }
    }

    setComments((prev) => prev.filter((c) => c.commentId !== deletingCommentId));
    setDeletingCommentId(null);
    setIsDeleting(false);
  };

  return (
    <>
      {/* 대화 참여 버튼 */}
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex h-12 min-w-[142px] items-center justify-center gap-2 rounded-full bg-brand px-8 text-sm font-black text-white shadow-control transition hover:bg-brand-dark cursor-pointer"
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
        대화 참여
      </button>

      {/* 인스타그램 피드 형태 대화 참여 모달 (스플릿 레이아웃) */}
      {isOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="community-chat-title"
            className="flex flex-col md:flex-row w-full max-w-[1020px] h-[92vh] max-h-[720px] rounded-[24px] bg-white shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-150"
          >
            {/* 좌측: 인스타그램 피드 포스트 비주얼 카드 (Full Photo) */}
            <div className="relative md:w-[56%] h-[280px] md:h-full bg-slate-950 flex flex-col justify-between p-6 overflow-hidden select-none">
              <img
                src={courseImage}
                alt={course?.title || "코스 이미지"}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />

              {/* 상단 뱃지 */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-xs font-black text-white backdrop-blur-xs border border-white/10">
                  <span className="flex size-2 rounded-full bg-brand animate-pulse" />
                  <span>DITTO COURSE</span>
                </div>
              </div>

              {/* 하단 타이포그래피 오버레이 */}
              <div className="relative z-10 flex flex-col gap-2">
                <h2
                  id="community-chat-title"
                  className="text-2xl sm:text-[32px] font-black text-white leading-tight drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]"
                >
                  {course?.title || "처음이면 이 코스로 시작해"}
                </h2>
                <p className="text-xs sm:text-sm font-medium text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] line-clamp-2">
                  {course?.description || "더현대 서울 대표 스팟과 맞춤형 동선으로 즐기는 K-Culture 코스"}
                </p>

                <div className="mt-3 flex items-center gap-1.5" aria-hidden="true">
                  <span className="size-2 rounded-full bg-white" />
                  <span className="size-1.5 rounded-full bg-white/50" />
                  <span className="size-1.5 rounded-full bg-white/50" />
                  <span className="size-1.5 rounded-full bg-white/50" />
                </div>
              </div>
            </div>

            {/* 우측: 인스타그램 피드 댓글 패널 */}
            <div className="flex flex-col md:w-[44%] h-full bg-white border-t md:border-t-0 md:border-l border-line min-w-0">
              {/* 1. 상단 프로필 헤더 */}
              <div className="flex items-center justify-between border-b border-line px-5 py-3.5 bg-white shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-black shadow-xs ${getAvatarColor(
                      authorName,
                    )}`}
                  >
                    {authorName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate text-sm font-black text-ink">
                      {authorName}
                    </span>
                    <span className="text-ink/40 font-bold text-xs">·</span>
                    <button
                      type="button"
                      onClick={handleFollowToggle}
                      className={`text-xs font-black transition cursor-pointer ${
                        isFollowing ? "text-ink-muted hover:text-danger" : "text-brand hover:text-brand-dark"
                      }`}
                    >
                      {isFollowing ? "팔로잉" : "팔로우"}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex size-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-soft hover:text-ink cursor-pointer"
                  aria-label="대화 닫기"
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

              {/* 2. 스크롤 본문 (작성자 포스트 캡션 + 댓글 피드 목록) */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-sm bg-white">
                <div className="flex items-start gap-3 pb-3 border-b border-line/60">
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-black shadow-xs ${getAvatarColor(
                      authorName,
                    )}`}
                  >
                    {authorName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 leading-relaxed">
                    <p className="text-ink">
                      <span className="font-black text-ink mr-2">{authorName}</span>
                      {course?.description || course?.title}
                    </p>
                    <p className="mt-1.5 text-xs font-bold text-brand">
                      {course?.hash || "#DITTO #더현대서울 #K컬처"}
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-ink-muted">
                      수정됨 · 1일
                    </p>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex h-36 items-center justify-center text-xs font-bold text-ink-muted">
                    대화 목록을 불러오는 중...
                  </div>
                ) : comments.length === 0 ? (
                  <div className="flex flex-col h-36 items-center justify-center text-center">
                    <p className="text-sm font-black text-ink">아직 댓글이 없습니다.</p>
                    <p className="mt-1 text-xs text-ink-muted">첫 번째로 대화에 참여해보세요!</p>
                  </div>
                ) : (
                  comments.map((message, index) => {
                    const cId = message.commentId ?? `idx-${index}`;
                    const commenterName = message.nickname || message.author || "여행자";
                    const isMine =
                      message.isMine ||
                      message.userId === 1 ||
                      String(message.userId) === "1" ||
                      commenterName === "나" ||
                      commenterName === "사토 유키";
                    const isLikedComment = Boolean(likedComments[cId]);

                    return (
                      <div key={cId} className="flex items-start justify-between gap-2.5 group">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div
                            className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-black shadow-xs ${getAvatarColor(
                              commenterName,
                            )}`}
                          >
                            {commenterName.slice(0, 2).toUpperCase()}
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
                                    취소
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEdit(cId)}
                                    className="rounded-full bg-brand px-3 py-0.5 text-white shadow-xs hover:bg-brand-dark cursor-pointer"
                                  >
                                    수정
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-xs leading-relaxed text-ink break-words">
                                  <span className="font-black mr-1.5">{commenterName}</span>
                                  {message.content || message.text}
                                </p>
                                <div className="mt-1 flex items-center gap-3 text-[11px] font-medium text-ink-muted select-none">
                                  <span>{formatTimeAgo(message.createdAt)}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setInputText(`@${commenterName} `);
                                      inputRef.current?.focus();
                                    }}
                                    className="font-bold hover:text-ink cursor-pointer"
                                  >
                                    답글 달기
                                  </button>
                                  {isMine && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleStartEdit(message)}
                                        className="font-bold hover:text-brand cursor-pointer"
                                      >
                                        수정
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeletingCommentId(cId)}
                                        className="font-bold hover:text-danger cursor-pointer"
                                      >
                                        삭제
                                      </button>
                                    </>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCommentLikeToggle(cId)}
                          className="pt-1 text-ink-muted hover:text-danger transition cursor-pointer shrink-0"
                          aria-label="댓글 좋아요"
                        >
                          <svg
                            aria-hidden="true"
                            className={`size-3.5 ${
                              isLikedComment
                                ? "text-danger fill-danger"
                                : "text-ink-muted/60"
                            }`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </button>
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
                      className="transition hover:opacity-75 cursor-pointer"
                      aria-label="좋아요"
                    >
                      <svg
                        aria-hidden="true"
                        className={`size-6 ${
                          isLiked ? "text-danger fill-danger" : "text-ink"
                        }`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => inputRef.current?.focus()}
                      className="transition hover:opacity-75 cursor-pointer text-ink"
                      aria-label="댓글 작성"
                    >
                      <svg
                        aria-hidden="true"
                        className="size-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== "undefined" && navigator.clipboard) {
                          navigator.clipboard.writeText(window.location.href);
                          alert("코스 링크가 클립보드에 복사되었습니다!");
                        }
                      }}
                      className="transition hover:opacity-75 cursor-pointer text-ink"
                      aria-label="코스 공유"
                    >
                      <svg
                        aria-hidden="true"
                        className="size-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleBookmarkToggle}
                    className="transition hover:opacity-75 cursor-pointer"
                    aria-label="코스 북마크"
                  >
                    <svg
                      aria-hidden="true"
                      className={`size-6 ${
                        isBookmarked ? "text-brand fill-brand" : "text-ink"
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                </div>

                <div className="px-5 pt-2 pb-2.5">
                  <p className="text-xs font-black text-ink">
                    {likesCount.toLocaleString()}명이 좋아합니다
                  </p>
                  <p className="text-[10px] font-semibold text-ink-muted uppercase mt-0.5">
                    1일 전
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
                  className="flex items-center gap-2 border-t border-line px-4 py-2.5 bg-white"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (!isAuthenticated) {
                        setIsLoginModalOpen(true);
                        return;
                      }
                      setInputText((prev) => `${prev}😊`);
                    }}
                    className="text-ink-muted hover:text-ink transition cursor-pointer p-1"
                    aria-label="이모지 추가"
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
                    onChange={(e) => setInputText(e.target.value)}
                    onFocus={() => {
                      if (!isAuthenticated) {
                        inputRef.current?.blur();
                        setIsLoginModalOpen(true);
                      }
                    }}
                    placeholder={
                      isAuthenticated
                        ? "댓글 달기..."
                        : "로그인 후 댓글을 작성할 수 있습니다..."
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
                      게시
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsLoginModalOpen(true)}
                      className="text-xs sm:text-sm font-black text-brand hover:text-brand-dark transition cursor-pointer px-2"
                    >
                      로그인
                    </button>
                  )}
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
            <h3 className="text-base font-black text-ink">로그인이 필요합니다</h3>
            <p className="mt-2 text-xs text-ink-muted leading-relaxed">
              댓글 작성 및 좋아요·북마크 기능을 이용하시려면 먼저 로그인해주세요.
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
              댓글을 삭제하시겠습니까?
            </h3>
            <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">
              삭제한 댓글은 복구할 수 없습니다.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingCommentId(null)}
                className="flex-1 rounded-full bg-surface-soft py-2.5 text-xs font-black text-ink hover:bg-line transition cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 rounded-full bg-danger py-2.5 text-xs font-black text-white shadow-xs hover:bg-danger-dark transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
