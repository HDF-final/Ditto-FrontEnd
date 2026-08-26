"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import { CameraScanner } from "./camera-scanner";
import { ScanResult } from "./scan-result";

function HomeIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 10.2 12 3.6l8.4 6.6V20a1.2 1.2 0 0 1-1.2 1.2H4.8A1.2 1.2 0 0 1 3.6 20z" />
      {active ? null : <path strokeLinecap="round" strokeLinejoin="round" d="M9.6 21.2v-6h4.8v6" />}
    </svg>
  );
}

function CoursesIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.6" y="5.2" width="7.2" height="7.2" rx="1.6" fill={active ? "currentColor" : "none"} />
      <rect x="13.2" y="5.2" width="7.2" height="7.2" rx="1.6" />
      <rect x="3.6" y="14.4" width="7.2" height="7.2" rx="1.6" />
      <rect x="13.2" y="14.4" width="7.2" height="7.2" rx="1.6" />
    </svg>
  );
}

function NewsIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="4.4" y="4.4" width="15.2" height="15.2" rx="2.4" fill={active ? "currentColor" : "none"} />
      <path stroke={active ? "white" : "currentColor"} strokeLinecap="round" d="M8 9.2h8M8 12.4h8M8 15.6h5.2" />
    </svg>
  );
}

function MyIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="8.2" r="3.1" fill={active ? "currentColor" : "none"} />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.6 19.4a6.4 6.4 0 0 1 12.8 0" fill={active ? "currentColor" : "none"} />
    </svg>
  );
}

const sideTabs = [
  {
    href: "/",
    label: "홈",
    match: (path) => path === "/",
    Icon: HomeIcon,
  },
  {
    href: "/community",
    label: "코스",
    match: (path) => path.startsWith("/community") || path.startsWith("/courses"),
    Icon: CoursesIcon,
  },
  {
    href: "/news",
    label: "뉴스",
    match: (path) => path.startsWith("/news"),
    Icon: NewsIcon,
  },
  {
    href: "/mypage",
    label: "마이",
    match: (path) => path.startsWith("/mypage"),
    Icon: MyIcon,
  },
];

function isTextInputElement(element) {
  if (!element) return false;
  const tagName = element.tagName?.toLowerCase();
  return tagName === "input" || tagName === "textarea" || element.isContentEditable;
}

function ScanLoginPrompt({ open, onClose, onLogin }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-5 lg:hidden"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="scan-login-title"
        className="w-full max-w-[340px] rounded-[24px] bg-white p-6 text-center shadow-2xl"
      >
        <h3 id="scan-login-title" className="text-base font-black text-ink">
          로그인이 필요해요
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          로고 스캔으로 내 위치를 찾으려면 먼저 로그인해주세요.
        </p>
        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-line bg-surface-soft py-2.5 text-xs font-bold text-ink"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={onLogin}
            className="flex-1 rounded-full bg-brand py-2.5 text-xs font-black text-white"
          >
            로그인하기
          </button>
        </div>
      </div>
    </div>
  );
}

export function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hydrated = useAuthStore((state) => state.hydrated);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanImage, setScanImage] = useState(null);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const viewport = window.visualViewport;

    function syncKeyboardState() {
      const activeElement = document.activeElement;
      const focusedTextInput = isTextInputElement(activeElement);
      const viewportHeight = viewport?.height ?? window.innerHeight;
      const keyboardVisible =
        focusedTextInput && window.innerHeight - viewportHeight > 120;

      setKeyboardOpen(keyboardVisible);
      if (keyboardVisible) setMenuOpen(false);
    }

    syncKeyboardState();

    viewport?.addEventListener("resize", syncKeyboardState);
    viewport?.addEventListener("scroll", syncKeyboardState);
    window.addEventListener("focusin", syncKeyboardState);
    window.addEventListener("focusout", syncKeyboardState);
    window.addEventListener("resize", syncKeyboardState);

    return () => {
      viewport?.removeEventListener("resize", syncKeyboardState);
      viewport?.removeEventListener("scroll", syncKeyboardState);
      window.removeEventListener("focusin", syncKeyboardState);
      window.removeEventListener("focusout", syncKeyboardState);
      window.removeEventListener("resize", syncKeyboardState);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const params = new URLSearchParams(window.location.search);
    if (params.get("scan") !== "1") return undefined;
    if (!hydrated) return undefined;

    if (!isAuthenticated) {
      router.replace("/login?next=scan");
      return undefined;
    }

    queueMicrotask(() => {
      setScanOpen(true);
    });
    router.replace(pathname);
    return undefined;
  }, [hydrated, isAuthenticated, pathname, router]);

  function handleScanClick() {
    setMenuOpen(false);
    if (hydrated && !isAuthenticated) {
      setLoginPromptOpen(true);
      return;
    }
    setScanOpen(true);
  }

  function handleCreateCourse() {
    setMenuOpen(false);
    router.push("/ai-course");
  }

  return (
    <>
    <nav
      aria-label="주요 메뉴"
      className={`fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md transition-transform duration-200 lg:hidden ${
        keyboardOpen ? "pointer-events-none translate-y-full" : "translate-y-0"
      }`}
    >
      <ul className="grid h-16 grid-cols-5 items-end px-1">
        {sideTabs.slice(0, 2).map((tab) => {
          const active = tab.match(pathname);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-end gap-1 pb-2 text-[10px] font-black tracking-tight transition ${
                  active ? "text-brand" : "text-ink-subtle hover:text-ink"
                }`}
              >
                <tab.Icon active={active} />
                {tab.label}
              </Link>
            </li>
          );
        })}

        <li className="relative flex h-16 flex-col items-center justify-end pb-2">
          {menuOpen ? (
            <button
              type="button"
              aria-hidden="true"
              tabIndex={-1}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 cursor-default bg-black/25"
            />
          ) : null}

          {/* "+" 버튼에서 좌우 위로 펼쳐지는 부채꼴 액션 */}
          <div
            className={`absolute bottom-[calc(100%+0.5rem)] left-1/2 z-50 h-0 w-0 transition duration-200 ${
              menuOpen ? "opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            {/* 코스 만들기 — 오른쪽 위로 */}
            <button
              type="button"
              onClick={handleCreateCourse}
              tabIndex={menuOpen ? 0 : -1}
              className={`absolute bottom-0 left-1/2 flex translate-x-2 -translate-y-3 items-center gap-2 whitespace-nowrap rounded-full bg-white py-2.5 pl-3 pr-4 text-xs font-black text-ink shadow-[0_10px_24px_rgba(15,23,42,0.16)] ring-1 ring-line transition hover:-translate-y-4 ${
                menuOpen ? "pointer-events-auto" : "pointer-events-none"
              }`}
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-brand/12 text-brand">
                <svg viewBox="0 0 24 24" className="size-[1.125rem]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18" />
                </svg>
              </span>
              코스 만들기
            </button>
            {/* 내 위치 찾기 — 왼쪽 위로 */}
            <button
              type="button"
              onClick={handleScanClick}
              tabIndex={menuOpen ? 0 : -1}
              className={`absolute bottom-0 right-1/2 flex -translate-x-2 -translate-y-3 items-center gap-2 whitespace-nowrap rounded-full bg-white py-2.5 pl-3 pr-4 text-xs font-black text-ink shadow-[0_10px_24px_rgba(15,23,42,0.16)] ring-1 ring-line transition hover:-translate-y-4 ${
                menuOpen ? "pointer-events-auto" : "pointer-events-none"
              }`}
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-brand/12 text-brand">
                <svg viewBox="0 0 24 24" className="size-[1.125rem]" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s6.5-5.4 6.5-10.2A6.5 6.5 0 0 0 5.5 10.8C5.5 15.6 12 21 12 21Z" />
                  <circle cx="12" cy="10.6" r="2.2" />
                </svg>
              </span>
              내 위치 찾기
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "메뉴 닫기" : "코스 만들기 · 내 위치 찾기 메뉴 열기"}
            aria-expanded={menuOpen}
            className="relative z-50 -mt-7 mb-1 flex size-14 items-center justify-center rounded-full bg-brand text-white shadow-[0_10px_24px_rgba(92,46,245,0.35)] transition hover:bg-brand-dark"
          >
            <svg
              viewBox="0 0 24 24"
              className={`size-7 transition-transform duration-200 ${menuOpen ? "rotate-45" : "rotate-0"}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              aria-hidden="true"
            >
              <path strokeLinecap="round" d="M12 6v12M6 12h12" />
            </svg>
          </button>
          <span
            className={`text-[10px] font-black tracking-tight transition ${
              menuOpen ? "text-brand" : "text-ink-subtle"
            }`}
          >
            더보기
          </span>
        </li>

        {sideTabs.slice(2).map((tab) => {
          const active = tab.match(pathname);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-end gap-1 pb-2 text-[10px] font-black tracking-tight transition ${
                  active ? "text-brand" : "text-ink-subtle hover:text-ink"
                }`}
              >
                <tab.Icon active={active} />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>

    <CameraScanner
      open={scanOpen}
      onClose={() => setScanOpen(false)}
      onCapture={(dataUrl) => setScanImage(dataUrl)}
    />

    <ScanResult
      open={Boolean(scanImage)}
      image={scanImage}
      onClose={() => setScanImage(null)}
      onRescan={() => {
        setScanImage(null);
        setScanOpen(true);
      }}
    />

    <ScanLoginPrompt
      open={loginPromptOpen}
      onClose={() => setLoginPromptOpen(false)}
      onLogin={() => {
        setLoginPromptOpen(false);
        router.push("/login?next=scan");
      }}
    />
    </>
  );
}
