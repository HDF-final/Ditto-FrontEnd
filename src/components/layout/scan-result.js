"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getBrands,
  isBrandMatch,
  matchBrandByText,
  scanBrandLogo,
} from "@/lib/api/brands";
import { dataUrlToBlob } from "@/lib/utils/image-compression";

// 로고를 같은 오리진 프록시로 받는 URL. (S3 원본은 CORS가 없어 <img> 표시는
// 되지만, 지도와 동일하게 프록시를 거쳐 일관되게 불러옵니다.)
function logoProxyUrl(logoUrl) {
  return `/brand-logo?src=${encodeURIComponent(logoUrl)}`;
}

/**
 * OCR 스캔 결과 오버레이 (모바일 전용).
 * 카메라/갤러리에서 넘어온 로고 이미지를 서버로 보내 브랜드를 인식하고,
 * 매칭된 브랜드를 보여준 뒤 관련 코스 탐색으로 이동시킵니다.
 */
export function ScanResult({ open, image, onClose, onRescan }) {
  const router = useRouter();
  // "loading" | "matched" | "notfound" | "error"
  const [status, setStatus] = useState("loading");
  const [brand, setBrand] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !image) return undefined;

    let cancelled = false;

    async function run() {
      setStatus("loading");
      setBrand(null);
      setError(null);
      try {
        const blob = dataUrlToBlob(image);
        if (!blob) throw new Error("이미지를 읽을 수 없어요. 다시 촬영해주세요.");
        const file = new File([blob], "scan.jpg", { type: blob.type });

        const result = await scanBrandLogo(file);
        if (cancelled) return;

        // 서버가 브랜드를 직접 매칭해 주면 그대로 사용하고, 인식 텍스트만
        // 돌려주면 브랜드 목록과 클라이언트에서 대조합니다.
        let matched = isBrandMatch(result) ? result : null;
        if (!matched && result?.text) {
          const brands = await getBrands().catch(() => []);
          if (cancelled) return;
          matched = matchBrandByText(result.text, brands);
        }

        if (matched) {
          setBrand(matched);
          setStatus("matched");
        } else {
          setStatus("notfound");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "인식에 실패했어요. 잠시 후 다시 시도해주세요.");
          setStatus("error");
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [open, image]);

  if (!open) return null;

  function goToCourses() {
    onClose();
    router.push("/community");
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/90 lg:hidden">
      <div className="flex items-center justify-between px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] text-white">
        <span className="text-sm font-bold">로고 스캔 결과</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="text-2xl leading-none text-white/85"
        >
          ×
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {image ? (
          <img src={image} alt="스캔한 이미지" className="h-full w-full object-contain" />
        ) : null}

        {status === "loading" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/45 text-white">
            <span className="size-9 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <p className="text-sm font-bold">로고를 인식하는 중…</p>
          </div>
        ) : null}
      </div>

      <div className="rounded-t-3xl bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-5">
        {status === "matched" && brand ? (
          <>
            <div className="flex items-center gap-3">
              {brand.logoUrl ? (
                <img
                  src={logoProxyUrl(brand.logoUrl)}
                  alt=""
                  className="size-12 shrink-0 rounded-xl border border-line object-contain"
                />
              ) : (
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-lg font-black text-brand">
                  {brand.name?.[0] ?? "?"}
                </span>
              )}
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-brand">브랜드를 찾았어요</p>
                <p className="truncate text-lg font-black text-ink">{brand.name}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={onRescan}
                className="flex-1 rounded-full border border-line py-3 text-sm font-bold text-ink"
              >
                다시 스캔
              </button>
              <button
                type="button"
                onClick={goToCourses}
                className="flex-[1.6] rounded-full bg-brand py-3 text-sm font-black text-white"
              >
                관련 코스 보기
              </button>
            </div>
          </>
        ) : status === "loading" ? (
          <p className="py-2 text-center text-sm text-ink-subtle">
            잠시만 기다려주세요…
          </p>
        ) : (
          <>
            <p className="text-lg font-black text-ink">
              {status === "error" ? "인식에 실패했어요" : "브랜드를 찾지 못했어요"}
            </p>
            <p className="mt-1 text-sm leading-6 text-ink-subtle">
              {status === "error"
                ? error
                : "로고가 사각형 안에 또렷하게 들어오도록 다시 촬영해보세요."}
            </p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-line py-3 text-sm font-bold text-ink"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={onRescan}
                className="flex-[1.6] rounded-full bg-brand py-3 text-sm font-black text-white"
              >
                다시 스캔
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
