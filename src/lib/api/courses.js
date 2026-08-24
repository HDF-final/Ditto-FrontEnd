import apiClient from "./client";
import { requestData } from "./api-response";

export function createCourse({
  name,
  description = null,
  placeIds,
  courseType = "MANUAL",
  sourceCourseId = null,
}) {
  const payload = { name, description, placeIds };
  if (courseType) payload.courseType = courseType;
  if (sourceCourseId) payload.sourceCourseId = sourceCourseId;
  return requestData(apiClient.post("/courses", payload));
}

export function copyCourse(sourceCourseId, payload = {}) {
  return requestData(
    apiClient
      .post(`/courses/public/${sourceCourseId}/copy`, payload)
      .catch(() => apiClient.post("/courses/copy", { sourceCourseId, ...payload, courseType: "COPIED" })),
  );
}

export async function getCourses({ type = "SYSTEM", page = 0, size = 20 } = {}) {
  const params = { page, size };
  if (type) {
    params.type = type;
    params.courseType = type;
  }
  return requestData(
    apiClient.get("/courses", { params }).catch(() => apiClient.get("/courses/my", { params })),
  );
}

export async function getSystemCourses({ page = 0, size = 20 } = {}) {
  // 1. Try direct API endpoints
  const directEndpoints = [
    "/courses?type=SYSTEM",
    "/courses?courseType=SYSTEM",
    "/courses/system",
  ];

  for (const ep of directEndpoints) {
    try {
      const res = await apiClient.get(ep, { params: { page, size } });
      const data = res.data?.data;
      const list = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];
      if (list.length > 0) {
        return list;
      }
    } catch {
      // Continue
    }
  }

  // 2. Fetch official default/SYSTEM course details from backend
  try {
    const defaultCourseIds = [1, 122, 21, 22, 23];
    const details = await Promise.allSettled(
      defaultCourseIds.map((id) => getCourseDetail(id)),
    );

    const validCourses = details
      .filter((r) => r.status === "fulfilled" && r.value)
      .map((r) => r.value);

    // Prioritize SYSTEM creationType first
    validCourses.sort((a, b) => {
      const aScore = a.creationType === "SYSTEM" ? 2 : 1;
      const bScore = b.creationType === "SYSTEM" ? 2 : 1;
      return bScore - aScore;
    });

    if (validCourses.length > 0) {
      return validCourses.slice(0, size);
    }
  } catch (err) {
    console.warn("[getSystemCourses] fallback error:", err);
  }

  return [];
}

export function getMyCourses({ page = 0, size = 20 } = {}) {
  return requestData(
    apiClient.get("/courses/my", { params: { page, size } }),
  );
}

export function getCourseDetail(courseId) {
  return requestData(apiClient.get(`/courses/${courseId}`));
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

export function deleteCourse(courseId) {
  return requestData(apiClient.delete(`/courses/${courseId}`));
}
