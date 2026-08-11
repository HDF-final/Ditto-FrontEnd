"use client";

import { useCallback, useRef, useState } from "react";

import { boniReply, initialMessages } from "@/lib/fixtures/concierge";
import { ConciergeHeader } from "./concierge-header";
import { ChatMessageList } from "./chat-message-list";
import { QuickQuestionList } from "./quick-question-list";
import { ChatInput } from "./chat-input";
import { TopCourseSection } from "./top-course-section";

export function ConciergePanel() {
  const [messages, setMessages] = useState(initialMessages);
  const [typing, setTyping] = useState(false);
  const counter = useRef(0);

  // Append a user message and a canned Boni reply after a short delay.
  // This never changes the course — Boni only chats here.
  const ask = useCallback((text) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    counter.current += 1;
    const userId = `msg-${counter.current}`;
    setMessages((current) => [...current, { id: userId, from: "me", text: trimmed }]);
    setTyping(true);
    setTimeout(() => {
      counter.current += 1;
      const replyId = `msg-${counter.current}`;
      setMessages((current) => [...current, { id: replyId, from: "boni", text: boniReply }]);
      setTyping(false);
    }, 800);
  }, []);

  return (
    <aside className="flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card lg:sticky lg:top-24">
      <ConciergeHeader />
      <TopCourseSection onSelect={ask} />
      <ChatMessageList messages={messages} typing={typing} />
      <QuickQuestionList onAsk={ask} />
      <ChatInput onSend={ask} />
    </aside>
  );
}
