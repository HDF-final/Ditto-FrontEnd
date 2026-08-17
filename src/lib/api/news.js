import apiClient from "./client";
import { requestData } from "./api-response";

/**
 * 뉴스피드 목록 조회 (페이징).
 * GET /api/v1/news?page={page}&size={size}
 */
export function getNewsFeeds({ page = 0, size = 10 } = {}) {
  return requestData(
    apiClient.get("/news", {
      params: { page, size },
    }),
  );
}

/**
 * 뉴스피드 상세 조회 (newsId 단건).
 * GET /api/v1/news/{newsId}
 */
export function getNewsFeedById(newsId) {
  return requestData(apiClient.get(`/news/${newsId}`));
}

/**
 * 검색 유입 및 SEO용 고유 슬러그 상세 조회.
 * GET /api/v1/news/slug/{slug}
 */
export function getNewsFeedBySlug(slug) {
  return requestData(apiClient.get(`/news/slug/${encodeURIComponent(slug)}`));
}

/**
 * 사이트맵용 뉴스 목록 조회.
 * GET /api/v1/news/sitemap
 */
export function getNewsFeedsForSitemap() {
  return requestData(apiClient.get("/news/sitemap"));
}
