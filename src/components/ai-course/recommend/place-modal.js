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

export function PlaceModal({ place, onClose }) {
  const [liked, setLiked] = useState(false);

  // 장소는 두 갈래로 들어옵니다. 데모 픽스처는 평점·태그·상품까지 갖췄지만,
  // Boni 추천과 '장소 추가'로 담기는 실내 지도 매장은 길찾기에 필요한 최소
  // 필드만 갖고 있습니다. 없는 값은 렌더하지 않고 안전한 기본값으로 대체합니다.
  const accent = place.accentColor ?? "#5c2ef5";
  const gradientFrom = place.gradientFrom ?? accent;
  const gradientTo = place.gradientTo ?? "#1a142e";
  const heroImage = place.heroImage ?? place.image ?? null;
  const tags = place.tags ?? [];
  // AI 장소는 desc 자리에 추천 이유가 들어가므로, 아래 전용 블록과 겹치지 않게 합니다.
  const description = place.longDesc ?? (place.aiReason ? "" : place.desc ?? "");
  const hasRating = typeof place.rating === "number";
  const infoTiles = [
    { icon: <Clock size={13} />, label: "운영 시간", value: place.hours },
    { icon: <span className="text-sm">💰</span>, label: "가격대", value: place.price },
    { icon: <MapPin size={13} />, label: "위치", value: place.location },
  ].filter((tile) => Boolean(tile.value));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-5"
      style={{ backgroundColor: "rgba(10,8,20,0.72)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
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
              className={`text-[11px] font-semibold px-3 py-1 rounded-full backdrop-blur-sm ${place.categoryStyle}`}
              style={{ border: "1px solid rgba(255,255,255,0.25)" }}
            >
              {place.category}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLiked((v) => !v)}
                className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm"
                style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
              >
                <Heart
                  size={14}
                  className={liked ? "fill-rose-400 text-rose-400" : "text-white"}
                />
              </button>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm"
                style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
              >
                <Share2 size={14} className="text-white" />
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm"
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
                {place.location}
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

            {/* Boni 추천 이유 — AI가 담은 장소에만 있습니다. */}
            {place.aiReason ? (
              <div
                className="mb-4 rounded-[12px] px-4 py-3"
                style={{ backgroundColor: "#f7f5ff", border: "1px solid #e0d9f8" }}
              >
                <p className="mb-1 text-[10px] font-bold tracking-wide text-[#5c2ef5]">
                  BONI 추천 이유
                </p>
                <p className="text-[12px] leading-relaxed text-[#1a142e]">
                  {place.aiReason}
                </p>
              </div>
            ) : null}

            {/* Description */}
            {description ? (
              <p className="text-[#1a142e] text-[13px] leading-relaxed mb-5 break-words">
                {description}
              </p>
            ) : null}

            {/* Info tiles — 패션 제외 */}
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

            {/* Products — 패션 전용 */}
            {place.products && place.products.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[12px] font-bold text-[#1a142e]">인기 상품</p>
                  <span
                    className="text-[11px] font-medium cursor-pointer"
                    style={{ color: accent }}
                  >
                    전체 보기 →
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {place.products.map((product) => (
                    <button
                      key={product.name}
                      className="group flex flex-col text-left rounded-[12px] overflow-hidden border border-transparent hover:border-[#e0d9f8] hover:shadow-sm transition-all bg-white"
                      style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}
                    >
                      <div className="relative w-full aspect-square overflow-hidden bg-[#f7f5ff]">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span
                          className="absolute top-1 left-1 text-white text-[8px] font-bold px-[6px] py-[2px] rounded-full"
                          style={{ backgroundColor: product.badgeColor }}
                        >
                          {product.badge}
                        </span>
                      </div>
                      <div className="px-[6px] py-[6px]">
                        <p className="text-[#1a142e] text-[10px] font-semibold leading-snug line-clamp-2 mb-1">
                          {product.name}
                        </p>
                        <p
                          className="text-[11px] font-bold"
                          style={{ color: accent }}
                        >
                          {product.price}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Booking notice */}
            {place.booking && (
              <div className="flex items-center gap-2 rounded-[10px] px-4 py-3 mb-4 bg-[#f0ecfa] border border-[#e0d9f8]">
                <span className="text-base">📅</span>
                <p className="text-[11px] text-[#6b6685]">
                  실시간 예약 · 대기 확인은{" "}
                  <span className="font-semibold text-[#5c2ef5]">캐치테이블</span>에서
                </p>
              </div>
            )}

            {/* CTA */}
            <button
              className="w-full rounded-full py-[14px] text-[14px] font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
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
    </div>
  );
}
