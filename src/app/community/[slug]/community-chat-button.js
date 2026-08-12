"use client";

import { useState } from "react";

const chatMessages = [
  {
    author: "Yuki_T",
    badge: "작성자",
    text: "워터폴 가든은 오전에 가면 사람이 적어서 사진 찍기 좋아요.",
    time: "오후 2:14",
  },
  {
    author: "Chen_Li",
    text: "5F 사운즈 포레스트에서 쉬다가 B2로 내려가는 동선 괜찮았어요.",
    time: "오후 2:20",
  },
  {
    author: "me",
    text: "오전에 가려면 몇 시쯤 도착하는 게 좋을까요?",
    time: "오후 2:26",
    mine: true,
  },
  {
    author: "Yuki_T",
    badge: "작성자",
    text: "10시 반 오픈이라 11시 전에 도착하면 한산해요.",
    time: "오후 2:29",
  },
  {
    author: "Emma_R",
    text: "B2 크리에이티브 그라운드는 팝업 일정 확인하고 가면 더 좋아요.",
    time: "오후 2:31",
  },
];

function ChatBubble({ message }) {
  if (message.mine) {
    return (
      <div className="flex justify-end">
        <div className="flex max-w-[78%] items-end gap-3">
          <span className="text-[11px] font-medium text-ink-muted">
            {message.time}
          </span>
          <p className="rounded-[12px] bg-brand px-5 py-3 text-sm font-medium leading-6 text-white">
            {message.text}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-black text-brand">{message.author}</span>
        {message.badge ? (
          <span className="rounded-full bg-brand-soft px-3 py-1 text-[10px] font-black text-brand">
            {message.badge}
          </span>
        ) : null}
      </div>
      <div className="flex max-w-[78%] items-end gap-3">
        <p className="rounded-[12px] bg-brand-soft px-5 py-3 text-sm font-medium leading-6 text-ink">
          {message.text}
        </p>
        <span className="shrink-0 text-[11px] font-medium text-ink-muted">
          {message.time}
        </span>
      </div>
    </div>
  );
}

export function CommunityChatButton({ course }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-12 min-w-[142px] items-center justify-center rounded-full bg-brand px-8 text-sm font-black text-white transition hover:shadow-control"
      >
        대화 참여
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-[#171324]/45 px-5 pt-[14vh] backdrop-blur-[1px]">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="community-chat-title"
            className="w-full max-w-[680px] rounded-[24px] bg-white shadow-[0_24px_70px_rgba(20,16,42,0.28)]"
          >
            <div className="flex items-start justify-between gap-5 border-b border-line px-6 py-5">
              <div>
                <h2
                  id="community-chat-title"
                  className="text-xl font-black text-ink"
                >
                  커뮤니티 대화
                </h2>
                <p className="mt-2 text-sm font-medium text-ink-muted">
                  이 코스에 대해 58명이 이야기하고 있어요
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-black text-brand">
                  댓글 58
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex size-8 items-center justify-center rounded-full text-xl font-medium text-ink-muted transition hover:bg-surface-soft hover:text-ink"
                  aria-label="커뮤니티 대화 닫기"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="max-h-[430px] space-y-5 overflow-y-auto px-10 py-7">
              {chatMessages.map((message, index) => (
                <ChatBubble key={`${message.author}-${index}`} message={message} />
              ))}
            </div>

            <div className="flex items-center gap-3 px-6 pb-5">
              <input
                type="text"
                className="h-12 min-w-0 flex-1 rounded-full border-0 bg-surface-soft px-5 text-sm font-medium text-ink outline-none placeholder:text-ink-muted focus:ring-2 focus:ring-brand/30"
                placeholder={`${course.stops[0].name} 동선을 물어보세요`}
              />
              <button
                type="button"
                className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand text-2xl font-black text-white transition hover:bg-brand-dark"
                aria-label="메시지 보내기"
              >
                ↗
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
