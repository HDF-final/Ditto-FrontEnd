"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCommunityPostImagesStore = create(
  persist(
    (set, get) => ({
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
    }),
    {
      name: "ditto:community-post-images",
    },
  ),
);
