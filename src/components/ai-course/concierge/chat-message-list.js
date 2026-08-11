"use client";

import { useEffect, useRef } from "react";

import { ChatMessage } from "./chat-message";
import { TypingIndicator } from "./typing-indicator";

export function ChatMessageList({ messages, typing }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, typing]);

  return (
    <div className="flex max-h-[440px] min-h-[340px] flex-1 flex-col gap-2 overflow-y-auto bg-surface-soft/40 px-4 py-4">
      {messages.map((message) => (
        <ChatMessage key={message.id} from={message.from}>
          {message.text}
        </ChatMessage>
      ))}
      {typing ? (
        <ChatMessage from="boni">
          <TypingIndicator />
        </ChatMessage>
      ) : null}
      <div ref={endRef} />
    </div>
  );
}
