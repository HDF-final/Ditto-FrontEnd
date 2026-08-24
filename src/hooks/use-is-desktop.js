"use client";

import { useSyncExternalStore } from "react";

const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribe(onStoreChange) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const media = window.matchMedia(DESKTOP_QUERY);
  if (!media) return () => {};

  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", onStoreChange);
    return () => media.removeEventListener("change", onStoreChange);
  }
  if (typeof media.addListener === "function") {
    media.addListener(onStoreChange);
    return () => media.removeListener(onStoreChange);
  }
  return () => {};
}

function getSnapshot() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return true;
  }
  return window.matchMedia(DESKTOP_QUERY)?.matches ?? true;
}

function getServerSnapshot() {
  return true;
}

export function useIsDesktop() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
