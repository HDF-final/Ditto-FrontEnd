import apiClient from "./client";
import { requestData } from "./api-response";

export function getAdminTop10() {
  return requestData(apiClient.get("/admin/trends/top10"));
}

export function getAdminTop4() {
  return requestData(apiClient.get("/admin/trends/top4"));
}

export function getAdminCandidates() {
  return requestData(apiClient.get("/admin/trends/candidates"));
}

export function getAdminYoutube() {
  return requestData(apiClient.get("/admin/trends/youtube"));
}

export function getAdminTrendOverview() {
  return Promise.all([
    getAdminTop10(),
    getAdminCandidates(),
    getAdminYoutube(),
  ]).then(([top10, candidates, youtube]) => ({ top10, candidates, youtube }));
}
