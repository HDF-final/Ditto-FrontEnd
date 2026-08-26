import apiClient from "./client";
import { requestData } from "./api-response";

// 승인 대기 코스 초안 — ditto-celeb-warm-2 배치가 만든 것을 읽고, 관리자가 확정한 것을
// 승인 람다로 넘긴다. 초안을 고치거나 지우는 창구는 없다 — 편집은 승인할 때 한 번에 간다.

export function getAdminCourses() {
  return requestData(apiClient.get("/admin/admin-courses"));
}

export function getAdminCourseRun() {
  return requestData(apiClient.get("/admin/admin-courses/run"));
}

/**
 * 지금 손님에게 나가고 있는 코스 목록. 초안이 아니라 **승인이 끝난 것**이다.
 *
 * 승인하면 그 인물의 초안은 지워지므로 `/admin/admin-courses` 목록에서 사라진다.
 * 그 뒤를 보는 창구가 이쪽이고, 전부 다음 00시(KST)에 만료된다.
 *
 * 머리말만 오는데 **대표 사진이 같이 온다** — 초안 목록과 달리 카드를 그리려고
 * 상세를 미리 받을 일이 없다.
 */
export function getCachedAdminCourses() {
  return requestData(apiClient.get("/admin/admin-courses/cached"));
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

/**
 * 초안을 승인해 손님 캐시로 올린다. 성공하면 그 인물의 초안은 사라진다.
 *
 * **타임아웃을 따로 준다.** 기본 클라이언트가 15초인데(`client.js`) 승인은 Redis 네 번에
 * Oracle MERGE 와 람다 콜드스타트까지 있어 그 안에 안 끝나는 일이 있다. 15초에 끊기면
 * 화면은 실패로 보는데 승인은 그대로 진행돼, 관리자가 "실패했다" 를 보고 다시 누른다.
 */
export function approveAdminCourse(celebrity, draft) {
  return requestData(
    apiClient.post(
      `/admin/admin-courses/${encodeURIComponent(celebrity)}/approve`,
      draft,
      { timeout: 60_000 },
    ),
  );
}
