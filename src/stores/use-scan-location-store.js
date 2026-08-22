"use client";

import { create } from "zustand";

const STORAGE_KEY = "ditto-scan-location";

function readStoredLocation() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredLocation(location) {
  if (typeof window === "undefined") return;
  try {
    if (location) {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(location));
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // quota / private mode — 메모리만 유지
  }
}

/**
 * OCR 로고 스캔으로 잡은 "지금 내 위치".
 *
 * 코스 추천 출발·도착 핀과 섞지 않고, 실내 지도에 별도의 내 위치 핑으로만
 * 올립니다. 탭 스캔 → 지도 페이지 이동을 위해 sessionStorage 에만 잠시 둡니다.
 */
export const useScanLocationStore = create((set) => ({
  location: null,
  hydrated: false,
  hydrate: () =>
    set((state) =>
      state.hydrated
        ? state
        : { location: readStoredLocation(), hydrated: true },
    ),
  setLocation: (location) => {
    writeStoredLocation(location);
    set({ location, hydrated: true });
  },
  clearLocation: () => {
    writeStoredLocation(null);
    set({ location: null, hydrated: true });
  },
}));
