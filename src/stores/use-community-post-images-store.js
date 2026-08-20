"use client";

import { create } from "zustand";

// Clean up any previously bloated localStorage key to free browser quota
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("ditto:community-post-images");
  } catch {
    // Ignore storage clearance errors
  }
}

export const useCommunityPostImagesStore = create((set, get) => ({
  postImages: {}, // { [postIdOrCourseId]: string[] }

  setPostImages: (id, images) => {
    if (!id) return;
    const list = Array.isArray(images) ? images : [images].filter(Boolean);
    set((state) => ({
      postImages: {
        ...state.postImages,
        [String(id)]: list,
      },
    }));
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
