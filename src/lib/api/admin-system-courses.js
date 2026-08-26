import apiClient from "./client";
import { requestData } from "./api-response";

// 기본 추천 코스 — `creation_type = 'SYSTEM'`. 서비스 DB 에 **영구히** 걸려 있는 것이다.
//
// `/admin/admin-courses` 와 보는 곳이 다르다:
//   admin-courses         승인 전후의 셀럽 코스(초안·캐시). 자정에 사라진다
//   admin/system-courses  메인·추천 리스트에 걸린 코스. 안 사라진다
//
// 그래서 여기에는 TTL 이 없다. 목록의 원본이 오라클이라 Redis 가 죽어도 다 보인다 —
// 그때 빠지는 것은 인물 이름과 진행 문구뿐이다.

/**
 * 지금 걸려 있는 기본 추천 코스 전부. **페이지를 안 자른다.**
 *
 * 아직 반영이 도는 중인 것은 `state` 가 `queued`·`running` 으로 오고 `courseId` 가 없다.
 * 끝난 것은 `done`, 실패한 것은 `failed` 이고 `error` 에 사유가 있다.
 */
export function getSystemCourses() {
  return requestData(apiClient.get("/admin/system-courses"));
}

/** 자리 목록과 게시글 본문까지. 수정 화면이 이걸로 폼을 채운다. */
export function getSystemCourse(courseId) {
  return requestData(apiClient.get(`/admin/system-courses/${courseId}`));
}

/**
 * 보낸 칸만 고친다 — 안 보낸 칸은 그대로다.
 *
 * @param {object} patch `{name, description, countryCode, postContent, places:[{placeId, recommendationReason}]}`
 */
export function updateSystemCourse(courseId, patch) {
  return requestData(apiClient.patch(`/admin/system-courses/${courseId}`, patch));
}

/**
 * 내린다. 코스와 붙어 있는 게시글이 같이 내려간다.
 *
 * **되돌리는 창구는 없다.** 다시 올리려면 셀럽 편집기에서 다시 승인해야 한다 —
 * 화면이 두 번 눌러야 나가게 해 둔 것이 그 때문이다.
 */
export function deleteSystemCourse(courseId) {
  return requestData(apiClient.delete(`/admin/system-courses/${courseId}`));
}
