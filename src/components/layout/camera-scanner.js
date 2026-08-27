"use client";

import { useEffect, useRef, useState } from "react";

export function CameraScanner({
  open,
  onClose,
  onCapture,
  overlayClassName = "lg:hidden",
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);
  const [shot, setShot] = useState(null);
  const [cameraMode, setCameraMode] = useState("live");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open || shot || cameraMode !== "live") return undefined;

    let cancelled = false;

    async function start() {
      setError(null);
      setReady(false);

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraMode("file");
        setError("이 브라우저에서는 실시간 카메라를 사용할 수 없습니다.");
        return;
      }

      const candidates = [
        { video: { facingMode: { exact: "environment" } }, audio: false },
        { video: { facingMode: { ideal: "environment" } }, audio: false },
        { video: true, audio: false },
      ];

      try {
        let stream = null;

        for (const constraints of candidates) {
          try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            break;
          } catch (innerError) {
            const name = innerError?.name;
            if (
              name !== "OverconstrainedError" &&
              name !== "NotFoundError" &&
              name !== "AbortError"
            ) {
              throw innerError;
            }
          }
        }

        if (!stream) {
          throw new Error("camera_unavailable");
        }

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          if (!cancelled) setReady(true);
        }
      } catch (requestError) {
        if (cancelled) return;

        const denied =
          requestError?.name === "NotAllowedError" ||
          requestError?.name === "SecurityError";

        setCameraMode("file");
        setError(
          denied
            ? "카메라 권한이 차단되었습니다. 브라우저 권한을 허용하거나 아래에서 카메라를 다시 열어 주세요."
            : "실시간 카메라를 열지 못했습니다. 아래에서 카메라 또는 사진을 선택해 주세요.",
        );
      }
    }

    start();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [cameraMode, open, shot]);

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }

  function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    setShot(canvas.toDataURL("image/jpeg", 0.92));
  }

  function handleClose() {
    stopStream();
    setShot(null);
    setError(null);
    setCameraMode("live");
    setReady(false);
    onClose();
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        stopStream();
        setShot(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function useShot() {
    if (onCapture && shot) onCapture(shot);
    handleClose();
  }

  if (!open) return null;

  return (
    <div className={`fixed inset-0 z-[200] flex flex-col bg-black ${overlayClassName}`}>
      <div className="flex items-center justify-between px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] text-white">
        <span className="text-sm font-bold">로고 스캔 (OCR)</span>
        <button
          type="button"
          onClick={handleClose}
          aria-label="닫기"
          className="text-2xl leading-none text-white/85"
        >
          ×
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {error ? (
          <div className="flex h-full items-center justify-center px-8 text-center text-sm leading-6 text-white/80">
            {error}
          </div>
        ) : shot ? (
          <img src={shot} alt="촬영한 로고 이미지" className="h-full w-full object-contain" />
        ) : (
          <>
            {cameraMode === "live" ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onPlaying={() => setReady(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-neutral-950 px-8 text-center text-sm leading-6 text-white/70">
                실시간 카메라 대신 기기 카메라 또는 사진 선택으로 계속할 수 있습니다.
              </div>
            )}

            {/* 스트림이 준비되기 전(권한 요청 중) 안내 배경 */}
            {cameraMode === "live" && !ready ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-linear-to-b from-[#1a1030] via-[#0f0a1e] to-black px-8 text-center">
                <span className="flex size-16 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                  <svg viewBox="0 0 24 24" className="size-8 text-white/90" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7.5A1.5 1.5 0 0 1 5.5 6h2l1-1.5h7L18 6h.5A1.5 1.5 0 0 1 20 7.5v10A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5z" />
                    <circle cx="12" cy="12.5" r="3.2" />
                  </svg>
                </span>
                <div className="space-y-1.5">
                  <p className="text-base font-black text-white">카메라 권한을 허용해 주세요</p>
                  <p className="text-xs leading-5 text-white/70">
                    브라우저의 권한 요청을 &lsquo;허용&rsquo;하면
                    <br />
                    로고 스캔이 자동으로 시작됩니다.
                  </p>
                </div>
                <span className="mt-1 size-6 animate-spin rounded-full border-2 border-white/25 border-t-white/80" />
              </div>
            ) : null}

            {ready ? (
              <>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="h-40 w-[82%] rounded-2xl border-2 border-white/85 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
                </div>
                <p className="absolute inset-x-0 bottom-28 text-center text-xs text-white/80">
                  인식할 로고를 가이드 안에 맞춰 주세요.
                </p>
              </>
            ) : null}
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />

      {shot ? (
        <div className="flex items-center justify-center gap-8 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-5">
          <button
            type="button"
            onClick={() => setShot(null)}
            className="rounded-full border border-white/40 px-5 py-2.5 text-sm font-bold text-white"
          >
            다시 촬영
          </button>
          <button
            type="button"
            onClick={useShot}
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-black text-white"
          >
            이 사진 사용
          </button>
        </div>
      ) : (
        <div className="relative flex items-center justify-center pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-5">
          <button
            type="button"
            onClick={openFilePicker}
            className="absolute left-8 flex flex-col items-center gap-1 text-[11px] font-bold text-white/85"
          >
            <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <rect x="3.5" y="4.5" width="17" height="15" rx="2.4" />
              <circle cx="8.5" cy="9.5" r="1.6" />
              <path strokeLinecap="round" strokeLinejoin="round" d="m5 17 4.5-4.5 4 3.5L17 12l2.5 2.5" />
            </svg>
            갤러리
          </button>

          {cameraMode === "live" && ready ? (
            <button
              type="button"
              onClick={capture}
              aria-label="촬영"
              className="size-16 rounded-full border-4 border-white bg-white/25 transition active:scale-95"
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
