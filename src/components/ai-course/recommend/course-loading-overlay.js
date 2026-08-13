"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { BONI_IMAGE } from "./recommend-data";
import { useTransparentBg } from "./use-transparent-bg";

/** 백엔드 플래닝 평균 소요 시간. 진행률 막대의 기준값으로만 씁니다. */
const EXPECTED_SECONDS = 40;

/**
 * 코스 추천 응답을 기다리는 동안 화면 전체를 덮는 버퍼링 오버레이.
 *
 * 첫 요청(프롬프트 → 결과 화면 전환)과 결과 화면 안의 Boni 대화가 같은 화면을
 * 쓰므로 오버레이도 하나만 둡니다. 응답이 도착해 `pending`이 풀리면 언마운트되며,
 * 40초는 무한 스피너로 버티기엔 길어서 경과 시간과 취소 버튼을 함께 보여줍니다.
 */
export function CourseLoadingOverlay({ message, isFirstTurn = true, onCancel }) {
  const [elapsed, setElapsed] = useState(0);
  const boniSrc = useTransparentBg(BONI_IMAGE);

  useEffect(() => {
    const startedAt = Date.now();
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 배경이 스크롤되면 대기 중이라는 감각이 깨져서 잠가둡니다.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // 예상 시간을 넘겨도 100%로 붙지 않게 상한을 둡니다.
  const progress = Math.min((elapsed / EXPECTED_SECONDS) * 100, 96);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-[90] flex items-center justify-center px-5"
      style={{
        background: "rgba(240,236,250,0.82)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <div
        className="w-full max-w-[420px] rounded-[28px] bg-white px-7 py-8 text-center"
        style={{ boxShadow: "0 24px 70px rgba(92,46,245,0.22)" }}
      >
        {/* Boni + 회전 링 */}
        <div className="relative mx-auto mb-5 h-[96px] w-[96px]">
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-spin rounded-full"
            style={{
              border: "3px solid #ede9f8",
              borderTopColor: "#5c2ef5",
              animationDuration: "1.1s",
            }}
          />
          <img
            src={boniSrc}
            alt=""
            aria-hidden="true"
            className="absolute inset-[10px] h-[76px] w-[76px] animate-pulse object-contain"
          />
        </div>

        <h2 className="text-[19px] font-bold text-[#1a142e]">
          {isFirstTurn
            ? "Boni가 코스를 만들고 있어요"
            : "Boni가 코스를 다시 짜고 있어요"}
        </h2>
        <p className="mt-2 text-[13px] leading-[1.6] text-[#9994ad]">
          요청하신 내용을 더현대서울 실내 지도와 맞춰보는 중이에요.
          <br />
          보통 40초 정도 걸려요.
        </p>

        {message ? (
          <p
            className="mt-5 truncate rounded-[14px] px-4 py-3 text-[13px] text-[#5c2ef5]"
            style={{ background: "#f7f4ff" }}
            title={message}
          >
            &ldquo;{message}&rdquo;
          </p>
        ) : null}

        {/* 진행률 막대 — 실제 진행도가 아니라 경과 시간 기준의 안내입니다. */}
        <div
          className="mt-6 h-[6px] w-full overflow-hidden rounded-full"
          style={{ background: "#ede9f8" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg,#5c2ef5,#8b6bff)",
              transition: "width 900ms linear",
            }}
          />
        </div>

        <p className="mt-3 text-[12px] font-medium text-[#9994ad]">
          {elapsed}초 경과
          {elapsed >= EXPECTED_SECONDS ? " · 거의 다 됐어요" : ""}
        </p>

        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="mt-5 rounded-full border border-[#e0d9f8] px-5 py-2 text-[12px] font-semibold text-[#6b6685] transition-colors hover:border-[#5c2ef5] hover:text-[#5c2ef5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c2ef5]"
          >
            요청 취소
          </button>
        ) : null}
      </div>
    </div>
  );
}
