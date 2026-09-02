"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CourseNavigationMap } from "@/components/navigation/course-navigation-map";
import { CameraScanner } from "@/components/layout/camera-scanner";
import { ScanResult } from "@/components/layout/scan-result";
import { useScanLocationStore } from "@/stores/use-scan-location-store";

/**
 * 하단 + OCR 전용 화면. 코스 편집 없이 3D 실내 지도(전체층)에 내 위치 핀만 찍습니다.
 */
export function ScanMapView() {
  const router = useRouter();
  const location = useScanLocationStore((state) => state.location);
  const hydrateLocation = useScanLocationStore((state) => state.hydrate);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanImage, setScanImage] = useState(null);

  useEffect(() => {
    hydrateLocation();
  }, [hydrateLocation]);

  return (
    <div className="relative h-dvh min-h-dvh w-full overflow-hidden bg-[#F7F3EF]">
      <CourseNavigationMap
        className="max-lg:!absolute max-lg:!inset-0 max-lg:!h-full max-lg:!min-h-full absolute inset-0 h-full min-h-full w-full"
        initialView="all"
        variant="scan"
        fitPreset="scan-mobile"
        showUserLocation
      />

      {!location ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#F7F3EF]/80 px-6 text-center">
          <p className="text-base font-black text-[#433C38]">아직 스캔한 위치가 없어요</p>
          <p className="text-xs leading-5 text-[#8C817A]">
            간판을 스캔하면 더현대서울 실내 지도에 내 위치를 표시해요.
          </p>
          <button
            type="button"
            onClick={() => setScanOpen(true)}
            className="mt-1 rounded-full bg-brand px-5 py-2.5 text-sm font-black text-white"
          >
            다시 스캔
          </button>
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-30 rounded-t-[20px] border-t border-line bg-white px-4 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(60,45,35,0.12)]">
        <p className="text-[11px] font-bold text-brand">내 위치</p>
        <p className="truncate text-[16px] font-black leading-tight text-ink">
          {location
            ? `${location.name}${location.floor ? ` · ${location.floor}` : ""}`
            : "아직 스캔한 위치가 없어요"}
        </p>
        <div className="mt-2.5 flex gap-2">
          <button
            type="button"
            onClick={() => setScanOpen(true)}
            className="flex-1 rounded-full border border-line py-2.5 text-[14px] font-bold text-ink"
          >
            다시 스캔
          </button>
          <button
            type="button"
            disabled={!location}
            onClick={() => router.push("/ai-course?from=scan")}
            className="flex-[1.7] rounded-full bg-brand py-2.5 text-[14px] font-black text-white disabled:opacity-40"
          >
            길찾기
          </button>
        </div>
      </div>

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
    </div>
  );
}
