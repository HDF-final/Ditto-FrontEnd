"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { CameraScanner } from "@/components/layout/camera-scanner";
import { ScanResult } from "@/components/layout/scan-result";

/**
 * 코스 지도(모바일) 위에 얹는 OCR 위치 스캔 버튼.
 *
 * `/scan-map` 과 동일한 흐름을 재사용합니다: 간판을 촬영하면 OCR로 브랜드를
 * 인식하고, `afterMatch="stay"` 로 이 화면에 머문 채 스캔 위치를 스토어에
 * 저장합니다. `ResultScreen` 의 지도는 `showUserLocation` 으로 그 위치 핀을
 * 코스 경로 위에 함께 표시합니다.
 *
 * 카메라/결과 오버레이는 `document.body` 로 포털합니다. `.course-studio` 가
 * `isolation: isolate` 로 독립 스태킹 컨텍스트를 만들기 때문에, 지도 셀 안에서
 * 그대로 렌더하면 `fixed` 전체화면 오버레이가 코스 리스트(z-index:1)와 하단
 * 탭바에 가려집니다. 이 포털이 그 문제(드래그용 원본 레이아웃과 OCR 카메라의
 * 충돌)를 해결합니다. 포털은 오버레이가 열릴 때(사용자 클릭 이후 = 클라이언트
 * 보장)만 생성하므로 SSR 에서 `document` 를 건드리지 않습니다.
 *
 * 데스크톱 지도는 언니 담당이라, 이 버튼은 모바일(lg 미만)에서만 노출합니다.
 */
export function CourseMapScanButton({ className = "" }) {
  const [scanOpen, setScanOpen] = useState(false);
  const [scanImage, setScanImage] = useState(null);

  const overlayOpen = scanOpen || Boolean(scanImage);

  return (
    <>
      <button
        type="button"
        onClick={() => setScanOpen(true)}
        aria-label="간판을 스캔해 내 위치 찾기"
        className={`absolute right-3 top-3 z-20 flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/95 py-2 pl-2.5 pr-3.5 text-[12px] font-black text-brand shadow-[0_6px_18px_rgba(60,45,35,0.18)] ring-1 ring-line backdrop-blur-md transition active:scale-95 lg:hidden ${className}`}
      >
        <svg
          viewBox="0 0 24 24"
          className="size-[1.05rem] shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 8V6.5A2.5 2.5 0 0 1 6.5 4H8M16 4h1.5A2.5 2.5 0 0 1 20 6.5V8M20 16v1.5a2.5 2.5 0 0 1-2.5 2.5H16M8 20H6.5A2.5 2.5 0 0 1 4 17.5V16"
          />
          <circle cx="12" cy="12" r="2.6" />
        </svg>
        위치 스캔
      </button>

      {overlayOpen
        ? createPortal(
            <>
              <CameraScanner
                open={scanOpen}
                onClose={() => setScanOpen(false)}
                onCapture={(dataUrl) => setScanImage(dataUrl)}
              />
              <ScanResult
                open={Boolean(scanImage)}
                image={scanImage}
                afterMatch="stay"
                onClose={() => setScanImage(null)}
                onRescan={() => {
                  setScanImage(null);
                  setScanOpen(true);
                }}
              />
            </>,
            document.body,
          )
        : null}
    </>
  );
}
