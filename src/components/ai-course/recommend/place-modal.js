"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  X,
  MapPin,
  Plus,
  Clock,
} from "./recommend-icons";
import { getFallbackPlaceImage } from "@/lib/navigation/course-routing-service";
import { getPlaceCategoryLabel } from "@/lib/navigation/place-category";

/**
 * AI 추천 장소 전용 상세 모달 (스케치 반영: 2컬럼 레이아웃)
 * - 좌측: 브랜드명, 브랜드 위치, AI 추천 이유, 매장 사진 갤러리 (3장), 방문 CTA
 * - 우측: 연예인 / 앰버서더 / K-컬처 비주얼 사진 및 캡션
 */
function AiPlaceModalContent({ place, onClose }) {
  const t = useTranslations("aiCourse");
  const locationText = place.location || (place.floor ? `${t("departmentStore")} ${place.floor}` : t("departmentStore"));

  // 브랜드별 컨텍스트 매핑 (프라다 카리나, 아디다스 손흥민/제니 등)
  const isPrada = place.name?.includes("프라다") || place.name?.toLowerCase().includes("prada");
  const isAdidas = place.name?.includes("아디다스") || place.name?.toLowerCase().includes("adidas");
  const isGentleMonster = place.name?.includes("젠틀몬스터") || place.name?.toLowerCase().includes("gentle");

  const aiReasonText =
    place.aiReason ||
    (isPrada
      ? t("pradaReason")
      : isAdidas
      ? t("adidasReason")
      : isGentleMonster
      ? t("gentleReason")
      : place.desc || t("genericReason"));

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
              {t("boniAiPlace")}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="size-9 rounded-full flex items-center justify-center transition hover:bg-[#f0ecfa] text-[#6b6685] cursor-pointer md:hidden"
              aria-label={t("close")}
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
                  <span className="text-[#6b6685] font-semibold">
                    {getPlaceCategoryLabel(place.category, t)}
                  </span>
                </>
              ) : null}
            </div>
          </div>

          {/* 보니 추천 이유 카드 */}
          <div className="mt-6 rounded-[22px] bg-[#faf8ff] border border-[#e0d9f8] p-5 shadow-xs">
            <div className="flex items-center gap-2 text-[13px] font-black text-[#5c2ef5] mb-2.5">
              <span>💡</span>
              <span>{t("boniReason")}</span>
            </div>
            <p className="text-[14px] font-medium leading-[1.7] text-[#2d2745] break-keep">
              {aiReasonText}
            </p>
          </div>

          {/* 브랜드 사진 3장 */}
          <div className="mt-6">
            <p className="text-[12px] font-bold tracking-wide text-[#9994ad] mb-3">
              {t("brandPhotos")}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {brandImages.slice(0, 3).map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative aspect-4/3 rounded-[14px] overflow-hidden bg-[#f0ecfa] border border-[#e0d9f8]/60 group shadow-xs"
                >
                  <img
                    src={imgUrl}
                    alt={t("brandPhotoAlt", { name: place.name, index: idx + 1 })}
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
          <>
            {/* 원본 비율이 제각각입니다. 뉴스 컷은 세로/가로가 섞여 오고 매장
                사진도 규격이 없어서, object-cover로 채우면 인물 얼굴이 잘립니다.
                그렇다고 object-contain만 쓰면 위아래로 빈 띠가 남습니다.
                같은 사진을 크게 흐려서 배경으로 깔고 그 위에 원본을 비율 그대로
                얹으면, 프레임은 꽉 차면서 잘리는 부분도 없습니다. */}
            <img
              src={rightImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full scale-110 object-cover blur-2xl"
            />
            <img
              src={rightImage}
              alt={place.name}
              className="absolute inset-0 w-full h-full object-contain"
            />
          </>
        ) : null}

        {/* Top Close button on desktop */}
        <div className="relative z-10 hidden md:flex justify-end w-full">
          <button
            type="button"
            onClick={onClose}
            className="size-10 rounded-full flex items-center justify-center bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 cursor-pointer shadow-lg"
            aria-label={t("close")}
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
  const t = useTranslations("aiCourse");
  const locationText =
    place.location || (place.floor ? `${t("departmentStore")} ${place.floor}` : t("departmentStore"));

  // 매장 대표 사진 (DB place 테이블의 image_url / image / placeImg)
  const rightImage =
    place.placeImg ||
    place.image ||
    place.imageUrl ||
    place.heroImage ||
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop";

  // 매장 사진 (실제 다중 사진 데이터가 있을 때만 노출)
  const storeImages =
    place.brandImages ||
    place.galleryImages ||
    null;

  const storeDescription =
    place.longDesc ||
    place.desc ||
    place.description ||
    t("indoorStoreDescription", { location: locationText, name: place.name });

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
              {place.category ? getPlaceCategoryLabel(place.category, t) : t("store")}
              {place.floor ? ` · ${place.floor}` : ""}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="size-9 rounded-full flex items-center justify-center transition hover:bg-[#f0ecfa] text-[#6b6685] cursor-pointer md:hidden"
              aria-label={t("close")}
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
                  <span className="text-[#6b6685] font-semibold">
                    {getPlaceCategoryLabel(place.category, t)}
                  </span>
                </>
              ) : null}
            </div>
          </div>

          {/* 매장 안내 카드 */}
          <div className="mt-6 rounded-[22px] bg-[#faf8ff] border border-[#e0d9f8] p-5 shadow-xs">
            <div className="flex items-center gap-2 text-[16px] font-black text-[#5c2ef5] mb-2.5">
              <span>💡</span>
              <span>{t("storeGuide")}</span>
            </div>
            <p className="text-[17px] font-medium leading-[1.7] text-[#2d2745] break-keep">
              {storeDescription}
            </p>
          </div>

          {/* 매장 사진 (실제 다중 사진 데이터가 있을 때만 노출) */}
          {storeImages && storeImages.length > 0 ? (
            <div className="mt-6">
              <p className="text-[12px] font-bold tracking-wide text-[#9994ad] mb-3">
                {t("storePhotos")}
              </p>
              <div className="grid grid-cols-3 gap-3">
                {storeImages.slice(0, 3).map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-4/3 rounded-[14px] overflow-hidden bg-[#f0ecfa] border border-[#e0d9f8]/60 group shadow-xs"
                  >
                    <img
                      src={imgUrl}
                      alt={t("storePhotoAlt", { name: place.name, index: idx + 1 })}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = getFallbackPlaceImage(place);
                      }}
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

          {/* Bottom CTA Button (장소 추가 모달에서 열었을 때만 노출) */}
          {place.onAddPlace ? (
            <div className="mt-6 pt-2">
              <button
                type="button"
                onClick={() => {
                  place.onAddPlace();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-[20px] bg-[#5c2ef5] hover:bg-[#4d24d9] active:scale-[0.98] text-white text-[15px] font-black shadow-lg shadow-[#5c2ef5]/25 transition-all cursor-pointer"
              >
                <Plus size={17} strokeWidth={2.5} />
                <span>이 장소 코스에 추가하기</span>
              </button>
            </div>
          ) : null}
        </div>

      {/* Right Column: 매장 대표 사진 카드 (place 테이블의 image url 사용) */}
      <div className="relative min-h-[320px] md:min-h-[620px] bg-linear-to-br from-[#2d1b8e] to-[#8c57fa] overflow-hidden flex flex-col p-6 md:p-7">
        {/* Representative Photo */}
        {rightImage ? (
          <>
            {/* 원본 비율이 제각각입니다. 뉴스 컷은 세로/가로가 섞여 오고 매장
                사진도 규격이 없어서, object-cover로 채우면 인물 얼굴이 잘립니다.
                그렇다고 object-contain만 쓰면 위아래로 빈 띠가 남습니다.
                같은 사진을 크게 흐려서 배경으로 깔고 그 위에 원본을 비율 그대로
                얹으면, 프레임은 꽉 차면서 잘리는 부분도 없습니다. */}
            <img
              src={rightImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full scale-110 object-cover blur-2xl"
            />
            <img
              src={rightImage}
              alt={place.name}
              className="absolute inset-0 w-full h-full object-contain"
            />
          </>
        ) : null}

        {/* Top Close button on desktop */}
        <div className="relative z-10 hidden md:flex justify-end w-full">
          <button
            type="button"
            onClick={onClose}
            className="size-10 rounded-full flex items-center justify-center bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 cursor-pointer shadow-lg"
            aria-label={t("close")}
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 매장 상세 팝업 (장소 추가 목록 등에서 매장 클릭 시 뜨는 사진 포함 모달)
 */
function CompactPlaceModalContent({ place, onClose }) {
  const t = useTranslations("aiCourse");
  const locationText =
    place.location ||
    (place.floor ? `${t("departmentStore")} ${place.floor}` : t("departmentStore"));

  const placeImage =
    place.image ||
    place.imageUrl ||
    place.placeImg ||
    getFallbackPlaceImage(place);

  const descText =
    place.desc ||
    place.description ||
    t("compactStoreDescription", {
      location: locationText,
      name: place.name,
    }) ||
    `${place.floor ? `${place.floor} ` : ""}${place.name} · 실내 길찾기 지원 매장`.trim();

  return (
    <div
      className="relative w-full max-w-[460px] max-h-[90vh] rounded-[26px] overflow-hidden shadow-2xl bg-white flex flex-col animate-in zoom-in-95 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Banner Image with Clean Dark Overlay */}
      <div className="relative w-full h-[230px] sm:h-[260px] bg-gray-900 shrink-0 overflow-hidden">
        {/* Background Image */}
        <img
          src={placeImage}
          alt={place.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = getFallbackPlaceImage(place);
          }}
        />
        {/* Soft Dark Bottom Gradient */}
        <div
          className="absolute inset-x-0 bottom-0 h-[140px] pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
          }}
        />

        {/* Top Badges & Close Button */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center text-[11.5px] font-bold px-3 py-1 rounded-full bg-black/40 text-white backdrop-blur-md">
              {place.category ? getPlaceCategoryLabel(place.category, t) : t("store")}
            </span>
            {place.floor && (
              <span className="inline-flex items-center text-[11.5px] font-bold px-2.5 py-1 rounded-full bg-[#5c2ef5] text-white">
                {place.floor}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8.5 rounded-full flex items-center justify-center bg-black/40 text-white hover:bg-black/60 backdrop-blur-md transition-all cursor-pointer"
            aria-label={t("close")}
          >
            <X size={16} />
          </button>
        </div>

        {/* Bottom Title in Header */}
        <div className="absolute bottom-4 left-5 right-5 z-10">
          <h2 className="text-[22px] sm:text-[24px] font-black text-white tracking-tight drop-shadow-md">
            {place.name}
          </h2>
          <div className="flex items-center gap-1.5 text-white/90 text-[13px] font-medium mt-1">
            <MapPin size={13.5} className="shrink-0 text-white/80" />
            <span>{locationText}</span>
          </div>
        </div>
      </div>

      {/* Body Info - Clean, Minimalist & Modern */}
      <div className="p-5 sm:p-6 flex flex-col gap-4.5 overflow-y-auto min-h-0 bg-white">
        {/* Store Intro */}
        <div>
          <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            {t("storeIntro")}
          </h3>
          <p className="text-[14px] font-normal text-gray-700 leading-[1.65] break-keep">
            {descText}
          </p>
        </div>

        {/* Store Details Container */}
        <div className="rounded-2xl bg-[#f8f9fc] p-4 space-y-3">
          {/* Hours */}
          <div className="flex items-center justify-between text-[13px]">
            <div className="flex items-center gap-2 text-gray-500 font-medium">
              <Clock size={15} className="text-gray-400 shrink-0" />
              <span>{t("hours")}</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-gray-900">10:30 ~ 20:00</span>
              <span className="text-[11.5px] text-gray-400 font-normal ml-1.5">
                (금~일 ~20:30)
              </span>
            </div>
          </div>

          <div className="h-px bg-gray-200/60" />

          {/* Location */}
          <div className="flex items-center justify-between text-[13px]">
            <div className="flex items-center gap-2 text-gray-500 font-medium">
              <MapPin size={15} className="text-gray-400 shrink-0" />
              <span>{t("locationInfo")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-gray-900">
                더현대 서울 {place.floor || ""}
              </span>
              <span className="text-[11px] font-semibold text-[#5c2ef5] bg-[#5c2ef5]/8 px-2 py-0.5 rounded-md">
                3D 길찾기
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: [+ 이 장소 코스에 담기] */}
        {place.onAddPlace ? (
          <button
            type="button"
            onClick={() => {
              place.onAddPlace();
              onClose();
            }}
            className="w-full mt-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#5c2ef5] hover:bg-[#4d24d9] active:scale-[0.99] text-white text-[14.5px] font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>이 장소 코스에 추가하기</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}

/**
 * PlaceModal Entry Component
 * - 장소 추가 모달 및 코스 타임라인 전반에서 통일된 디또 시그니처 2컬럼 상세 모달 제공
 */
export function PlaceModal({ place, onClose }) {
  if (!place) return null;

  const isAiMode = Boolean(
    place.aiReason || place.isAiRecommended || place.isAiVersion,
  );

  const zIndexClass = place.modalMode === "compact" ? "z-[105]" : "z-[100]";

  return (
    <div
      className={`fixed inset-0 ${zIndexClass} flex items-center justify-center p-4 sm:p-5 animate-in fade-in duration-150`}
      style={{ backgroundColor: "rgba(10,8,20,0.72)", backdropFilter: "blur(8px)" }}
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
