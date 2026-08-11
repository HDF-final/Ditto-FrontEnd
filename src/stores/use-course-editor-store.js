import { create } from "zustand";

import { aiCourseFixture } from "@/lib/fixtures/ai-course";
import { hasStop, reorderStops, swapStops } from "@/lib/utils/course";

// Client-side course editor state. Intentionally NOT persisted: no zustand
// persist middleware and nothing written to localStorage (see AGENTS.md).

const cloneStops = (stops) => stops.map((stop) => ({ ...stop }));

// Carry the full place shape so the detail modal has hero/tags/tiles/products.
const toStop = (place) => ({ ...place });

export const useCourseEditorStore = create((set, get) => ({
  // --- course data ---
  title: aiCourseFixture.title,
  stops: cloneStops(aiCourseFixture.stops),
  selectedIds: [],
  history: [],

  // --- modal / UI state ---
  addOpen: false,
  detailStop: null,
  deleteId: null,
  optimizeOpen: false,
  saveOpen: false,

  // Push the current stop order onto the undo history.
  snapshot: () =>
    set((state) => ({ history: [...state.history, cloneStops(state.stops)] })),

  setTitle: (title) => set({ title }),

  toggleSelected: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((value) => value !== id)
        : [...state.selectedIds, id],
    })),

  // Add a catalog place; returns false when it is a duplicate.
  addPlace: (place) => {
    const { stops, snapshot } = get();
    if (hasStop(stops, place.id)) {
      return false;
    }
    snapshot();
    set({ stops: [...stops, toStop(place)] });
    return true;
  },

  removeStop: (id) => {
    get().snapshot();
    set((state) => ({
      stops: state.stops.filter((stop) => stop.id !== id),
      selectedIds: state.selectedIds.filter((value) => value !== id),
    }));
  },

  // Move a stop one position up or down via the control buttons.
  moveStop: (id, direction) => {
    const { stops, snapshot } = get();
    const index = stops.findIndex((stop) => stop.id === id);
    if (index === -1) {
      return;
    }
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= stops.length) {
      return;
    }
    snapshot();
    set({ stops: swapStops(stops, index, target) });
  },

  // Replace the whole stop order (e.g. applying an optimization result).
  // Only called from an explicit user action — never automatically.
  setStops: (stops) => {
    get().snapshot();
    set({ stops: cloneStops(stops) });
  },

  // Move a stop from one index to another (drag and drop).
  reorderStop: (from, to) => {
    const { stops, snapshot } = get();
    if (from === to || from < 0 || to < 0 || from >= stops.length || to >= stops.length) {
      return;
    }
    snapshot();
    set({ stops: reorderStops(stops, from, to) });
  },

  undo: () =>
    set((state) => {
      if (state.history.length === 0) {
        return {};
      }
      const previous = state.history[state.history.length - 1];
      return {
        stops: cloneStops(previous),
        history: state.history.slice(0, -1),
        selectedIds: [],
      };
    }),

  // --- modal controls ---
  openAdd: () => set({ addOpen: true }),
  closeAdd: () => set({ addOpen: false }),
  openDetail: (stop) => set({ detailStop: stop }),
  closeDetail: () => set({ detailStop: null }),
  requestDelete: (id) => set({ deleteId: id }),
  cancelDelete: () => set({ deleteId: null }),
  confirmDelete: () => {
    const { deleteId, removeStop } = get();
    if (deleteId) {
      removeStop(deleteId);
    }
    set({ deleteId: null });
  },
  openOptimize: () => set({ optimizeOpen: true }),
  closeOptimize: () => set({ optimizeOpen: false }),
  openSave: () => set({ saveOpen: true }),
  closeSave: () => set({ saveOpen: false }),
}));
