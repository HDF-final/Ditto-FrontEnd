"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  X,
  MapPin,
  Plus,
  Clock,
} from "./recommend-icons";
import {
  attachPlaceIdsToCourseDataset,
  calculateCourseRoute,
  getFallbackPlaceImage,
  loadCourseRoutingDataset,
} from "@/lib/navigation/course-routing-service";
import { getPlaceCategoryLabel } from "@/lib/navigation/place-category";
import { getNavigablePlaces } from "@/lib/api/place-navigation";
import { getAiPlaceProductImages } from "@/lib/api/ai-course";
import { CourseNavigationMap } from "@/components/navigation/course-navigation-map";

function getProductNavigationKey(place) {
  return place?.navigationKey || place?.navigation_key;
}

function usePlaceProducts(navigationKey, limit = 3) {
  const [productResult, setProductResult] = useState({
    navigationKey: null,
    products: [],
  });

  useEffect(() => {
    if (!navigationKey) return undefined;

    const controller = new AbortController();
    getAiPlaceProductImages(navigationKey, {
      limit,
      signal: controller.signal,
    })
      .then((products) => {
        setProductResult({
          navigationKey,
          products: products.filter((product) => product?.imageUrl),
        });
      })
      .catch((error) => {
        if (error?.code === "ERR_CANCELED") return;
        setProductResult({
          navigationKey,
          products: [],
        });
      });

    return () => controller.abort();
  }, [limit, navigationKey]);

  const isLoading =
    Boolean(navigationKey) && productResult.navigationKey !== navigationKey;

  return isLoading ? [] : productResult.products;
}

function BrandProductsGrid({ products, place, t, className = "mt-6" }) {
  if (!products.length) return null;

  const theHyLogoAlt = t.has("theHyLogoAlt") ? t("theHyLogoAlt") : "더현대Hi";
  const label = t.has("brandProducts")
    ? t("brandProducts")
    : "더현대Hi 상품 바로가기";
  const hint = t.has("brandProductsHint")
    ? t("brandProductsHint")
    : "상품을 누르면 더현대Hi 상품 페이지로 이동해요.";
  const getAlt = (product, idx) => {
    const name = product.productName || place.name;
    if (t.has("brandProductAlt")) {
      return t("brandProductAlt", {
        name,
        index: idx + 1,
      });
    }
    return `${name} 상품 ${idx + 1}`;
  };

  return (
      <div className={className}>
      <div className="mb-4">
        <div className="flex items-start gap-2">
          <div className="inline-flex h-9 items-center rounded-full border border-[#eee8ff] bg-white px-3.5 shadow-[0_8px_18px_rgba(92,46,245,0.08)]">
            <img
              src="/assets/common/thehy-app-logo.png"
              alt={theHyLogoAlt}
              className="h-4 w-auto object-contain"
            />
          </div>
          <div className="pt-0.5">
            <p className="text-[14px] font-black tracking-tight text-[#5c2ef5]">
              {label}
            </p>
            <p className="mt-1.5 text-[11px] font-semibold leading-snug text-[#9994ad]">
              {hint}
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {products.map((product, idx) => {
          const productImage = (
            <>
              <img
                src={product.imageUrl}
                alt={getAlt(product, idx)}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = getFallbackPlaceImage(place);
                }}
              />
              <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent" />
            </>
          );

          const itemClassName =
            "group relative aspect-4/3 overflow-hidden rounded-[14px] border border-[#e0d9f8]/60 bg-[#f0ecfa] shadow-xs outline-none transition focus-visible:ring-2 focus-visible:ring-[#5c2ef5]";

          return product.productUrl ? (
            <a
              key={product.productId ?? `${product.imageUrl}-${idx}`}
              href={product.productUrl}
              target="_blank"
              rel="noreferrer"
              className={itemClassName}
              aria-label={getAlt(product, idx)}
              title={product.productName || product.brandName || place.name}
            >
              {productImage}
            </a>
          ) : (
            <div
              key={product.productId ?? `${product.imageUrl}-${idx}`}
              className={itemClassName}
              title={product.productName || product.brandName || place.name}
            >
              {productImage}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 돋보기 아이콘 (사진 확대 힌트) */
function ZoomIcon({ size = 14, className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

/** 사진 전체화면 라이트박스 (뉴스피드와 동일한 확대 보기) */
function PlaceImageLightbox({ src, alt = "", caption = "", closeLabel = "닫기", onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!src) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-[160] flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-200 sm:p-8"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute right-5 top-5 z-20 flex size-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:scale-105 hover:bg-white/30 cursor-pointer shadow-lg"
        aria-label={closeLabel}
      >
        <X size={22} />
      </button>

      <div
        className="relative flex max-h-[90vh] max-w-[92vw] flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-h-[82vh] max-w-[92vw] rounded-[20px] object-contain shadow-2xl ring-1 ring-white/20"
        />
        {alt || caption ? (
          <div className="mt-3.5 flex max-w-2xl flex-col items-center px-4 text-center">
            {alt ? (
              <p className="text-sm font-bold text-white/95 drop-shadow-sm">{alt}</p>
            ) : null}
            {caption ? <p className="mt-1 text-xs text-white/70">{caption}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * AI 추천 장소 전용 상세 모달 (스케치 반영: 2컬럼 레이아웃)
 * - 좌측: 브랜드명, 브랜드 위치, AI 추천 이유, 매장 사진 갤러리 (3장), 방문 CTA
 * - 우측: 연예인 / 앰버서더 / K-컬처 비주얼 사진 및 캡션
 */
function AiPlaceModalContent({ place, onClose }) {
  const t = useTranslations("aiCourse");
  const productNavigationKey = getProductNavigationKey(place);
  const brandProducts = usePlaceProducts(productNavigationKey, 3);
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

  const rightImageCaption =
    rightImage && rightImage === place.aiImage ? place.aiImageCaption : null;

  const boniReasonLabel = t.has("boniReason") ? t("boniReason") : "보니 추천 이유";
  const viewLargePhotoLabel = t.has("viewLargePhoto") ? t("viewLargePhoto") : "사진 크게 보기";
  const [isPhotoZoomOpen, setIsPhotoZoomOpen] = useState(false);

  return (
    <>
    <div
      className="relative flex max-h-[72dvh] w-full max-w-[960px] flex-col overflow-hidden rounded-t-[24px] bg-white shadow-[0_36px_90px_rgba(0,0,0,0.5)] sm:max-h-[calc(100dvh-1.25rem)] sm:rounded-[24px] md:grid md:min-h-[620px] md:max-h-[720px] md:grid-cols-[0.88fr_1.12fr] md:rounded-[32px]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Mobile Top-Right Close Button (Always Pinned & Visible) */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3.5 top-3.5 z-30 flex size-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80 cursor-pointer shadow-md md:hidden"
        aria-label={t("close")}
      >
        <X size={18} />
      </button>

      {/* Main Scrollable Content Area */}
      <div className="flex flex-1 min-h-0 flex-col overflow-y-auto overscroll-contain bg-white">
        {/* Mobile Header Photo Banner */}
        {rightImage ? (
          <div className="relative h-[180px] w-full shrink-0 overflow-hidden bg-neutral-950 md:hidden">
            <img
              src={rightImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 size-full object-cover blur-lg scale-110 opacity-50"
            />
            <img
              src={rightImage}
              alt={place.name}
              className="absolute inset-0 size-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/30" />
            <button
              type="button"
              onClick={() => setIsPhotoZoomOpen(true)}
              aria-label={viewLargePhotoLabel}
              className="absolute inset-0 z-[5] cursor-zoom-in outline-none"
            />
            <span className="pointer-events-none absolute left-3.5 top-3.5 z-[6] inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-xs">
              <ZoomIcon size={12} />
              {viewLargePhotoLabel}
            </span>
            <div className="absolute bottom-3 left-4 z-[6] flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5c2ef5] px-3 py-1 text-[11px] font-black text-white shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                {place.category ? getPlaceCategoryLabel(place.category, t) : t("categoryDittoPick")}
              </span>
              {place.floor && (
                <span className="rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-xs">
                  {place.floor}
                </span>
              )}
            </div>
            {rightImageCaption && (
              <div className="absolute bottom-3 right-4">
                <p className="rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-xs">
                  {rightImageCaption}
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* Text Details Body */}
        <div className="flex flex-col justify-between gap-5 p-4 sm:p-6 md:p-8">
          <div>
            {/* Desktop Top Category Badge */}
            <div className="hidden md:flex items-center justify-between gap-3 mb-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5c2ef5] px-3.5 py-1.5 text-[12px] font-black text-white shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                {place.category ? getPlaceCategoryLabel(place.category, t) : t("categoryDittoPick")}
              </span>
            </div>

            {/* Mobile Badge if no image */}
            {!rightImage && (
              <div className="flex items-center justify-between gap-3 mb-4 md:hidden">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5c2ef5] px-3.5 py-1.5 text-[12px] font-black text-white shadow-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  {place.category ? getPlaceCategoryLabel(place.category, t) : t("categoryDittoPick")}
                </span>
              </div>
            )}

            {/* 매장명 */}
            <div>
              <h2 className="text-xl font-black leading-snug tracking-tight break-keep text-[#1a142e] sm:text-2xl md:text-[30px]">
                {place.name}
              </h2>
              {/* 매장 위치 */}
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-bold text-[#5c2ef5]">
                <MapPin size={15} className="shrink-0" />
                <span className="min-w-0 break-keep">{locationText}</span>
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

            {/* AI 추천 이유 카드 */}
            <div className="mt-5 rounded-[22px] bg-[#faf8ff] border border-[#e0d9f8] p-4.5 sm:p-5 shadow-xs">
              <div className="flex items-center gap-2 text-[15px] sm:text-[16px] font-black text-[#5c2ef5] mb-2">
                <span>✨</span>
                <span>{boniReasonLabel}</span>
              </div>
              <p className="text-[15px] sm:text-[17px] font-medium leading-[1.65] text-[#2d2745] break-keep">
                {aiReasonText}
              </p>
            </div>

            {/* 브랜드 상품 이미지 */}
            <BrandProductsGrid products={brandProducts} place={place} t={t} />
          </div>

          {/* Bottom CTA Button (장소 추가 모달에서 열었을 때만 노출) */}
          {place.onAddPlace ? (
            <div className="mt-4 pt-2">
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
      </div>

      {/* Desktop Right Column: 연예인/앰버서더 비주얼 사진 카드 */}
      <div className="relative hidden md:flex h-full min-h-[620px] flex-col overflow-hidden bg-neutral-950 p-7">
        {rightImage ? (
          <>
            <img
              src={rightImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full scale-105 object-cover blur-md opacity-35"
            />
            <img
              src={rightImage}
              alt={place.name}
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
            <button
              type="button"
              onClick={() => setIsPhotoZoomOpen(true)}
              aria-label={viewLargePhotoLabel}
              className="group absolute inset-0 z-[5] cursor-zoom-in outline-none"
            >
              <span className="absolute left-6 top-6 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-[11px] font-bold text-white opacity-0 backdrop-blur-md transition duration-200 group-hover:opacity-100">
                <ZoomIcon size={13} />
                {viewLargePhotoLabel}
              </span>
            </button>
          </>
        ) : null}

        {/* Top Close button on desktop */}
        <div className="relative z-10 flex justify-end w-full">
          <button
            type="button"
            onClick={onClose}
            className="size-10 rounded-full flex items-center justify-center bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 cursor-pointer shadow-lg"
            aria-label={t("close")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Bottom Caption for Representative Photo */}
        {rightImageCaption ? (
          <div className="relative z-10 mt-auto">
            <p className="inline-block rounded-full bg-black/50 px-3.5 py-1.5 text-[12px] font-semibold text-white/95 backdrop-blur-md">
              {rightImageCaption}
            </p>
          </div>
        ) : null}
      </div>
    </div>
    {isPhotoZoomOpen ? (
      <PlaceImageLightbox
        src={rightImage}
        alt={place.name}
        caption={rightImageCaption || ""}
        closeLabel={t("close")}
        onClose={() => setIsPhotoZoomOpen(false)}
      />
    ) : null}
    </>
  );
}

/**
 * 일반 매장 상세 모달 (2컬럼 레이아웃: 좌측 매장 사진 및 매장 안내, 우측 실내 3D 층별 지도)
 */
function StandardPlaceModalContent({ place, onClose }) {
  const t = useTranslations("aiCourse");
  const productNavigationKey = getProductNavigationKey(place);
  const brandProducts = usePlaceProducts(productNavigationKey, 3);
  const [routeState, setRouteState] = useState({
    status: "loading",
    itinerary: null,
    graph: null,
    floors: [],
  });

  const locationText =
    place.location || (place.floor ? `${t("departmentStore")} ${place.floor}` : t("departmentStore"));

  // 매장 대표 사진 (DB place 테이블의 image_url / image / placeImg)
  const storeImage =
    place.placeImg ||
    place.image ||
    place.imageUrl ||
    place.heroImage ||
    getFallbackPlaceImage(place);

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

  const showPhotoPanel = !place.isNewsModal && place.showPhotoPanel !== false;

  // 뉴스 피드/모달에서 띄운 경우에만 층별 선택 UI 숨김
  const showFloorSelector =
    place.showFloorSelector !== false && !place.hideFloorSelector && !place.isNewsModal;

  useEffect(() => {
    if (showPhotoPanel) return undefined;

    let active = true;

    async function loadPlaceRoute() {
      try {
        const [dataset, navigationPlaces] = await Promise.all([
          loadCourseRoutingDataset(),
          getNavigablePlaces().catch(() => []),
        ]);

        if (!active) return;

        const hydratedDataset = attachPlaceIdsToCourseDataset(
          dataset,
          navigationPlaces || [],
        );
        const placeCatalog = hydratedDataset.places;

        let catalogPlace = placeCatalog.find(
          (candidate) =>
            (place.navigationKey && candidate.navigationKey === place.navigationKey) ||
            (place.placeId && Number(candidate.placeId) === Number(place.placeId)) ||
            (place.name &&
              candidate.name?.trim().toLowerCase() ===
                place.name?.trim().toLowerCase()) ||
            (place.name &&
              candidate.name?.replace(/\s+/g, "").toLowerCase() ===
                place.name?.replace(/\s+/g, "").toLowerCase()) ||
            (place.place_name &&
              candidate.name?.trim().toLowerCase() ===
                place.place_name?.trim().toLowerCase()),
        );

        if (!catalogPlace && place.floor) {
          const normalizedFloor = place.floor.replace(/[^0-9BF]/gi, "").toUpperCase();
          catalogPlace = placeCatalog.find(
            (p) => p.floor === normalizedFloor || p.floor === place.floor,
          );
        }

        if (!catalogPlace) {
          catalogPlace = placeCatalog[0];
        }

        const targetPlace = {
          ...catalogPlace,
          ...place,
          id: catalogPlace?.id || place.placeId || place.navigationKey || "target-place",
          placeId: catalogPlace?.placeId || place.placeId,
          navigationKey: catalogPlace?.navigationKey || place.navigationKey,
          floor: catalogPlace?.floor || place.floor || place.floorCode || "1F",
        };

        const route = await calculateCourseRoute([targetPlace], {
          excludeElevator: false,
          excludeEscalator: false,
        });

        if (!active) return;
        setRouteState({
          status: route.itinerary ? "ready" : "unavailable",
          ...route,
        });
      } catch {
        if (active) {
          setRouteState({
            status: "error",
            itinerary: null,
            graph: null,
            floors: [],
          });
        }
      }
    }

    loadPlaceRoute();

    return () => {
      active = false;
    };
  }, [place, showPhotoPanel]);

  return (
    <div
      className="relative flex max-h-[88dvh] w-full max-w-[1060px] flex-col overflow-y-auto rounded-t-[22px] bg-white shadow-[0_36px_90px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200 sm:max-h-[720px] sm:rounded-[32px] md:h-[640px] md:flex-row md:overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Left Column: 매장 정보, 컴팩트한 매장 사진, 매장 안내 */}
      <div className="w-full shrink-0 border-b border-line/60 bg-white p-4 sm:p-6 md:h-full md:w-[440px] md:min-w-[400px] md:max-w-[460px] md:overflow-y-auto md:border-b-0 md:border-r">
        <div>
          {/* Top Bar: Category Badge & Mobile Close */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5c2ef5] px-3 py-1 text-[11px] font-black text-white shadow-xs">
              {place.category ? getPlaceCategoryLabel(place.category, t) : t("store")}
              {place.floor ? ` · ${place.floor}` : ""}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="size-8 rounded-full flex items-center justify-center transition hover:bg-[#f0ecfa] text-[#6b6685] cursor-pointer md:hidden"
              aria-label={t("close")}
            >
              <X size={16} />
            </button>
          </div>

          {/* 매장명 */}
          <div>
            <h2 className="text-xl font-black leading-snug tracking-tight break-keep text-[#1a142e] sm:text-2xl">
              {place.name}
            </h2>
            {/* 매장 위치 */}
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] font-bold text-[#5c2ef5]">
              <MapPin size={14} className="shrink-0" />
              <span className="min-w-0 break-keep">{locationText}</span>
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

          {place.isNewsModal && storeImage ? (
            <div className="mt-3 relative w-full h-[210px] sm:h-[230px] rounded-[16px] overflow-hidden bg-[#f0ecfa] border border-[#e0d9f8]/60 shadow-xs shrink-0">
              <img
                src={storeImage}
                alt={place.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = getFallbackPlaceImage(place);
                }}
              />
            </div>
          ) : null}

          {/* 매장 안내 카드 */}
          <div className="mt-7 rounded-[18px] bg-[#faf8ff] border border-[#e0d9f8] p-4 shadow-xs sm:mt-8">
            <div className="flex items-center gap-1.5 text-[14px] font-black text-[#5c2ef5] mb-1.5">
              <span>✨</span>
              <span>{t("storeGuide")}</span>
            </div>
            <p className="text-[13px] sm:text-[14px] font-medium leading-[1.65] text-[#2d2745] break-keep">
              {storeDescription}
            </p>
          </div>

          <BrandProductsGrid
            products={brandProducts}
            place={place}
            t={t}
            className="mt-7 pb-2 sm:mt-8"
          />

          {/* 매장 사진 (실제 다중 사진 데이터가 있을 때만 노출) */}
          {storeImages && storeImages.length > 0 ? (
            <div className="mt-3">
              <p className="text-[11px] font-bold tracking-wide text-[#9994ad] mb-2">
                {t("storePhotos")}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {storeImages.slice(0, 3).map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-4/3 rounded-[10px] overflow-hidden bg-[#f0ecfa] border border-[#e0d9f8]/60 group shadow-xs"
                  >
                    <img
                      src={imgUrl}
                      alt={t("storePhotoAlt", { name: place.name, index: idx + 1 })}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = getFallbackPlaceImage(place);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Bottom CTA Button (장소 추가 모달에서 열었을 때만 노출) */}
        {place.onAddPlace ? (
          <div className="mt-3 pt-1">
            <button
              type="button"
              onClick={() => {
                place.onAddPlace();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-[16px] bg-[#5c2ef5] hover:bg-[#4d24d9] active:scale-[0.98] text-white text-[14px] font-black shadow-lg shadow-[#5c2ef5]/25 transition-all cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>이 장소 코스에 추가하기</span>
            </button>
          </div>
        ) : null}
      </div>

      {/* Right Column: 수동 추가 장소는 매장 사진, 뉴스피드는 기존 지도 유지 */}
      <div className="relative min-h-[320px] w-full shrink-0 overflow-hidden bg-[#F7F3EF] sm:min-h-[380px] md:h-full md:min-h-0 md:flex-1">
        {/* Top Close button on desktop */}
        <div className="absolute right-4 top-4 z-20 hidden md:block">
          <button
            type="button"
            onClick={onClose}
            className="size-10 rounded-full flex items-center justify-center bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70 cursor-pointer shadow-lg"
            aria-label={t("close")}
          >
            <X size={18} />
          </button>
        </div>

        {showPhotoPanel ? (
          <>
            <img
              src={storeImage}
              alt={place.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = getFallbackPlaceImage(place);
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
              <span className="mb-3 inline-flex items-center rounded-full bg-black/40 px-3 py-1 text-[11px] font-black backdrop-blur-md">
                {place.floor || locationText}
              </span>
              <h3 className="text-2xl font-black leading-tight break-keep sm:text-3xl">
                {place.name}
              </h3>
              {storeImages && storeImages.length > 0 ? (
                <div className="mt-4 flex gap-2">
                  {storeImages.slice(0, 3).map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative size-14 overflow-hidden rounded-[12px] border border-white/30 bg-white/15 shadow-lg sm:size-16"
                    >
                      <img
                        src={imgUrl}
                        alt={t("storePhotoAlt", { name: place.name, index: idx + 1 })}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = getFallbackPlaceImage(place);
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <CourseNavigationMap
            route={routeState.itinerary}
            routeFloorIds={routeState.itinerary?.floorIds || routeState.floors}
            routeGraph={routeState.graph}
            className="h-full w-full"
            showFloorSelector={showFloorSelector}
            showControls={true}
            showUserLocation={false}
          />
        )}
      </div>
    </div>
  );
}

/**
 * 매장 상세 팝업 (장소 추가 목록 등에서 매장 클릭 시 뜨는 사진 포함 모달)
 */
function CompactPlaceModalContent({ place, onClose }) {
  const t = useTranslations("aiCourse");
  const fallbackImage = getFallbackPlaceImage(place);
  const locationText =
    place.location || (place.floor ? `${t("departmentStore")} ${place.floor}` : t("departmentStore"));

  return (
    <div
      className="relative flex w-full max-w-[420px] flex-col overflow-hidden rounded-[26px] bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.35)] animate-in zoom-in-95 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header Image */}
      <div className="relative aspect-16/10 w-full overflow-hidden rounded-[18px] bg-surface-soft">
        <img
          src={place.image || place.imageUrl || fallbackImage}
          alt={place.name}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-xs transition hover:bg-black/70 cursor-pointer"
          aria-label={t("close")}
        >
          <X size={15} />
        </button>
        <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-xs">
          {place.floor || "1F"} · {place.category ? getPlaceCategoryLabel(place.category, t) : t("store")}
        </span>
      </div>

      {/* Info Body */}
      <div className="mt-4 flex flex-col gap-2">
        <h3 className="text-[20px] font-black text-ink">{place.name}</h3>
        <p className="text-xs font-bold text-brand flex items-center gap-1">
          <MapPin size={13} />
          {locationText}
        </p>
        <p className="text-[13px] font-medium leading-relaxed text-ink-muted break-keep">
          {place.description || place.desc || t("indoorStoreDescription", { location: locationText, name: place.name })}
        </p>
      </div>

      {/* Bottom CTA Button */}
      {place.onAddPlace ? (
        <button
          type="button"
          onClick={() => {
            place.onAddPlace();
            onClose();
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[16px] bg-[#5c2ef5] py-3.5 text-sm font-black text-white shadow-md shadow-[#5c2ef5]/25 transition hover:bg-[#4d24d9] active:scale-[0.98] cursor-pointer"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>이 장소 코스에 추가하기</span>
        </button>
      ) : null}
    </div>
  );
}

/**
 * PlaceModal Entry Component
 */
export function PlaceModal({ place, onClose }) {
  if (!place) return null;

  const isAiMode = Boolean(
    place.aiReason || place.isAiRecommended || place.isAiVersion,
  );

  const zIndexClass = place.modalMode === "compact" ? "z-[105]" : "z-[100]";

  return (
    <div
      className={`fixed inset-0 ${zIndexClass} flex items-end justify-center p-0 sm:items-center sm:p-5 animate-in fade-in duration-150`}
      style={{ backgroundColor: "rgba(10,8,20,0.72)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      {place.modalMode === "compact" ? (
        <CompactPlaceModalContent place={place} onClose={onClose} />
      ) : isAiMode ? (
        <AiPlaceModalContent place={place} onClose={onClose} />
      ) : (
        <StandardPlaceModalContent place={place} onClose={onClose} />
      )}
    </div>
  );
}
