"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

export function BottomTabBar() {
  const pathname = usePathname();
  const [scanOpen, setScanOpen] = useState(false);
  const [scanImage, setScanImage] = useState(null);

  return (
    <>
    <nav
      aria-label="주요 메뉴"
      className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="grid h-16 grid-cols-5 items-end px-1">
        {sideTabs.slice(0, 2).map((tab) => {
          const active = tab.match(pathname);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-0.5 text-[10px] font-black tracking-tight transition ${
                  active ? "text-brand" : "text-ink-subtle hover:text-ink"
                }`}
              >
                <tab.Icon active={active} />
                {tab.label}
              </Link>
            </li>
          );
        })}

        <li className="relative flex justify-center">
          <button
            type="button"
            onClick={() => setScanOpen(true)}
            aria-label="카메라로 텍스트 스캔 (OCR)"
            className="-mt-5 flex size-14 items-center justify-center rounded-full bg-brand text-white shadow-[0_10px_24px_rgba(92,46,245,0.35)] transition hover:bg-brand-dark"
          >
            <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
              <path strokeLinecap="round" d="M12 6v12M6 12h12" />
            </svg>
          </button>
        </li>

        {sideTabs.slice(2).map((tab) => {
          const active = tab.match(pathname);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-0.5 text-[10px] font-black tracking-tight transition ${
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
    </>
  );
}
