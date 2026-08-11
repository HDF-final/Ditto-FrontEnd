"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { PlaceThumbnail } from "./place-thumbnail";

// --- kind-based note / call-to-action -------------------------------------
function resolveKind(place) {
  if (place.kind) {
    return place.kind;
  }
  const category = place.category || "";
  if (/한식|음식|식당|카페|레스토랑|다이닝|맛집|디저트|푸드|미식/.test(category)) {
    return "food";
  }
  if (/팝업/.test(category)) {
    return "popup";
  }
  return "brand";
}

function kindContent(place) {
  const kind = resolveKind(place);
  const query = encodeURIComponent(place.name || "");
  if (kind === "food") {
    return {
      booking: true,
      note: "실시간 예약 · 대기 확인은 캐치테이블에서",
      cta: {
        label: "캐치테이블에서 예약",
        href: `https://app.catchtable.co.kr/?keyword=${query}`,
        external: true,
      },
    };
  }
  if (kind === "popup") {
    return {
      booking: false,
      note: "기간 한정 팝업 · 오픈 소식은 뉴스피드에서",
      cta: { label: "팝업 소식 보기", href: "/news", external: false },
    };
  }
  return {
    booking: false,
    note: "같은 제품군은 더현대닷컴에서",
    cta: {
      label: "더현대닷컴에서 더 보기",
      href: `https://www.thehyundai.com/front/dpo/hdSearch.thd?searchQuery=${query}`,
      external: true,
    },
  };
}

// --- small pieces ----------------------------------------------------------
function Star({ filled }) {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true">
      <path
        d="m12 17.3-6.16 3.7 1.64-7.03L2 9.24l7.19-.61L12 2l2.81 6.63 7.19.61-5.48 4.73 1.64 7.03z"
        fill={filled ? "#facc15" : "none"}
        stroke={filled ? "#facc15" : "rgba(255,255,255,0.5)"}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarRating({ rating }) {
  const rounded = Math.round(rating);
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} filled={n <= rounded} />
      ))}
    </span>
  );
}

function HeroCircleButton({ label, onClick, active, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={[
        "flex size-9 items-center justify-center rounded-full backdrop-blur-sm transition",
        active ? "bg-white/30" : "bg-white/20 hover:bg-white/30",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function InfoTiles({ place, accent }) {
  const tiles = [
    { label: "운영 시간", value: place.hours },
    { label: "가격대", value: place.price },
    { label: "위치", value: (place.location || "").split(" ").slice(-1)[0] },
  ];
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-2xl bg-surface-soft px-3.5 py-3">
          <p
            className="text-[10px] font-bold uppercase tracking-wide opacity-80"
            style={{ color: accent }}
          >
            {tile.label}
          </p>
          <p className="mt-1.5 text-[13px] font-semibold leading-tight text-ink">
            {tile.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function ProductGrid({ place, accent }) {
  const products = place.products || [];
  if (products.length === 0) {
    return null;
  }
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[13px] font-bold text-ink">
          인기 상품
          {place.productLine ? (
            <span className="ml-1 font-medium text-ink-muted">· {place.productLine}</span>
          ) : null}
        </p>
        <span className="text-[11px] font-medium" style={{ color: accent }}>
          전체 보기 →
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {products.map((item) => {
          const body = (
            <>
              <div className="relative aspect-square w-full overflow-hidden bg-surface-soft">
                <PlaceThumbnail src={item.image} alt={item.name} sizes="140px" iconClassName="size-6" />
                {item.badge ? (
                  <span
                    className="absolute left-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white"
                    style={{ backgroundColor: item.badgeColor || accent }}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <div className="px-2 py-2">
                <p className="line-clamp-2 text-[11px] font-semibold leading-tight text-ink">
                  {item.name}
                </p>
                <p className="mt-1 text-[12px] font-bold" style={{ color: accent }}>
                  {item.price}
                </p>
              </div>
            </>
          );
          const className =
            "flex flex-col overflow-hidden rounded-2xl border border-line bg-surface text-left shadow-sm transition hover:shadow-md";
          // href is filled from the DB later; link only when present.
          return item.href ? (
            <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
              {body}
            </a>
          ) : (
            <div key={item.name} className={className}>
              {body}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- main card -------------------------------------------------------------
export function PlaceDetail({ place, onClose, actions }) {
  const [liked, setLiked] = useState(false);
  const { booking, note, cta } = kindContent(place);
  const accent = place.accentColor || "#5c2ef5";
  const gradientFrom = place.gradientFrom || accent;
  const gradientTo = place.gradientTo || "#1a142e";
  const hasProducts = (place.products || []).length > 0;

  const ctaLabel = (
    <span className="flex items-center justify-center gap-2">
      {cta.label}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
        <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      </svg>
    </span>
  );
  const ctaStyle = {
    background: `linear-gradient(135deg, ${accent}, ${gradientTo === "#1a142e" ? `${accent}bb` : gradientTo})`,
    boxShadow: `0 8px 24px ${accent}55`,
  };
  const ctaClassName =
    "block w-full rounded-full py-4 text-center text-[15px] font-bold text-white transition active:scale-[0.98]";

  return (
    <div className="flex max-h-[88vh] w-full flex-col overflow-hidden rounded-[24px] bg-surface shadow-card">
      {/* Hero */}
      <div className="relative h-60 shrink-0 overflow-hidden sm:h-72">
        <PlaceThumbnail src={place.heroImage || place.image} alt={place.name} sizes="(max-width: 768px) 100vw, 768px" iconClassName="size-12" />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0) 30%, ${gradientFrom}cc 80%, ${gradientTo} 100%)`,
          }}
        />

        {/* top controls */}
        <div className="absolute inset-x-5 top-4 flex items-center justify-between">
          <span className="rounded-full border border-white/25 bg-white/20 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            {place.category}
          </span>
          <div className="flex items-center gap-2">
            <HeroCircleButton label="찜하기" active={liked} onClick={() => setLiked((v) => !v)}>
              <svg viewBox="0 0 24 24" fill={liked ? "#fb7185" : "none"} stroke={liked ? "#fb7185" : "white"} strokeWidth="2" className="size-4" aria-hidden="true">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1 1.1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </HeroCircleButton>
            <HeroCircleButton label="공유하기">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
              </svg>
            </HeroCircleButton>
            <HeroCircleButton label="닫기" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </HeroCircleButton>
          </div>
        </div>

        {/* title + rating */}
        <div className="absolute inset-x-0 bottom-0 px-7 pb-5">
          <h2 className="text-2xl font-bold leading-tight text-white drop-shadow-lg">
            {place.name}
          </h2>
          {place.rating ? (
            <div className="mt-2 flex items-center gap-1.5">
              <StarRating rating={place.rating} />
              <span className="text-xs font-semibold text-white">{place.rating}</span>
              {place.reviews ? (
                <span className="text-[11px] text-white/60">({place.reviews.toLocaleString()})</span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-5 px-7 py-6">
          <p className="text-sm leading-7 text-ink">{place.longDesc || place.description}</p>

          {hasProducts ? <ProductGrid place={place} accent={accent} /> : <InfoTiles place={place} accent={accent} />}

          {booking ? (
            <div className="flex items-center gap-2.5 rounded-2xl border border-line bg-surface-soft px-4 py-3">
              <span className="text-base">📅</span>
              <p className="text-xs leading-5 text-ink-muted">
                {note.split("캐치테이블")[0]}
                <span className="font-semibold text-brand">캐치테이블</span>
                {note.split("캐치테이블")[1]}
              </p>
            </div>
          ) : null}

          {cta.external ? (
            <a href={cta.href} target="_blank" rel="noopener noreferrer" className={ctaClassName} style={ctaStyle}>
              {ctaLabel}
            </a>
          ) : (
            <Link href={cta.href} className={ctaClassName} style={ctaStyle}>
              {ctaLabel}
            </Link>
          )}

          {actions}
        </div>
      </div>
    </div>
  );
}

// --- modal wrapper (blurred hero overlay) ---------------------------------
export function PlaceDetailModal({ open, place, onClose, actions }) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    function onKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !place) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(10,8,20,0.72)] p-5 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div role="dialog" aria-modal="true" aria-label={place.name} className="w-full max-w-2xl">
        <PlaceDetail place={place} onClose={onClose} actions={actions} />
      </div>
    </div>
  );
}
