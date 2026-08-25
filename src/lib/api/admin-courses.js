import apiClient from "./client";
import { requestData } from "./api-response";

// 승인 대기 코스 초안 — ditto-celeb-warm-2 배치가 만든 것을 읽기만 한다.
// 초안을 만들거나 지우는 창구는 백엔드에 없다(배치와 승인 람다의 일이다).

export function getAdminCourses() {
  return requestData(apiClient.get("/admin/admin-courses"));
}

export function getAdminCourseRun() {
  return requestData(apiClient.get("/admin/admin-courses/run"));
}

export function getAdminCourse(celebrity) {
  return requestData(
    apiClient.get(`/admin/admin-courses/${encodeURIComponent(celebrity)}`),
  );
}

// 더현대 장소 전부. 관리자가 코스의 자리를 갈아 끼울 때 고를 재료다.
// 초안이 들고 있는 차순위 후보(alternates)가 비어 있는 자리가 있어 그것만으로는 모자란다.
export function getAdminCoursePlaces({ fresh = false } = {}) {
  return requestData(
    apiClient.get("/admin/admin-courses/places", { params: fresh ? { fresh: true } : undefined }),
  );
}
