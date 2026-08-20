"use client";

import { create } from "zustand";

const STORAGE_KEY = "ditto:community-post-images-v2";

function loadInitialPostImages() {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePostImages(imagesMap) {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(imagesMap);
    sessionStorage.setItem(STORAGE_KEY, serialized);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // If storage full, keep in sessionStorage only or ignore
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(imagesMap));
    } catch {
      // Ignore
    }
  }
}

export const useCommunityPostImagesStore = create((set, get) => ({
  postImages: loadInitialPostImages(), // { [postIdOrCourseId]: string[] }

  setPostImages: (id, images) => {
    if (!id) return;
    const list = Array.isArray(images) ? images : [images].filter(Boolean);
    set((state) => {
      const nextMap = {
        ...state.postImages,
        [String(id)]: list,
      };
      savePostImages(nextMap);
      return { postImages: nextMap };
    });
  },

  getPostImage: (id) => {
    if (!id) return null;
    const images = get().postImages[String(id)];
    return Array.isArray(images) && images.length > 0 ? images[0] : null;
  },

  getPostImages: (id) => {
    if (!id) return [];
    return get().postImages[String(id)] || [];
  },
}));
