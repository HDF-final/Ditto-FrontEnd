import apiClient from "./client";
import { requestData } from "./api-response";

export function createCourse({ name, description = null, placeIds }) {
  return requestData(apiClient.post("/courses", { name, description, placeIds }));
}

export function updateCourse(courseId, { name, description, orderedPlaceIds }) {
  return requestData(
    apiClient.patch(`/courses/${courseId}`, {
      name,
      description,
      orderedPlaceIds,
    }),
  );
}

export function addCoursePlace(courseId, { placeId, position }) {
  return requestData(
    apiClient.post(`/courses/${courseId}/places`, { placeId, position }),
  );
}

export function deleteCoursePlace(courseId, placeId) {
  return requestData(apiClient.delete(`/courses/${courseId}/places/${placeId}`));
}
