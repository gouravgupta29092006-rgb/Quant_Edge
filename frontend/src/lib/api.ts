/**
 * QuantEdge API Client
 * Axios instance with JWT auth, refresh token rotation, and error handling.
 * Per TECH_SPEC.md §12 — JWT Authentication.
 */
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Token storage keys
const ACCESS_TOKEN_KEY  = 'qe_access_token';
const REFRESH_TOKEN_KEY = 'qe_refresh_token';

export const tokenStore = {
  getAccess:  () => typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY)  : null,
  getRefresh: () => typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null,
  setAccess:  (t: string) => localStorage.setItem(ACCESS_TOKEN_KEY, t),
  setRefresh: (t: string) => localStorage.setItem(REFRESH_TOKEN_KEY, t),
  clear:      () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// ─── Create axios instance ─────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Request interceptor — attach Bearer token ─────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor — handle 401 / token refresh ────
let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve) => {
          pendingRequests.push((token: string) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;
      const refreshToken = tokenStore.getRefresh();

      if (!refreshToken) {
        tokenStore.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = data.data;
        tokenStore.setAccess(accessToken);
        tokenStore.setRefresh(newRefreshToken);

        // Replay all queued requests
        pendingRequests.forEach((cb) => cb(accessToken));
        pendingRequests = [];

        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        tokenStore.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ─── Typed API helpers ─────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export const apiGet  = <T>(url: string, params?: object) =>
  api.get<ApiResponse<T>>(url, { params }).then((r) => r.data.data);

export const apiPost = <T>(url: string, body?: object) =>
  api.post<ApiResponse<T>>(url, body).then((r) => r.data.data);

export const apiPut  = <T>(url: string, body?: object) =>
  api.put<ApiResponse<T>>(url, body).then((r) => r.data.data);

export const apiDelete = <T>(url: string) =>
  api.delete<ApiResponse<T>>(url).then((r) => r.data.data);
