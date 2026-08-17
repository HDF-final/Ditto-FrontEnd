"use client";

import { useState } from "react";
import { Modal } from "@/components/common/modal";

export function NewsShareButton({ title, summary }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState("");

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return "";
  };

  const copyToClipboard = async (customMessage = "✓ 링크가 클립보드에 복사되었습니다!") => {
    const url = getShareUrl();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedMessage(customMessage);
      setTimeout(() => setCopiedMessage(""), 2800);
    } catch {
      // Fallback
    }
  };

  const handleCopyLink = () => {
    copyToClipboard("✓ 링크가 클립보드에 복사되었습니다!");
  };

  const handleShareKakao = async () => {
    const url = getShareUrl();
    const shareTitle = title || "DITTO 트렌드 뉴스";
    const shareText = summary || `${shareTitle} 소식을 확인해보세요!`;

    // 1. Mobile & Web Share API support (opens native share sheet with KakaoTalk)
    if (typeof navigator !== "undefined" && navigator.share && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: `${shareTitle} | DITTO`,
          text: shareText,
          url,
        });
        return;
      } catch (err) {
        if (err.name !== "AbortError") {
          // Fallback to clipboard
        } else {
          return;
        }
      }
    }

    // 2. Kakao JS SDK check (if window.Kakao is loaded with key)
    if (typeof window !== "undefined" && window.Kakao?.isInitialized()) {
      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: shareTitle,
          description: shareText,
          imageUrl: "https://ditto-frontend.vercel.app/assets/common/ditto-og.png",
          link: {
            mobileWebUrl: url,
            webUrl: url,
          },
        },
      });
      return;
    }

    // 3. Fallback for localhost / desktop without registered Kakao key
    await copyToClipboard("✓ 카카오톡에 바로 공유할 수 있도록 링크가 복사되었습니다!");
  };

  const handleShareTwitter = () => {
    const url = getShareUrl();
    const text = `${title || "DITTO 뉴스"} #DITTO #K컬처`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(tweetUrl, "_blank", "width=550,height=420,noopener,noreferrer");
  };

  const handleShareInstagram = async () => {
    await copyToClipboard("✓ 인스타그램에 공유할 수 있도록 링크가 복사되었습니다!");
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control bg-brand px-7 text-sm font-black text-white shadow-control transition hover:bg-brand-dark cursor-pointer"
      >
        <svg
          aria-hidden="true"
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        기사 공유
      </button>

      <Modal open={isOpen} onClose={() => setIsOpen(false)} labelledBy="share-modal-title">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div>
              <h2 id="share-modal-title" className="text-xl font-black text-ink">
                기사 공유하기
              </h2>
              <p className="mt-1 text-xs font-semibold text-ink-muted">
                친구들과 DITTO 트렌드 소식을 나눠보세요
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex size-9 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-muted hover:text-ink cursor-pointer"
              aria-label="닫기"
            >
              <svg
                aria-hidden="true"
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Social Share Grid */}
          <div className="grid grid-cols-4 gap-3">
            {/* 💬 카카오톡 */}
            <button
              type="button"
              onClick={handleShareKakao}
              className="group flex flex-col items-center gap-2 rounded-2xl p-3 transition hover:bg-surface-soft cursor-pointer"
            >
              <div className="flex size-14 items-center justify-center rounded-full bg-[#FEE500] text-[#191919] shadow-sm transition group-hover:scale-105">
                <svg
                  aria-hidden="true"
                  className="size-6 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7-.2.8-.8 2.8-.9 3.2 0 .1 0 .2.1.3.1.1.2.1.3 0 .4-.3 3.8-2.6 4.4-3 .5.1.9.1 1.4.1 5.5 0 10-3.6 10-8s-4.5-8-10-8z" />
                </svg>
              </div>
              <span className="text-xs font-black text-ink">카카오톡</span>
            </button>

            {/* 🔗 링크 복사 */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="group flex flex-col items-center gap-2 rounded-2xl p-3 transition hover:bg-surface-soft cursor-pointer"
            >
              <div className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand shadow-sm transition group-hover:scale-105">
                <svg
                  aria-hidden="true"
                  className="size-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <span className="text-xs font-black text-ink">링크 복사</span>
            </button>

            {/* ✉️ 인스타그램 */}
            <button
              type="button"
              onClick={handleShareInstagram}
              className="group flex flex-col items-center gap-2 rounded-2xl p-3 transition hover:bg-surface-soft cursor-pointer"
            >
              <div className="flex size-14 items-center justify-center rounded-full bg-linear-to-tr from-[#fd5949] via-[#d6249f] to-[#285AEB] text-white shadow-sm transition group-hover:scale-105">
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
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </div>
              <span className="text-xs font-black text-ink">인스타그램</span>
            </button>

            {/* 𝕏 X (Twitter) */}
            <button
              type="button"
              onClick={handleShareTwitter}
              className="group flex flex-col items-center gap-2 rounded-2xl p-3 transition hover:bg-surface-soft cursor-pointer"
            >
              <div className="flex size-14 items-center justify-center rounded-full bg-black text-white shadow-sm transition group-hover:scale-105">
                <svg
                  aria-hidden="true"
                  className="size-5 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <span className="text-xs font-black text-ink">X</span>
            </button>
          </div>

          {/* Quick Copy Link Bar */}
          <div className="relative mt-2 flex items-center rounded-2xl border border-line bg-surface-soft p-2">
            <input
              type="text"
              readOnly
              value={getShareUrl()}
              className="flex-1 bg-transparent px-3 text-xs font-semibold text-ink-muted outline-hidden select-all"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`rounded-control px-4 py-2 text-xs font-black transition cursor-pointer ${
                copiedMessage
                  ? "bg-success text-white"
                  : "bg-brand text-white hover:bg-brand-dark shadow-sm"
              }`}
            >
              {copiedMessage ? "복사 완료!" : "복사하기"}
            </button>
          </div>

          {/* Copied Feedback Toast */}
          {copiedMessage ? (
            <p className="text-center text-xs font-black text-success animate-fade-in">
              {copiedMessage}
            </p>
          ) : null}
        </div>
      </Modal>
    </>
  );
}
