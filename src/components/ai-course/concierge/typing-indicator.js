// Three bouncing dots shown while Boni is "typing" a response.
export function TypingIndicator() {
  return (
    <span className="flex items-center gap-1 py-0.5" aria-label="Boni가 입력 중" role="status">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="size-1.5 animate-bounce rounded-full bg-ink-subtle"
          style={{ animationDelay: `${index * 0.15}s` }}
        />
      ))}
    </span>
  );
}
