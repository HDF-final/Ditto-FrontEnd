"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCommunityInteractionsStore = create(
  persist(
    (set, get) => ({
      likedPosts: {}, // { [identifier]: true }
      likedAtMap: {}, // { [identifier]: timestamp }
      bookmarkedPosts: {}, // { [identifier]: true }
      bookmarkedAtMap: {}, // { [identifier]: timestamp }
      likesDelta: {}, // { [identifier]: delta }
      savesDelta: {}, // { [identifier]: delta }

      isLiked: (id1, id2) => {
        const state = get();
        const k1 = id1 ? String(id1) : "";
        const k2 = id2 ? String(id2) : "";
        return Boolean((k1 && state.likedPosts[k1]) || (k2 && state.likedPosts[k2]));
      },

      isBookmarked: (id1, id2) => {
        const state = get();
        const k1 = id1 ? String(id1) : "";
        const k2 = id2 ? String(id2) : "";
        return Boolean((k1 && state.bookmarkedPosts[k1]) || (k2 && state.bookmarkedPosts[k2]));
      },

      getLikedAt: (id1, id2) => {
        const state = get();
        const k1 = id1 ? String(id1) : "";
        const k2 = id2 ? String(id2) : "";
        return (k1 && state.likedAtMap?.[k1]) || (k2 && state.likedAtMap?.[k2]) || 0;
      },

      getBookmarkedAt: (id1, id2) => {
        const state = get();
        const k1 = id1 ? String(id1) : "";
        const k2 = id2 ? String(id2) : "";
        return (k1 && state.bookmarkedAtMap?.[k1]) || (k2 && state.bookmarkedAtMap?.[k2]) || 0;
      },

      getLikesDelta: (id1, id2) => {
        const state = get();
        const k1 = id1 ? String(id1) : "";
        const k2 = id2 ? String(id2) : "";
        return (k1 && state.likesDelta?.[k1]) || (k2 && state.likesDelta?.[k2]) || 0;
      },

      getSavesDelta: (id1, id2) => {
        const state = get();
        const k1 = id1 ? String(id1) : "";
        const k2 = id2 ? String(id2) : "";
        return (k1 && state.savesDelta?.[k1]) || (k2 && state.savesDelta?.[k2]) || 0;
      },

      setLiked: (id1, value, id2) => {
        if (!id1 && !id2) return;
        const k1 = id1 ? String(id1) : "";
        const k2 = id2 ? String(id2) : "";
        const now = Date.now();
        const boolVal = Boolean(value);

        set((state) => {
          const nextLiked = { ...state.likedPosts };
          const nextLikedAt = { ...state.likedAtMap };
          const nextDelta = { ...state.likesDelta };

          if (k1) {
            nextLiked[k1] = boolVal;
            nextLikedAt[k1] = boolVal ? (nextLikedAt[k1] || now) : 0;
            nextDelta[k1] = boolVal ? 1 : -1;
          }
          if (k2 && k2 !== k1) {
            nextLiked[k2] = boolVal;
            nextLikedAt[k2] = boolVal ? (nextLikedAt[k2] || now) : 0;
            nextDelta[k2] = boolVal ? 1 : -1;
          }

          return {
            likedPosts: nextLiked,
            likedAtMap: nextLikedAt,
            likesDelta: nextDelta,
          };
        });
      },

      clearLikesDelta: (id1, id2) => {
        if (!id1 && !id2) return;
        const k1 = id1 ? String(id1) : "";
        const k2 = id2 ? String(id2) : "";

        set((state) => {
          const nextDelta = { ...state.likesDelta };
          if (k1) delete nextDelta[k1];
          if (k2) delete nextDelta[k2];
          return { likesDelta: nextDelta };
        });
      },

      setBookmarked: (id1, value, id2) => {
        if (!id1 && !id2) return;
        const k1 = id1 ? String(id1) : "";
        const k2 = id2 ? String(id2) : "";
        const now = Date.now();
        const boolVal = Boolean(value);

        set((state) => {
          const nextBookmarked = { ...state.bookmarkedPosts };
          const nextBookmarkedAt = { ...state.bookmarkedAtMap };
          const nextSavesDelta = { ...state.savesDelta };

          if (k1) {
            nextBookmarked[k1] = boolVal;
            nextBookmarkedAt[k1] = boolVal ? (nextBookmarkedAt[k1] || now) : 0;
            nextSavesDelta[k1] = boolVal ? 1 : -1;
          }
          if (k2 && k2 !== k1) {
            nextBookmarked[k2] = boolVal;
            nextBookmarkedAt[k2] = boolVal ? (nextBookmarkedAt[k2] || now) : 0;
            nextSavesDelta[k2] = boolVal ? 1 : -1;
          }

          return {
            bookmarkedPosts: nextBookmarked,
            bookmarkedAtMap: nextBookmarkedAt,
            savesDelta: nextSavesDelta,
          };
        });
      },

      clearSavesDelta: (id1, id2) => {
        if (!id1 && !id2) return;
        const k1 = id1 ? String(id1) : "";
        const k2 = id2 ? String(id2) : "";

        set((state) => {
          const nextDelta = { ...state.savesDelta };
          if (k1) delete nextDelta[k1];
          if (k2) delete nextDelta[k2];
          return { savesDelta: nextDelta };
        });
      },
    }),
    {
      name: "ditto:community-interactions",
      partialize: (state) => ({
        likedPosts: state.likedPosts,
        likedAtMap: state.likedAtMap,
        bookmarkedPosts: state.bookmarkedPosts,
        bookmarkedAtMap: state.bookmarkedAtMap,
      }),
    },
  ),
);
