"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import {
  X,
  MapPin,
  Clock,
  Star,
  Heart,
  Share2,
  ExternalLink,
} from "./recommend-icons";

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-[3px]">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={11}
          className={
            n <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }
        />
      ))}
    </div>
  );
}

/**
 * AI 추천 장소 전용 상세 모달 (스케치 반영: 2컬럼 레이아웃)
 * - 좌측: 브랜드명, 브랜드 위치, AI 추천 이유, 매장 사진 갤러리 (3장), 방문 CTA
 * - 우측: 연예인 / 앰버서더 / K-컬처 비주얼 사진 및 캡션
 */
function AiPlaceModalContent({ place, onClose }) {
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const accent = place.accentColor ?? "#5c2ef5";
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

  // 앰버서더 / 연예인 비주얼 이미지
  const ambassadorImage =
    place.ambassadorImage ||
    place.celebrityImage ||
    (isPrada
      ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop"
      : isAdidas
      ? "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop"
      : place.heroImage ||
        place.image ||
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop");

  const ambassadorName =
    place.celebrityName ||
    (isPrada ? "카리나 (Karina)" : isAdidas ? "손흥민 & 제니" : isGentleMonster ? "제니 (Jennie)" : "K-Culture Icon");

  const ambassadorRole =
    place.celebrityRole ||
    (isPrada ? "PRADA 글로벌 앰버서더" : isAdidas ? "Adidas 글로벌 앰버서더" : isGentleMonster ? "Gentle Monster 글로벌 앰버서더" : "DITTO 트렌드 픽");

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
          place.image || "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=400&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=400&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=400&auto=format&fit=crop",
        ]);

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

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

      {/* Right Column: 연예인 / 앰버서더 사진 카드 */}
      <div className="relative min-h-[320px] md:min-h-[620px] bg-linear-to-br from-[#2d1b8e] to-[#8c57fa] overflow-hidden flex flex-col justify-between p-7 md:p-8">
        {/* Ambassador Representative Photo */}
        <img
          src={ambassadorImage}
          alt={`${ambassadorName} - ${place.name}`}
          className="absolute inset-0 w-full h-full object-cover object-top filter brightness-90"
        />

        {/* Gradient overlays for contrast */}
        <div className="absolute inset-0 bg-linear-to-t from-[#140f29]/95 via-[#140f29]/35 to-black/25" />

        {/* Top Close button on desktop */}
        <div className="relative z-10 hidden md:flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="size-10 rounded-full flex items-center justify-center bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 cursor-pointer shadow-lg"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>

        {/* Bottom Caption: 연예인 앰버서더 정보 */}
        <div className="relative z-10 mt-auto text-white">
          <span className="inline-block rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1.5 text-[11px] font-black text-white mb-2.5 border border-white/30">
            K-CULTURE AMBASSADOR
          </span>
          <h3 className="text-2xl md:text-3xl font-black text-white drop-shadow-md">
            {ambassadorName}
          </h3>
          <p className="text-[13px] font-semibold text-white/90 mt-1.5 drop-shadow-sm">
            {ambassadorRole}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 기본 장소 모달 (단일 카드 형태)
 */
function StandardPlaceModalContent({ place, onClose }) {
  const [liked, setLiked] = useState(false);

  const accent = place.accentColor ?? "#5c2ef5";
  const gradientFrom = place.gradientFrom ?? accent;
  const gradientTo = place.gradientTo ?? "#1a142e";
  const heroImage = place.heroImage ?? place.image ?? null;
  const tags = place.tags ?? [];
  const description = place.longDesc ?? place.desc ?? "";
  const hasRating = typeof place.rating === "number";
  const infoTiles = [
    { icon: <Clock size={13} />, label: "운영 시간", value: place.hours },
    { icon: <span className="text-sm">💰</span>, label: "가격대", value: place.price },
    { icon: <MapPin size={13} />, label: "위치", value: place.location },
  ].filter((tile) => Boolean(tile.value));

  return (
    <div
      className="relative max-h-[90vh] rounded-[24px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.45)] flex flex-col w-full"
      style={{ maxWidth: place.products ? "440px" : "380px" }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Hero */}
      <div
        className="relative h-[240px] shrink-0 overflow-hidden"
        style={{ background: `linear-gradient(135deg,${gradientFrom},${gradientTo})` }}
      >
        {heroImage ? (
          <img
            src={heroImage}
            alt={place.name}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.82)" }}
          />
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg,rgba(0,0,0,0.08) 0%,rgba(0,0,0,0) 30%,${gradientFrom}cc 80%,${gradientTo} 100%)`,
          }}
        />
        <div className="absolute top-4 left-5 right-5 flex items-center justify-between">
          <span
            className={`text-[11px] font-semibold px-3 py-1 rounded-full backdrop-blur-sm ${place.categoryStyle || "bg-white/90 text-brand"}`}
            style={{ border: "1px solid rgba(255,255,255,0.25)" }}
          >
            {place.category || "매장"}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLiked((v) => !v)}
              className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer"
              style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
            >
              <Heart
                size={14}
                className={liked ? "fill-rose-400 text-rose-400" : "text-white"}
              />
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer"
              style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
            >
              <Share2 size={14} className="text-white" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer"
              style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
            >
              <X size={14} className="text-white" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-5">
          <h2 className="text-white font-bold text-[22px] leading-tight drop-shadow-lg">
            {place.name}
          </h2>
          <div className="flex items-center gap-3 mt-2">
            {hasRating && (
              <>
                <div className="flex items-center gap-1">
                  <StarRating rating={place.rating} />
                  <span className="text-white text-[11px] font-semibold">
                    {place.rating}
                  </span>
                  {typeof place.reviews === "number" && (
                    <span className="text-white/60 text-[10px]">
                      ({place.reviews.toLocaleString()})
                    </span>
                  )}
                </div>
                <span className="text-white/40">·</span>
              </>
            )}
            <div className="flex items-center gap-1 text-white/80 text-[11px]">
              <MapPin size={11} className="shrink-0" />
              {place.location || place.floor}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 bg-white">
        <div className="px-6 pt-5 pb-6">
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-[6px] mb-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-medium px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: `${accent}14`,
                    color: accent,
                    border: `1px solid ${accent}30`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {description ? (
            <p className="text-[#1a142e] text-[13px] leading-relaxed mb-5 break-words">
              {description}
            </p>
          ) : null}

          {/* Info tiles */}
          {place.category !== "패션" && infoTiles.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-5">
              {infoTiles.map(({ icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-[12px] px-3 py-3"
                  style={{ backgroundColor: "#f7f5ff" }}
                >
                  <div
                    className="flex items-center gap-1 mb-1"
                    style={{ color: accent }}
                  >
                    {icon}
                    <span className="text-[9px] font-bold tracking-wide uppercase opacity-80">
                      {label}
                    </span>
                  </div>
                  <p className="text-[#1a142e] text-[12px] font-semibold leading-snug">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <button
            type="button"
            className="w-full rounded-full py-[14px] text-[14px] font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${
                gradientTo === "#1a142e" ? accent + "bb" : gradientTo
              })`,
              boxShadow: `0 8px 24px ${accent}44`,
            }}
          >
            {place.booking ? "캐치테이블에서 예약" : "지금 바로 방문하기"}
            <ExternalLink size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * PlaceModal Entry Component
 * - 상단 스위처로 [✨ AI 추천 모달 버전]과 [일반 매장 모달 버전]을 자유롭게 전환하여 미리보기 가능
 */
export function PlaceModal({ place, onClose }) {
  const [isAiMode, setIsAiMode] = useState(() =>
    Boolean(place?.aiReason || place?.isAiRecommended || place?.isAiVersion || true),
  );

  if (!place) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 sm:p-5 animate-in fade-in duration-150"
      style={{ backgroundColor: "rgba(10,8,20,0.72)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      {/* Top Preview Mode Switcher */}
      <div
        className="mb-3.5 flex items-center gap-1 rounded-full bg-[#18132b]/90 p-1.5 backdrop-blur-md border border-white/20 shadow-2xl z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setIsAiMode(true)}
          className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-black transition cursor-pointer ${
            isAiMode
              ? "bg-[#5c2ef5] text-white shadow-sm scale-102"
              : "text-white/70 hover:text-white"
          }`}
        >
          <span>✨</span>
          <span>AI 추천 모달 버전</span>
        </button>
        <button
          type="button"
          onClick={() => setIsAiMode(false)}
          className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-black transition cursor-pointer ${
            !isAiMode
              ? "bg-white text-[#1a142e] shadow-sm scale-102"
              : "text-white/70 hover:text-white"
          }`}
        >
          <span>일반 매장 모달 버전</span>
        </button>
      </div>

      {isAiMode ? (
        <AiPlaceModalContent place={place} onClose={onClose} />
      ) : (
        <StandardPlaceModalContent place={place} onClose={onClose} />
      )}
    </div>
  );
}
