import "client-only";

import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  timeout: 15_000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

export default apiClient;
