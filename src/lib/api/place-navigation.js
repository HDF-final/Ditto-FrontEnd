import apiClient from "./client";
import { requestData } from "./api-response";

export function getNavigablePlaces() {
  return requestData(apiClient.get("/places/navigation"));
}

export function getPlaceNavigation(placeId) {
  return requestData(apiClient.get(`/places/${placeId}/navigation`));
}

export function normalizePlaceNavigation(place) {
  if (!place || typeof place !== "object") return null;
  return {
    placeId: place.placeId ?? place.place_id ?? null,
    navigationKey: place.navigationKey ?? place.navigation_key ?? null,
    name: place.name ?? place.placeName ?? place.place_name ?? null,
    floorCode: place.floorCode ?? place.floor_code ?? place.floor ?? null,
    imageUrl: place.imageUrl ?? place.image_url ?? null,
    description: place.description ?? place.desc ?? null,
    category: place.category ?? null,
  };
}
