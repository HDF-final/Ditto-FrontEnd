"use client";

import { useMemo, useState } from "react";

import { Modal } from "@/components/common/modal";
import { placeCatalog } from "@/lib/fixtures/places";
import { useCourseEditorStore } from "@/stores/use-course-editor-store";
import { PlaceSearchForm } from "./place-search-form";
import { PlaceSearchResultList } from "./place-search-result-list";
import { PlaceDetailModal } from "./place-detail";

export function AddPlaceModal() {
  const open = useCourseEditorStore((state) => state.addOpen);
  const closeAdd = useCourseEditorStore((state) => state.closeAdd);
  const addPlace = useCourseEditorStore((state) => state.addPlace);
  const stops = useCourseEditorStore((state) => state.stops);

  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState(null);

  const addedIds = useMemo(() => stops.map((stop) => stop.id), [stops]);

  const results = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      return placeCatalog;
    }
    return placeCatalog.filter(
      (place) =>
        place.name.toLowerCase().includes(keyword) ||
        place.category.toLowerCase().includes(keyword),
    );
  }, [query]);

  function handleClose() {
    closeAdd();
    // Reset transient view state after the modal closes.
    setQuery("");
    setPreview(null);
  }

  function handleAdd() {
    if (!preview) {
      return;
    }
    addPlace(preview);
    handleClose();
  }

  const alreadyAdded = preview ? addedIds.includes(preview.id) : false;

  const previewActions = (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => setPreview(null)}
        className="flex-none rounded-full border border-line bg-surface px-4 py-3 text-sm font-bold text-ink-muted transition hover:border-line-strong"
      >
        ← 목록
      </button>
      <button
        type="button"
        onClick={handleAdd}
        disabled={alreadyAdded}
        className="flex-1 rounded-full bg-brand px-5 py-3 text-sm font-bold text-white shadow-control transition hover:bg-brand-dark disabled:pointer-events-none disabled:opacity-55"
      >
        {alreadyAdded ? "이미 추가된 장소예요" : "이 장소 추가하기"}
      </button>
    </div>
  );

  return (
    <>
      {/* Search list */}
      <Modal open={open && !preview} onClose={handleClose} labelledBy="add-place-title">
        <h3 id="add-place-title" className="mb-4 text-lg font-black text-ink">
          장소 추가
        </h3>
        <PlaceSearchForm value={query} onChange={setQuery} />
        <div className="mt-3">
          <PlaceSearchResultList
            places={results}
            addedIds={addedIds}
            onSelect={setPreview}
          />
        </div>
      </Modal>

      {/* Rich detail preview with add action */}
      <PlaceDetailModal
        open={open && Boolean(preview)}
        place={preview}
        onClose={handleClose}
        actions={previewActions}
      />
    </>
  );
}
