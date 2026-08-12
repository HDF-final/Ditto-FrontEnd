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
        <div className="relative h-[240px] shrink-0 overflow-hidden">
          <img
            src={place.heroImage}
            alt={place.name}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.82)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg,rgba(0,0,0,0.08) 0%,rgba(0,0,0,0) 30%,${place.gradientFrom}cc 80%,${place.gradientTo} 100%)`,
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
              <div className="flex items-center gap-1">
                <StarRating rating={place.rating} />
                <span className="text-white text-[11px] font-semibold">
                  {place.rating}
                </span>
                <span className="text-white/60 text-[10px]">
                  ({place.reviews.toLocaleString()})
                </span>
              </div>
              <span className="text-white/40">·</span>
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
            <div className="flex flex-wrap gap-[6px] mb-4">
              {place.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-medium px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: `${place.accentColor}14`,
                    color: place.accentColor,
                    border: `1px solid ${place.accentColor}30`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            {/* Description */}
            <p className="text-[#1a142e] text-[13px] leading-relaxed mb-5 break-words">
              {place.longDesc}
            </p>

            {/* Info tiles — 패션 제외 */}
            {place.category !== "패션" && (
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { icon: <Clock size={13} />, label: "운영 시간", value: place.hours },
                  { icon: <span className="text-sm">💰</span>, label: "가격대", value: place.price },
                  { icon: <MapPin size={13} />, label: "위치", value: place.location },
                ].map(({ icon, label, value }) => (
                  <div
                    key={label}
                    className="rounded-[12px] px-3 py-3"
                    style={{ backgroundColor: "#f7f5ff" }}
                  >
                    <div
                      className="flex items-center gap-1 mb-1"
                      style={{ color: place.accentColor }}
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
                    style={{ color: place.accentColor }}
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
                          style={{ color: place.accentColor }}
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
                background: `linear-gradient(135deg, ${place.accentColor}, ${
                  place.gradientTo === "#1a142e"
                    ? place.accentColor + "bb"
                    : place.gradientTo
                })`,
                boxShadow: `0 8px 24px ${place.accentColor}44`,
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
