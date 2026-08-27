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
  const nestedUser =
    author.user ||
    author.authorUser ||
    author.writerUser ||
    author.member ||
    author.author ||
    author.writer ||
    {};
  const name =
    author.name ||
    author.writerNickname ||
    author.writerName ||
    author.authorNickname ||
    author.authorName ||
    author.nickname ||
    author.userName ||
    author.displayName ||
    nestedUser.nickname ||
    nestedUser.name ||
    nestedUser.userName ||
    nestedUser.displayName ||
    "";

  if (!name) return null;

  return {
    id:
      author.id ||
      author.userId ||
      author.writerId ||
      author.authorId ||
      author.memberId ||
      nestedUser.id ||
      nestedUser.userId ||
      nestedUser.memberId ||
      "",
    name,
    country:
      author.country ||
      author.countryCode ||
      author.nationality ||
      nestedUser.country ||
      nestedUser.countryCode ||
      "",
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
