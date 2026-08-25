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
