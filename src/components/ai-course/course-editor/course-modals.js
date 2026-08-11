"use client";

import { useCourseEditorStore } from "@/stores/use-course-editor-store";
import { AddPlaceModal } from "./add-place-modal";
import { DeletePlaceDialog } from "./delete-place-dialog";
import { PlaceDetailModal } from "./place-detail";

// Detail modal for a stop already in the course.
function StopDetailModal() {
  const detailStop = useCourseEditorStore((state) => state.detailStop);
  const closeDetail = useCourseEditorStore((state) => state.closeDetail);

  return (
    <PlaceDetailModal
      open={Boolean(detailStop)}
      place={detailStop}
      onClose={closeDetail}
    />
  );
}

// Single mount point for every course-editor modal.
export function CourseModals() {
  return (
    <>
      <AddPlaceModal />
      <DeletePlaceDialog />
      <StopDetailModal />
    </>
  );
}
