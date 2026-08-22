import apiClient from "./client";
import { requestData } from "./api-response";

export function getNavigablePlaces() {
  return requestData(apiClient.get("/places/navigation"));
}

export function getPlaceNavigation(placeId) {
  return requestData(apiClient.get(`/places/${placeId}/navigation`));
}
