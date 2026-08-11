import { placeCatalog } from "./places";

// Static sample data for the AI course editor foundation.
// This is placeholder UI data only — do not treat it as a real API contract.
// The initial course reuses catalog places (by id) so that duplicate-add
// prevention works consistently against the "장소 추가" search catalog.

const pickPlace = (id) => placeCatalog.find((place) => place.id === id);

const initialStopIds = [
  "place-smt-lounge",
  "place-mlb",
  "place-eoi",
  "place-spider-popup",
];

export const aiCourseFixture = {
  id: "course-draft-1",
  title: "K-MZ Trend 코스",
  stops: initialStopIds.map(pickPlace),
};
