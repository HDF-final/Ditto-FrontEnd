import apiClient from "./client";
import { requestData } from "./api-response";

export function getNavigablePlaces() {
  return requestData(apiClient.get("/places/navigation"));
}
