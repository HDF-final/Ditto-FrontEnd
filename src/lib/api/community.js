import apiClient from "./client";
import { requestData } from "./api-response";

/**
 * 공개 코스 목록 조회 (페이징).
 * GET /api/v1/community/courses?page={page}&size={size}
 */
export function getPublicCourses({ page = 0, size = 10 } = {}) {
  return requestData(
    apiClient.get("/community/courses", {
      params: { page, size },
    }),
  );
}

/**
 * 공개 코스 상세 조회 (단건).
 * GET /api/v1/community/courses/{postId}
 */
export function getPublicCourse(postId) {
  return requestData(apiClient.get(`/community/courses/${postId}`));
}

/**
 * 코스 게시글 작성.
 * POST /api/v1/community/courses
 */
export function createCoursePost({
  courseId,
  title,
  content,
  representativeImageUrl,
  imageUrl,
}) {
  const payload = {
    courseId,
    title,
    content,
  };
  const img = representativeImageUrl || imageUrl;
  if (img) {
    payload.representativeImageUrl = img;
  }
  return requestData(apiClient.post("/community/courses", payload));
}

/**
 * 코스 게시글 수정.
 * PATCH /api/v1/community/courses/{postId}
 */
export function updateCoursePost(
  postId,
  { title, content, representativeImageUrl, imageUrl },
) {
  const payload = {
    title,
    content,
  };
  const img = representativeImageUrl || imageUrl;
  if (img) {
    payload.representativeImageUrl = img;
  }
  return requestData(apiClient.patch(`/community/courses/${postId}`, payload));
}

/**
 * 코스 게시글 삭제.
 * DELETE /api/v1/community/courses/{postId}
 */
export function deleteCoursePost(postId) {
  return requestData(apiClient.delete(`/community/courses/${postId}`));
}

/**
 * 코스 게시글 댓글 작성.
 * POST /api/v1/community/courses/{postId}/comments
 */
export function createComment(postId, { content }) {
  return requestData(
    apiClient.post(`/community/courses/${postId}/comments`, {
      content,
    }),
  );
}

/**
 * 코스 게시글 댓글 목록 조회.
 * GET /api/v1/community/courses/{postId}/comments
 */
export function getComments(postId) {
  return requestData(apiClient.get(`/community/courses/${postId}/comments`));
}

/**
 * 코스 게시글 댓글 수정.
 * PATCH /api/v1/community/courses/{postId}/comments/{commentId}
 */
export function updateComment(postId, commentId, { content }) {
  return requestData(
    apiClient.patch(`/community/courses/${postId}/comments/${commentId}`, {
      content,
    }),
  );
}

/**
 * 코스 게시글 댓글 삭제.
 * DELETE /api/v1/community/courses/{postId}/comments/{commentId}
 */
export function deleteComment(postId, commentId) {
  return requestData(
    apiClient.delete(`/community/courses/${postId}/comments/${commentId}`),
  );
}

/**
 * 공개 코스 북마크(찜) 등록.
 * POST /api/v1/community/courses/{postId}/bookmarks
 */
export function bookmarkCourse(postId) {
  return requestData(
    apiClient.post(`/community/courses/${postId}/bookmarks`),
  );
}

/**
 * 공개 코스 북마크(찜) 취소.
 * DELETE /api/v1/community/courses/{postId}/bookmarks
 */
export function unbookmarkCourse(postId) {
  return requestData(
    apiClient.delete(`/community/courses/${postId}/bookmarks`),
  );
}

/**
 * 공개 코스 좋아요 등록.
 * POST /api/v1/community/courses/{postId}/likes
 */
export function likeCourse(postId) {
  return requestData(
    apiClient.post(`/community/courses/${postId}/likes`),
  );
}

/**
 * 공개 코스 좋아요 취소.
 * DELETE /api/v1/community/courses/{postId}/likes
 */
export function unlikeCourse(postId) {
  return requestData(
    apiClient.delete(`/community/courses/${postId}/likes`),
  );
}
