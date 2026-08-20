"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCommunityInteractionsStore = create(
  persist(
    (set, get) => ({
      likedPosts: {}, // { [identifier]: true }
      bookmarkedPosts: {}, // { [identifier]: true }
      likesDelta: {}, // { [identifier]: delta }

      isLiked: (identifier) => {
        if (!identifier) return false;
        return Boolean(get().likedPosts[String(identifier)]);
      },

      isBookmarked: (identifier) => {
        if (!identifier) return false;
        return Boolean(get().bookmarkedPosts[String(identifier)]);
      },

      getLikesDelta: (identifier) => {
        if (!identifier) return 0;
        return get().likesDelta[String(identifier)] || 0;
      },

      setLiked: (identifier, value) => {
        if (!identifier) return;
        const key = String(identifier);
        set((state) => ({
          likedPosts: {
            ...state.likedPosts,
            [key]: Boolean(value),
          },
          likesDelta: {
            ...state.likesDelta,
            [key]: value ? 1 : 0,
          },
        }));
      },

      setBookmarked: (identifier, value) => {
        if (!identifier) return;
        const key = String(identifier);
        set((state) => ({
          bookmarkedPosts: {
            ...state.bookmarkedPosts,
            [key]: Boolean(value),
          },
        }));
      },
    }),
    {
      name: "ditto:community-interactions",
    },
  ),
);
