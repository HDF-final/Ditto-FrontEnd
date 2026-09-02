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
}) {
  const payload = {
    courseId: Number(courseId),
    title: (title || "").trim(),
    content: (content || "").trim() || "더현대 서울 맞춤 코스입니다.",
  };
  return requestData(apiClient.post("/community/courses", payload));
}

/**
 * 코스 게시글 사진 업로드 (여러 장).
 * POST /api/v1/community/courses/{postId}/images (multipart/form-data)
 *
 * 백엔드가 S3에 올리고 게시글의 전체 사진 URL 목록을 돌려줍니다.
 * 게시글당 최대 10장이며, 기존 사진 뒤에 이어 붙습니다.
 *
 * @param {number|string} postId 사진을 붙일 게시글 ID
 * @param {Array<File|Blob>} files 업로드할 이미지 파일들
 * @returns {Promise<{ postId: number, imageUrls: string[] }>}
 */
export function uploadCoursePostImages(postId, files) {
  const list = (Array.isArray(files) ? files : [files]).filter(Boolean);
  const form = new FormData();
  list.forEach((file, index) => {
    const named =
      file instanceof File
        ? file
        : new File([file], `photo-${index + 1}.jpg`, {
            type: file?.type || "image/jpeg",
          });
    // 백엔드 @RequestPart("images") List<MultipartFile>
    form.append("images", named);
  });
  return requestData(
    apiClient.post(`/community/courses/${postId}/images`, form, {
      timeout: 60_000,
      headers: { "Content-Type": undefined },
    }),
  );
}

/**
 * 코스 게시글 수정.
 * PATCH /api/v1/community/courses/{postId} (multipart/form-data)
 */
export function updateCoursePost(
  postId,
  {
    title,
    content,
    deleteImageIds = [],
    deleteAllImages = false,
    images = [],
    userId,
  },
) {
  const payload = {
    title: (title || "").trim(),
    content: (content || "").trim(),
    deleteImageIds: Array.isArray(deleteImageIds)
      ? deleteImageIds
          .map((id) => Number(id))
          .filter((id) => Number.isFinite(id))
      : [],
    deleteAllImages: Boolean(deleteAllImages),
  };
  const form = new FormData();
  form.append(
    "request",
    new Blob([JSON.stringify(payload)], { type: "application/json" }),
  );

  const list = (Array.isArray(images) ? images : [images]).filter(Boolean);
  list.forEach((file, index) => {
    const named =
      file instanceof File
        ? file
        : new File([file], `photo-${index + 1}.jpg`, {
            type: file?.type || "image/jpeg",
          });
    form.append("images", named);
  });

  return requestData(
    apiClient.patch(`/community/courses/${postId}`, form, {
      timeout: 60_000,
      headers: {
        "Content-Type": undefined,
        ...(userId ? { "X-User-Id": String(userId) } : {}),
      },
    }),
  );
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
