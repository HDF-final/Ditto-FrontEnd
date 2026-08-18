"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";

const tabs = ["인기순", "최신순", "팔로잉", "내 타입"];
const storageKey = "ditto:shared-community-courses";

function subscribe(callback) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  if (typeof window === "undefined") return "[]";
  return localStorage.getItem(storageKey) || "[]";
}

function getServerSnapshot() {
  return "[]";
}

function CommunityCard({ card, rank }) {
  const href = `/community/${card.postId || card.slug || "1"}`;

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-[28px] bg-white shadow-[0_10px_24px_rgba(43,28,89,0.08)] transition duration-200 hover:-translate-y-1.5 hover:shadow-[0_18px_32px_rgba(43,28,89,0.14)]"
    >
      <div
        className={`flex h-[158px] bg-linear-to-br ${card.gradient || "from-[#2d1b8e] to-[#8c57fa]"} px-6 py-7 transition duration-300 group-hover:brightness-105`}
      >
        <span className="text-xs font-black text-white">DITTO COURSE</span>
      </div>
      <div className="px-5 pb-6 pt-7">
        <div className="flex items-center gap-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-black text-white">
            {rank}
          </span>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-black text-brand">
            {card.country || "KR"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-black leading-none text-ink">
              {card.name || "여행자"}
            </p>
            <p className="mt-1 truncate text-[11px] font-black leading-none text-brand">
              {card.hash || "#공개코스"}
            </p>
          </div>
        </div>
        <h2 className="mt-7 min-h-[58px] text-[23px] font-black leading-tight text-ink group-hover:text-brand transition-colors">
          {card.title}
        </h2>
        <div className="mt-5 h-px bg-line" />
        <div className="mt-4 flex items-center justify-between text-xs font-medium text-ink-muted">
          <span>♥ {card.likes ?? 0}</span>
          <span>☷ {card.comments ?? 0}</span>
          <span>📌 {card.saves ?? 0}</span>
        </div>
      </div>
    </Link>
  );
}

export function CommunityCoursePage({ initialCards = [] }) {
  const [activeTab, setActiveTab] = useState("인기순");
  const sharedCardsRaw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const sharedCards = useMemo(() => {
    try {
      const parsed = JSON.parse(sharedCardsRaw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [sharedCardsRaw]);

  const cards = useMemo(() => {
    const combined = [...initialCards, ...sharedCards];

    if (activeTab === "인기순") {
      return [...combined].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    }
    if (activeTab === "최신순") {
      return [...combined].sort((a, b) => (b.postId ?? 0) - (a.postId ?? 0));
    }
    if (activeTab === "팔로잉") {
      return combined.filter((c) => c.isRealDb || c.country === "JP" || c.country === "US");
    }
    if (activeTab === "내 타입") {
      return combined.filter((c) => c.country === "KR" || c.isRealDb);
    }
    return combined;
  }, [initialCards, sharedCards, activeTab]);

  const shouldScroll = cards.length > 8;

  return (
    <main className="bg-background">
      <section className="bg-white px-10 sm:px-14 pb-16 pt-[94px] lg:px-52 xl:px-60 2xl:px-72">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black text-brand">
              THE HYUNDAI SEOUL COMMUNITY
            </p>
            <h1 className="mt-6 text-[34px] font-black leading-none text-ink lg:text-[36px]">
              더현대 코스
            </h1>
            <p className="mt-5 text-sm font-medium text-ink-muted">
              더현대 서울에서 직접 돈 코스를 공유하고, 여행자들이 남긴 장소와
              대화를 확인해보세요.
            </p>
            <div className="mt-6 flex gap-10 border-b border-line">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`-mb-px border-b-2 pb-3 text-sm font-black transition cursor-pointer ${
                    activeTab === tab
                      ? "border-brand text-brand"
                      : "border-transparent text-ink-muted hover:text-ink"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <Link
            href="/community/share"
            className="inline-flex w-fit items-center justify-center rounded-full bg-brand px-8 py-4 text-sm font-black text-white shadow-control transition hover:bg-brand-dark"
          >
            내 코스 공유하기 →
          </Link>
        </div>
      </section>

      <section className="bg-surface-soft px-10 sm:px-14 py-[58px] lg:px-52 xl:px-60 2xl:px-72">
        <div
          className={
            shouldScroll
              ? "max-h-[770px] overflow-y-auto overscroll-contain pr-1"
              : ""
          }
        >
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card, index) => (
              <CommunityCard
                key={`${card.postId || card.name}-${card.title}-${index}`}
                card={card}
                rank={index + 1}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
