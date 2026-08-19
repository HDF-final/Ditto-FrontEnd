"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import {
  X,
  MapPin,
} from "./recommend-icons";

/**
 * AI 추천 장소 전용 상세 모달 (스케치 반영: 2컬럼 레이아웃)
 * - 좌측: 브랜드명, 브랜드 위치, AI 추천 이유, 매장 사진 갤러리 (3장), 방문 CTA
 * - 우측: 연예인 / 앰버서더 / K-컬처 비주얼 사진 및 캡션
 */
function AiPlaceModalContent({ place, onClose }) {
  const locationText = place.location || (place.floor ? `더현대서울 ${place.floor}` : "더현대서울");

  // 브랜드별 컨텍스트 매핑 (프라다 카리나, 아디다스 손흥민/제니 등)
  const isPrada = place.name?.includes("프라다") || place.name?.toLowerCase().includes("prada");
  const isAdidas = place.name?.includes("아디다스") || place.name?.toLowerCase().includes("adidas");
  const isGentleMonster = place.name?.includes("젠틀몬스터") || place.name?.toLowerCase().includes("gentle");

  const aiReasonText =
    place.aiReason ||
    (isPrada
      ? "에스파 카리나가 프라다 글로벌 앰버서더로 활약 중이며, 최근 착용한 인기 컬렉션과 아이템을 직접 만나볼 수 있는 대표 매장입니다."
      : isAdidas
      ? "블랙핑크 제니와 손흥민이 착용한 아디다스 오리지널스 및 스타디움 익스클루시브 라인업을 체험할 수 있는 공간입니다."
      : isGentleMonster
      ? "블랙핑크 제니와의 협업 컬렉션 및 감각적인 공간 디자인으로 K-패션 트렌드를 직접 경험할 수 있는 플래그십 스팟입니다."
      : place.desc || "K-컬처 트렌드와 방문자의 취향을 분석하여 추천한 맞춤 매장입니다. 트렌디한 아이템과 시그니처 공간을 경험해보세요.");

  // 매장 / 브랜드 대표 사진 (추천 응답이 준 사진 > placeImg / image 순)
  const rightImage =
    place.aiImage ||
    place.placeImg ||
    place.image ||
    place.imageUrl ||
    place.heroImage ||
    place.ambassadorImage ||
    place.celebrityImage ||
    (isPrada
      ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop"
      : isAdidas
      ? "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop"
      : "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop");

  // 지금 띄운 대표 사진이 추천 응답에서 온 것일 때만 캡션을 답니다.
  // kind가 "evidence"면 매장 사진이 아니라 추천 근거가 된 뉴스 컷이라,
  // 무엇을 찍은 사진인지 밝혀주지 않으면 매장 사진으로 오해합니다.
  const rightImageCaption =
    rightImage && rightImage === place.aiImage ? place.aiImageCaption : null;

  // 브랜드 상품/아이템 대표 사진 3장
  const brandImages =
    place.brandImages ||
    place.galleryImages ||
    (isPrada
      ? [
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=400&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=400&auto=format&fit=crop",
        ]
      : isAdidas
      ? [
          "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?q=80&w=400&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?q=80&w=400&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=400&auto=format&fit=crop",
        ]
      : [
          rightImage,
          "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=400&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=400&auto=format&fit=crop",
        ]);

  return (
    <div
      className="relative w-full max-w-[960px] md:min-h-[620px] max-h-[92vh] rounded-[32px] overflow-hidden shadow-[0_36px_90px_rgba(0,0,0,0.5)] bg-white flex flex-col md:grid md:grid-cols-[0.88fr_1.12fr]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Left Column: 브랜드 정보, AI 추천 이유, 브랜드 사진 3장 */}
      <div className="flex flex-col h-full overflow-y-auto p-6 md:p-8 bg-white justify-between gap-5">
        <div>
          {/* Top Bar: AI Badge (Main Color) & Mobile Close */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5c2ef5] px-3.5 py-1.5 text-[12px] font-black text-white shadow-xs">
              <span className="text-sm">✨</span>
              BONI AI 추천 장소
            </span>
            <button
              type="button"
              onClick={onClose}
              className="size-9 rounded-full flex items-center justify-center transition hover:bg-[#f0ecfa] text-[#6b6685] cursor-pointer md:hidden"
              aria-label="닫기"
            >
              <X size={17} />
            </button>
          </div>

          {/* 브랜드명 */}
          <div>
            <h2 className="text-2xl md:text-[30px] font-black text-[#1a142e] tracking-tight leading-snug">
              {place.name}
            </h2>
            {/* 브랜드 위치 */}
            <div className="flex items-center gap-2 text-[13px] font-bold text-[#5c2ef5] mt-2">
              <MapPin size={15} className="shrink-0" />
              <span>{locationText}</span>
              {place.category ? (
                <>
                  <span className="text-[#9994ad] font-normal">·</span>
                  <span className="text-[#6b6685] font-semibold">{place.category}</span>
                </>
              ) : null}
            </div>
          </div>

          {/* 보니 추천 이유 카드 */}
          <div className="mt-6 rounded-[22px] bg-[#faf8ff] border border-[#e0d9f8] p-5 shadow-xs">
            <div className="flex items-center gap-2 text-[13px] font-black text-[#5c2ef5] mb-2.5">
              <span>💡</span>
              <span>보니 추천 이유</span>
            </div>
            <p className="text-[14px] font-medium leading-[1.7] text-[#2d2745] break-keep">
              {aiReasonText}
            </p>
          </div>

          {/* 브랜드 사진 3장 */}
          <div className="mt-6">
            <p className="text-[12px] font-bold tracking-wide text-[#9994ad] mb-3">
              브랜드 사진
            </p>
            <div className="grid grid-cols-3 gap-3">
              {brandImages.slice(0, 3).map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative aspect-4/3 rounded-[14px] overflow-hidden bg-[#f0ecfa] border border-[#e0d9f8]/60 group shadow-xs"
                >
                  <img
                    src={imgUrl}
                    alt={`${place.name} 브랜드 사진 ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: 대표 사진 / 앰버서더 비주얼 카드 */}
      <div className="relative min-h-[320px] md:min-h-[620px] bg-linear-to-br from-[#2d1b8e] to-[#8c57fa] overflow-hidden flex flex-col p-6 md:p-7">
        {/* Representative Photo */}
        {rightImage ? (
          <img
            src={rightImage}
            alt={place.name}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : null}

        {/* Top Close button on desktop */}
        <div className="relative z-10 hidden md:flex justify-end w-full">
          <button
            type="button"
            onClick={onClose}
            className="size-10 rounded-full flex items-center justify-center bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 cursor-pointer shadow-lg"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>

        {/* 사진 캡션 */}
        {rightImageCaption ? (
          <div className="relative z-10 mt-auto max-w-full self-start rounded-[12px] bg-black/45 px-3 py-2 text-[12px] font-semibold leading-tight text-white backdrop-blur-md">
            {rightImageCaption}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * 일반 매장 상세 모달 (2컬럼 레이아웃: AI 추천 모달과 동일한 와이드 뷰이지만 일반 매장 정보와 place 테이블 이미지 반영)
 */
function StandardPlaceModalContent({ place, onClose }) {
  const locationText =
    place.location || (place.floor ? `더현대서울 ${place.floor}` : "더현대서울");

  // 매장 대표 사진 (DB place 테이블의 image_url / image / placeImg)
  const rightImage =
    place.placeImg ||
    place.image ||
    place.imageUrl ||
    place.heroImage ||
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop";

  // 매장 사진 3장
  const storeImages =
    place.brandImages ||
    place.galleryImages ||
    [
      rightImage,
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=400&auto=format&fit=crop",
    ];

  const storeDescription =
    place.longDesc ||
    place.desc ||
    `${locationText} ${place.name} · 실내 길찾기 지원 매장입니다. 쾌적하고 편리한 쇼핑 경험을 제공합니다.`;

  return (
    <div
      className="relative w-full max-w-[960px] md:min-h-[620px] max-h-[92vh] rounded-[32px] overflow-hidden shadow-[0_36px_90px_rgba(0,0,0,0.5)] bg-white flex flex-col md:grid md:grid-cols-[0.88fr_1.12fr]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Left Column: 매장 정보, 매장 안내, 매장 사진 3장 */}
      <div className="flex flex-col h-full overflow-y-auto p-6 md:p-8 bg-white justify-between gap-5">
        <div>
          {/* Top Bar: Category Badge & Mobile Close */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5c2ef5] px-3.5 py-1.5 text-[12px] font-black text-white shadow-xs">
              {place.category || "매장"}
              {place.floor ? ` · ${place.floor}` : ""}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="size-9 rounded-full flex items-center justify-center transition hover:bg-[#f0ecfa] text-[#6b6685] cursor-pointer md:hidden"
              aria-label="닫기"
            >
              <X size={17} />
            </button>
          </div>

          {/* 매장명 */}
          <div>
            <h2 className="text-2xl md:text-[30px] font-black text-[#1a142e] tracking-tight leading-snug">
              {place.name}
            </h2>
            {/* 매장 위치 */}
            <div className="flex items-center gap-2 text-[13px] font-bold text-[#5c2ef5] mt-2">
              <MapPin size={15} className="shrink-0" />
              <span>{locationText}</span>
              {place.category ? (
                <>
                  <span className="text-[#9994ad] font-normal">·</span>
                  <span className="text-[#6b6685] font-semibold">{place.category}</span>
                </>
              ) : null}
            </div>
          </div>

          {/* 매장 안내 카드 */}
          <div className="mt-6 rounded-[22px] bg-[#faf8ff] border border-[#e0d9f8] p-5 shadow-xs">
            <div className="flex items-center gap-2 text-[13px] font-black text-[#5c2ef5] mb-2.5">
              <span>💡</span>
              <span>매장 안내</span>
            </div>
            <p className="text-[14px] font-medium leading-[1.7] text-[#2d2745] break-keep">
              {storeDescription}
            </p>
          </div>

          {/* 매장 사진 3장 */}
          <div className="mt-6">
            <p className="text-[12px] font-bold tracking-wide text-[#9994ad] mb-3">
              매장 사진
            </p>
            <div className="grid grid-cols-3 gap-3">
              {storeImages.slice(0, 3).map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative aspect-4/3 rounded-[14px] overflow-hidden bg-[#f0ecfa] border border-[#e0d9f8]/60 group shadow-xs"
                >
                  <img
                    src={imgUrl}
                    alt={`${place.name} 매장 사진 ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: 매장 대표 사진 카드 (place 테이블의 image url 사용) */}
      <div className="relative min-h-[320px] md:min-h-[620px] bg-linear-to-br from-[#2d1b8e] to-[#8c57fa] overflow-hidden flex flex-col p-6 md:p-7">
        {/* Representative Photo */}
        {rightImage ? (
          <img
            src={rightImage}
            alt={place.name}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : null}

        {/* Top Close button on desktop */}
        <div className="relative z-10 hidden md:flex justify-end w-full">
          <button
            type="button"
            onClick={onClose}
            className="size-10 rounded-full flex items-center justify-center bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 cursor-pointer shadow-lg"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 원본 컴팩트 매장 모달 (장소 추가 목록에서 매장 클릭 시 사진 없이 깔끔하게 뜨는 모달)
 */
function CompactPlaceModalContent({ place, onClose }) {
  const accent = place.accentColor ?? "#5c2ef5";
  const locationText =
    place.location || (place.floor ? `더현대서울 ${place.floor}` : "더현대서울");

  return (
    <div
      className="relative w-full max-w-[400px] max-h-[85vh] rounded-[24px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.45)] bg-white flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header Gradient */}
      <div
        className="relative px-6 pt-6 pb-5 shrink-0"
        style={{
          background: `linear-gradient(135deg, ${accent}, #1a142e)`,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="inline-block text-[11px] font-bold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-xs border border-white/20">
            {place.category || "매장"} {place.floor ? `· ${place.floor}` : ""}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full flex items-center justify-center bg-black/20 text-white hover:bg-black/40 transition cursor-pointer"
            aria-label="닫기"
          >
            <X size={15} />
          </button>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          {place.name}
        </h2>
        <div className="flex items-center gap-1.5 text-white/80 text-[12px] mt-1">
          <MapPin size={13} className="shrink-0" />
          <span>{locationText}</span>
        </div>
      </div>

      {/* Body Info */}
      <div className="p-6 flex flex-col gap-4 overflow-y-auto">
        <div className="rounded-[16px] bg-[#faf8ff] border border-[#e0d9f8] p-4">
          <p className="text-[10px] font-bold text-[#5c2ef5] tracking-wide mb-1.5 uppercase">
            매장 소개
          </p>
          <p className="text-[13px] text-[#2d2745] leading-relaxed">
            {place.desc || `${locationText} ${place.name} · 실내 길찾기 지원 매장`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[12px]">
          <div className="rounded-xl bg-[#f8f7fc] p-3">
            <span className="text-[10px] font-semibold text-[#9994ad] block mb-1">
              운영 시간
            </span>
            <span className="text-[#1a142e] font-bold">10:30 - 20:00</span>
          </div>
          <div className="rounded-xl bg-[#f8f7fc] p-3">
            <span className="text-[10px] font-semibold text-[#9994ad] block mb-1">
              위치 안내
            </span>
            <span className="text-[#1a142e] font-bold">{place.floor || "더현대서울"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * PlaceModal Entry Component
 * - 장소 추가 목록에서 클릭 시: CompactPlaceModalContent (사진 없는 원본 모달)
 * - 코스 타임라인에서 AI 추천 장소 클릭 시: AiPlaceModalContent (2컬럼 앰버서더 뷰)
 * - 코스 타임라인에서 일반 매장 클릭 시: StandardPlaceModalContent (2컬럼 일반 매장 상세 뷰, place 테이블 이미지 반영)
 */
export function PlaceModal({ place, onClose }) {
  if (!place) return null;

  // 1. 장소 추가 목록에서 매장 클릭 시 -> 원래 사진 없는 컴팩트 모달 표시 (z-index 105)
  if (place.modalMode === "compact") {
    return (
      <div
        className="fixed inset-0 z-[105] flex items-center justify-center p-4 animate-in fade-in duration-150"
        style={{ backgroundColor: "rgba(10,8,20,0.72)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      >
        <CompactPlaceModalContent place={place} onClose={onClose} />
      </div>
    );
  }

  // 2. 코스에 담긴 장소 중 AI 추천 장소 -> AI 추천 2컬럼 모달
  const isAiMode = Boolean(
    place.aiReason || place.isAiRecommended || place.isAiVersion,
  );

  // 3. 코스에 담긴 일반 매장 -> 일반 매장 상세 2컬럼 모달 (우측에 place 테이블 이미지 반영)
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-5 animate-in fade-in duration-150"
      style={{ backgroundColor: "rgba(10,8,20,0.72)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      {isAiMode ? (
        <AiPlaceModalContent place={place} onClose={onClose} />
      ) : (
        <StandardPlaceModalContent place={place} onClose={onClose} />
      )}
    </div>
  );
}
