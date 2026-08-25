import apiClient from "./client";
import { requestData } from "./api-response";

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
    getAdminTop4(),
    getAdminCandidates(),
    getAdminYoutube(),
  ]).then(([top4, candidates, youtube]) => ({ top4, candidates, youtube }));
}
