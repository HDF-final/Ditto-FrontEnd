import Image from "next/image";

export function ChatMessage({ from, children }) {
  const isBoni = from === "boni";

  return (
    <div className={`flex ${isBoni ? "justify-start" : "justify-end"}`}>
      {isBoni ? (
        <span className="mr-1.5 flex size-9 flex-none items-center justify-center self-start overflow-hidden rounded-full bg-white shadow-sm">
          <Image
            src="/assets/common/boni-chat.svg"
            alt="Boni"
            width={30}
            height={30}
            className="size-7 object-contain"
          />
        </span>
      ) : null}
      <div
        className={[
          "max-w-[78%] whitespace-pre-line rounded-2xl px-3 py-2 text-xs leading-relaxed",
          isBoni
            ? "border border-brand-soft bg-surface text-ink shadow-sm"
            : "bg-brand text-white",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
