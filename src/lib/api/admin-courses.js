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

// 코스의 자리를 갈아 끼울 매장 목록은 여기에 없다. **/ai-course 와 같은 것을 쓴다** —
// 로컬 원장(`course-routing-service`) + `/places/navigation`. 손님이 고를 수 있는 매장과
// 관리자가 고를 수 있는 매장이 다르면 승인해 놓고 손님 화면에서 안 뜨는 자리가 생긴다.
//
// 백엔드에 `/admin/admin-courses/places` 가 있지만 이 화면은 더 이상 안 쓴다.
