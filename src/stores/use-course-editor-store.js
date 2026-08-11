"use client";

import { create } from "zustand";

import { aiCourseFixture } from "@/lib/fixtures/ai-course";

function moveItem(items, fromIndex, toIndex) {
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export const useCourseEditorStore = create((set) => ({
  title: aiCourseFixture.title,
  stops: aiCourseFixture.stops,
  history: [],
  selectedIds: [],
  addOpen: false,
  optimizeOpen: false,
  saveOpen: false,
  deleteId: null,
  detailStop: null,

  setTitle: (title) => set({ title }),
  openAdd: () => set({ addOpen: true }),
  closeAdd: () => set({ addOpen: false }),
  openOptimize: () => set({ optimizeOpen: true }),
  closeOptimize: () => set({ optimizeOpen: false }),
  openSave: () => set({ saveOpen: true }),
  closeSave: () => set({ saveOpen: false }),
  openDetail: (detailStop) => set({ detailStop }),
  closeDetail: () => set({ detailStop: null }),
  requestDelete: (deleteId) => set({ deleteId }),
  cancelDelete: () => set({ deleteId: null }),

  toggleSelected: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((selectedId) => selectedId !== id)
        : [...state.selectedIds, id],
    })),

  setStops: (stops) =>
    set((state) => ({
      history: [...state.history, state.stops],
      stops,
    })),

  addPlace: (place) =>
    set((state) => ({
      history: [...state.history, state.stops],
      stops: [...state.stops, place],
    })),

  reorderStop: (fromIndex, toIndex) =>
    set((state) => ({
      history: [...state.history, state.stops],
      stops: moveItem(state.stops, fromIndex, toIndex),
    })),

  confirmDelete: () =>
    set((state) => ({
      history: [...state.history, state.stops],
      stops: state.stops.filter((stop) => stop.id !== state.deleteId),
      selectedIds: state.selectedIds.filter((id) => id !== state.deleteId),
      deleteId: null,
    })),

  undo: () =>
    set((state) => {
      const previous = state.history.at(-1);
      if (!previous) {
        return state;
      }
      return {
        stops: previous,
        history: state.history.slice(0, -1),
        selectedIds: state.selectedIds.filter((id) =>
          previous.some((stop) => stop.id === id),
        ),
      };
    }),
}));
