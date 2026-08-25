"use client";

import { Suspense, useLayoutEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { isScanLocationFlowRoute } from "@/lib/navigation/scan-location";
import { useScanLocationStore } from "@/stores/use-scan-location-store";

/**
 * OCR 내 위치는 `/scan-map` 과 `/ai-course?from=scan` 에만 둡니다.
 * 탭·헤더·뒤로가기로 벗어나면 페인트 전에 store 와 sessionStorage 를 지웁니다.
 */
function ScanLocationLifecycleWatcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useLayoutEffect(() => {
    if (isScanLocationFlowRoute(pathname, search)) return;
    useScanLocationStore.getState().clearLocation();
  }, [pathname, search]);

  return null;
}

export function ScanLocationLifecycle() {
  return (
    <Suspense fallback={null}>
      <ScanLocationLifecycleWatcher />
    </Suspense>
  );
}
