"use client";

import { useEffect, useRef, useState } from "react";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "@/lib/api/community";

const fallbackChatMessages = [
  {
    commentId: "fallback-1",
    nickname: "Yuki_T",
    isAuthor: true,
    content: "워터폴 가든은 오전에 가면 사람이 적어서 사진 찍기 좋아요.",
    createdAt: "2026-08-18T14:14:00",
  },
  {
    commentId: "fallback-2",
    nickname: "Chen_Li",
    isAuthor: false,
    content: "5F 사운즈 포레스트에서 쉬다가 B2로 내려가는 동선 괜찮았어요.",
    createdAt: "2026-08-18T14:20:00",
  },
  {
    commentId: "fallback-3",
    nickname: "Emma_R",
    isAuthor: false,
    content: "B2 크리에이티브 그라운드는 팝업 일정 확인하고 가면 더 좋아요.",
    createdAt: "2026-08-18T14:31:00",
  },
];

function formatTime(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    const hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const period = hours >= 12 ? "오후" : "오전";
    const displayHours = hours % 12 || 12;
    return `${period} ${displayHours}:${minutes}`;
  } catch {
    return "";
  }
}

function ChatBubble({ message, isMine, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content || message.text || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const authorName = message.nickname || message.author || "여행자";
  const isAuthor = Boolean(message.isAuthor || message.badge === "작성자");
  const timeText = formatTime(message.createdAt) || message.time || "";

  const handleSaveEdit = async (e) => {
    e?.preventDefault();
    const content = editText.trim();
    if (!content || !message.commentId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onUpdate(message.commentId, content);
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditText(message.content || message.text || "");
    setIsEditing(false);
  };

  if (isMine) {
    return (
      <div className="flex flex-col items-end">
        <div className="flex max-w-[85%] items-end gap-2.5">
          {/* Action buttons (수정 | 삭제) and Time aligned horizontally with crisp contrast */}
          <div className="flex items-center gap-1.5 shrink-0 select-none pb-1 text-[11px]">
            {message.commentId && !isEditing ? (
              <div className="flex items-center gap-1 font-bold text-ink/70">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="hover:text-brand transition cursor-pointer"
                  title="댓글 수정"
                >
                  수정
                </button>
                <span className="text-ink/20 text-[9px]">|</span>
                <button
                  type="button"
                  onClick={() => onDelete(message.commentId)}
                  className="hover:text-danger text-ink/70 transition cursor-pointer"
                  title="댓글 삭제"
                >
                  삭제
                </button>
                <span className="text-ink/30 ml-0.5 font-bold">·</span>
              </div>
            ) : null}
            <span className="font-bold text-brand text-[11px] tracking-tight">
              {timeText}
            </span>
          </div>

          {/* Comment Bubble or Edit Form */}
          {isEditing ? (
            <form
              onSubmit={handleSaveEdit}
              className="flex flex-col gap-2 rounded-[20px] bg-brand p-3.5 shadow-md min-w-[260px] text-white"
            >
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full rounded-[12px] bg-white px-3.5 py-2 text-sm font-medium text-ink outline-hidden focus:ring-2 focus:ring-brand/40"
                autoFocus
              />
              <div className="flex justify-end items-center gap-2 pt-0.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-2.5 py-1 text-white/80 transition hover:text-white cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!editText.trim() || isSubmitting}
                  className="rounded-full bg-white px-3.5 py-1 text-xs font-black text-brand transition hover:bg-surface-soft cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? "저장 중..." : "수정 완료"}
                </button>
              </div>
            </form>
          ) : (
            <p className="rounded-[18px] bg-brand px-5 py-3 text-sm font-medium leading-6 text-white shadow-sm">
              {message.content || message.text}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-xs font-black text-brand">{authorName}</span>
        {isAuthor ? (
          <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[10px] font-black text-brand">
            작성자
          </span>
        ) : null}
      </div>
      <div className="flex max-w-[78%] items-end gap-2.5">
        <p className="rounded-[18px] bg-brand-soft px-5 py-3 text-sm font-medium leading-6 text-ink shadow-xs">
          {message.content || message.text}
        </p>
        <span className="shrink-0 text-[11px] font-bold text-brand tracking-tight pb-1">
          {timeText}
        </span>
      </div>
    </div>
  );
}

export function CommunityChatButton({ course }) {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef(null);

  const postId =
    course?.postId ||
    (typeof course?.slug === "number" || /^\d+$/.test(course?.slug)
      ? Number(course.slug)
      : null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && comments.length > 0) {
      scrollToBottom();
    }
  }, [isOpen, comments]);

  const handleOpen = () => {
    setIsOpen(true);
    if (postId) {
      setIsLoading(true);
      getComments(postId)
        .then((res) => {
          const list = Array.isArray(res) ? res : res?.data || [];
          setComments(list);
        })
        .catch((err) => {
          console.warn("[CommunityChat] Failed to load comments:", err.message);
          setComments(fallbackChatMessages);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setComments(fallbackChatMessages);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const content = inputText.trim();
    if (!content || isSubmitting) return;

    setInputText("");
    setIsSubmitting(true);

    if (postId) {
      try {
        const newComment = await createComment(postId, { content });
        if (newComment) {
          setComments((prev) => [...prev, newComment]);
        }
      } catch (err) {
        console.error("[CommunityChat] Failed to post comment:", err.message);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Local preview fallback
      const mockComment = {
        commentId: `local-${Date.now()}`,
        nickname: "나",
        isAuthor: false,
        content,
        createdAt: new Date().toISOString(),
        isMine: true,
      };
      setComments((prev) => [...prev, mockComment]);
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (commentId, nextContent) => {
    if (!postId || !commentId || !nextContent.trim()) return;
    try {
      const updated = await updateComment(postId, commentId, { content: nextContent.trim() });
      if (updated) {
        setComments((prev) =>
          prev.map((c) => (c.commentId === commentId ? { ...c, content: updated.content } : c)),
        );
      }
    } catch (err) {
      console.error("[CommunityChat] Failed to update comment:", err.message);
    }
  };

  const handleDelete = async (commentId) => {
    if (!postId || !commentId) return;
    try {
      await deleteComment(postId, commentId);
      setComments((prev) => prev.filter((c) => c.commentId !== commentId));
    } catch (err) {
      console.error("[CommunityChat] Failed to delete comment:", err.message);
    }
  };

  return (
    <>
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

      {isOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#171324]/55 px-5 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="community-chat-title"
            className="flex flex-col w-full max-w-[680px] max-h-[85vh] rounded-[28px] bg-white shadow-[0_24px_70px_rgba(20,16,42,0.28)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-5 border-b border-line px-7 py-5 bg-white">
              <div>
                <h2
                  id="community-chat-title"
                  className="text-xl font-black text-ink flex items-center gap-2.5"
                >
                  커뮤니티 대화
                  <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-black text-brand">
                    댓글 {comments.length}
                  </span>
                </h2>
                <p className="mt-1 text-xs font-semibold text-ink-muted">
                  {course.title ? `‘${course.title}’ 코스에 대한 이야기` : "여행자들과 코스 팁을 나눠보세요"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex size-9 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-soft hover:text-ink cursor-pointer"
                aria-label="커뮤니티 대화 닫기"
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

            {/* Chat / Comments Message List */}
            <div className="flex-1 overflow-y-auto px-7 py-6 space-y-4 bg-surface-soft/40 min-h-[300px] max-h-[460px]">
              {isLoading ? (
                <div className="flex h-48 items-center justify-center text-sm font-bold text-ink-muted">
                  대화 목록을 불러오는 중...
                </div>
              ) : comments.length === 0 ? (
                <div className="flex flex-col h-48 items-center justify-center text-center">
                  <p className="text-sm font-black text-ink">아직 등록된 대화가 없습니다.</p>
                  <p className="mt-1 text-xs text-ink-muted">첫 번째 질문이나 방문 팁을 남겨보세요!</p>
                </div>
              ) : (
                comments.map((message, index) => (
                  <ChatBubble
                    key={message.commentId || `${message.nickname}-${index}`}
                    message={message}
                    isMine={message.isMine || message.userId === 1}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSend} className="flex items-center gap-3 border-t border-line px-6 py-4 bg-white">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="h-12 min-w-0 flex-1 rounded-full border border-line bg-surface-soft px-5 text-sm font-medium text-ink outline-hidden transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 placeholder:text-ink-muted"
                placeholder={
                  course.stops?.[0]?.name
                    ? `${course.stops[0].name} 방문 팁이나 질문을 남겨보세요`
                    : "코스에 대해 질문이나 팁을 남겨보세요"
                }
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSubmitting}
                className={`flex size-12 shrink-0 items-center justify-center rounded-full transition cursor-pointer ${
                  inputText.trim() && !isSubmitting
                    ? "bg-brand text-white shadow-control hover:bg-brand-dark"
                    : "bg-surface-muted text-ink-muted cursor-not-allowed"
                }`}
                aria-label="메시지 보내기"
              >
                <svg
                  aria-hidden="true"
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
