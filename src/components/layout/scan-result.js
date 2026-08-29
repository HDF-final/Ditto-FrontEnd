"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  resolveOcrCandidate,
  resolveOcrLocationFromDataUrl,
} from "@/lib/navigation/resolve-ocr-location";
import { useScanLocationStore } from "@/stores/use-scan-location-store";

// 로고를 같은 오리진 프록시로 받는 URL. (S3 원본은 CORS가 없어 <img> 표시는
// 되지만, 지도와 동일하게 프록시를 거쳐 일관되게 불러옵니다.)
function logoProxyUrl(logoUrl) {
  return `/brand-logo?src=${encodeURIComponent(logoUrl)}`;
}

// "2" → "2F", "b1" → "B1", "2F" 는 그대로. 후보 층 배지 표시용.
function candidateFloorLabel(floor) {
  if (floor == null || floor === "") return null;
  const text = String(floor).trim();
  if (!text) return null;
  if (/^\d+$/.test(text)) return `${text}F`;
  return text.toUpperCase();
}

/**
 * OCR 스캔 결과 오버레이.
 * 하단 + 버튼은 `/scan-map` 으로 보내고, 스캔 맵에서 다시 찍으면 현재 지도에 바로 반영합니다.
 *
 * @param {"map" | "stay"} afterMatch map: `/scan-map` 으로 이동, stay: 현재 화면 유지
 */
export function ScanResult({
  open,
  image,
  onClose,
  onRescan,
  afterMatch = "map",
  overlayClassName = "lg:hidden",
}) {
  const router = useRouter();
  const setLocation = useScanLocationStore((state) => state.setLocation);
  // "loading" | "select" | "matched" | "notfound" | "auth" | "error"
  const [status, setStatus] = useState("loading");
  const [brand, setBrand] = useState(null);
  const [mappedPlace, setMappedPlace] = useState(null);
  const [matchedLocation, setMatchedLocation] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState(null);
  const chooseAbortRef = useRef(null);

  useEffect(
    () => () => chooseAbortRef.current?.abort(),
    [],
  );

  useEffect(() => {
    if (!open || !image) return undefined;

    let cancelled = false;
    const abort = new AbortController();

    async function run() {
      setStatus("loading");
      setBrand(null);
      setMappedPlace(null);
      setMatchedLocation(null);
      setCandidates([]);
      setError(null);
      try {
        const resolved = await resolveOcrLocationFromDataUrl(image, {
          signal: abort.signal,
        });
        if (cancelled) return;

        if (resolved.requiresSelection) {
          setCandidates(resolved.candidates ?? []);
          setStatus("select");
          return;
        }

        if (!resolved.brand?.name) {
          setStatus("notfound");
          return;
        }

        setMatchedLocation(resolved.location ?? null);
        setBrand(resolved.brand);
        setMappedPlace(resolved.place);
        setStatus("matched");
      } catch (err) {
        if (!cancelled && err?.name !== "AbortError") {
          const statusCode = Number(err?.status);
          if (statusCode === 401 || statusCode === 403) {
            setError("로고 스캔은 로그인 후 사용할 수 있어요.");
            setStatus("auth");
            return;
          }
          setError(err?.message || "인식에 실패했어요. 잠시 후 다시 시도해주세요.");
          setStatus("error");
        }
      }
    }

    run();

    return () => {
      cancelled = true;
      abort.abort();
    };
  }, [open, image]);

  if (!open) return null;

  function goToMap() {
    if (matchedLocation) setLocation(matchedLocation);
    onClose();
    if (afterMatch === "stay") return;
    router.push("/scan-map");
  }

  function goToLogin() {
    onClose();
    router.push("/login?next=scan");
  }

  // 선택지에서 탭한 후보로 원래 진행 흐름(placeId/navigationKey → 위치)을 태웁니다.
  async function chooseCandidate(candidate) {
    chooseAbortRef.current?.abort();
    const abort = new AbortController();
    chooseAbortRef.current = abort;

    setStatus("loading");
    setError(null);
    try {
      const resolved = await resolveOcrCandidate(candidate, { signal: abort.signal });
      if (abort.signal.aborted) return;

      if (!resolved.brand?.name) {
        setStatus("notfound");
        return;
      }
      setMatchedLocation(resolved.location ?? null);
      setBrand(resolved.brand);
      setMappedPlace(resolved.place);
      setStatus("matched");
    } catch (err) {
      if (abort.signal.aborted || err?.name === "AbortError") return;
      const statusCode = Number(err?.status);
      if (statusCode === 401 || statusCode === 403) {
        setError("로고 스캔은 로그인 후 사용할 수 있어요.");
        setStatus("auth");
        return;
      }
      setError(err?.message || "인식에 실패했어요. 잠시 후 다시 시도해주세요.");
      setStatus("error");
    }
  }

  return (
    <div className={`fixed inset-0 z-[200] flex flex-col bg-black/90 ${overlayClassName}`}>
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
                <p className="text-[11px] font-bold text-brand">
                  {mappedPlace ? "내 위치를 찾았어요" : "브랜드를 찾았어요"}
                </p>
                <p className="truncate text-lg font-black text-ink">{brand.name}</p>
                {mappedPlace ? (
                  <p className="mt-0.5 truncate text-xs font-bold text-ink-subtle">
                    더현대서울 {mappedPlace.floor} · {mappedPlace.name}
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs leading-5 text-ink-subtle">
                    실내 지도에서 이 매장 위치를 찾지 못했어요.
                  </p>
                )}
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
                onClick={mappedPlace ? goToMap : onClose}
                className="flex-[1.6] rounded-full bg-brand py-3 text-sm font-black text-white"
              >
                {mappedPlace
                  ? afterMatch === "stay"
                    ? "지도에 표시"
                    : "지도에서 보기"
                  : "닫기"}
              </button>
            </div>
          </>
        ) : status === "select" ? (
          <>
            <p className="text-lg font-black text-ink">어느 매장인가요?</p>
            <p className="mt-1 text-sm leading-6 text-ink-subtle">
              같은 이름의 매장이 여러 곳이에요. 지금 계신 곳을 골라주세요.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {candidates.map((candidate, index) => {
                const floorLabel = candidateFloorLabel(candidate.floor);
                return (
                  <button
                    key={candidate.placeId ?? candidate.navigationKey ?? index}
                    type="button"
                    onClick={() => chooseCandidate(candidate)}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3 text-left"
                  >
                    <span className="truncate text-sm font-black text-ink">
                      {candidate.name}
                    </span>
                    {floorLabel ? (
                      <span className="shrink-0 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand">
                        {floorLabel}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={onRescan}
              className="mt-3 w-full rounded-full border border-line py-3 text-sm font-bold text-ink"
            >
              다시 스캔
            </button>
          </>
        ) : status === "loading" ? (
          <p className="py-2 text-center text-sm text-ink-subtle">
            잠시만 기다려주세요…
          </p>
        ) : (
          <>
            <p className="text-lg font-black text-ink">
              {status === "auth"
                ? "로그인이 필요해요"
                : status === "error"
                  ? "인식에 실패했어요"
                  : "브랜드를 찾지 못했어요"}
            </p>
            <p className="mt-1 text-sm leading-6 text-ink-subtle">
              {status === "auth"
                ? error
                : status === "error"
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
                onClick={status === "auth" ? goToLogin : onRescan}
                className="flex-[1.6] rounded-full bg-brand py-3 text-sm font-black text-white"
              >
                {status === "auth" ? "로그인하기" : "다시 스캔"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
