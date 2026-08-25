"use client";

import { create } from "zustand";

const STORAGE_KEY = "ditto:community-post-authors-v1";

function loadInitialPostAuthors() {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePostAuthors(authorsMap) {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(authorsMap);
    sessionStorage.setItem(STORAGE_KEY, serialized);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(authorsMap));
    } catch {
      // Ignore storage failures.
    }
  }
}

function normalizeAuthor(author) {
  if (!author) return null;
  const name =
    author.name ||
    author.writerNickname ||
    author.nickname ||
    author.userName ||
    "";

  if (!name) return null;

  return {
    id: author.id || author.userId || author.writerId || "",
    name,
    country: author.country || author.countryCode || author.nationality || "",
    persona: author.persona || author.shoppingType || author.personaId || "",
  };
}

export const useCommunityPostAuthorsStore = create((set, get) => ({
  postAuthors: loadInitialPostAuthors(),

  setPostAuthor: (id, author) => {
    if (!id) return;
    const normalized = normalizeAuthor(author);
    if (!normalized) return;

    set((state) => {
      const nextMap = {
        ...state.postAuthors,
        [String(id)]: normalized,
      };
      savePostAuthors(nextMap);
      return { postAuthors: nextMap };
    });
  },

  getPostAuthor: (...ids) => {
    const state = get();
    for (const id of ids) {
      if (!id) continue;
      const author = state.postAuthors[String(id)];
      if (author) return author;
    }
    return null;
  },
}));
