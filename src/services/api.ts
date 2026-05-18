import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

import { ENV } from '../config/env';
import { secureStorage } from './secureStorage';

export const api = axios.create({
  baseURL: ENV.API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Problem+JSON error envelope (RFC 7807).
 * The backend returns this shape on every 4xx/5xx response.
 */
export interface ApiProblem {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: { field: string; message: string }[];
}

/**
 * Raised by the API client when the server returns a problem+json payload.
 * Use `error.problem` to read the structured details in screens.
 */
export class ApiError extends Error {
  problem: ApiProblem;

  constructor(problem: ApiProblem) {
    super(problem.detail || problem.title);
    this.name = 'ApiError';
    this.problem = problem;
  }
}

/* ─────────────────────────────────────────────
 *  Hook to wire the auth refresh callback in.
 *  Defined here (and not in auth.service) to avoid circular imports.
 * ───────────────────────────────────────────── */
type RefreshFn = () => Promise<string>;
let refreshFn: RefreshFn | null = null;
let onUnauthenticated: (() => void) | null = null;

export function configureAuth(options: {
  refresh: RefreshFn;
  onLogout: () => void;
}) {
  refreshFn = options.refresh;
  onUnauthenticated = options.onLogout;
}

/* ─────────────────────────────────────────────
 *  Request interceptor — attach Bearer token
 * ───────────────────────────────────────────── */
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await secureStorage.getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

/* ─────────────────────────────────────────────
 *  Response interceptor — refresh on 401, normalise errors
 * ───────────────────────────────────────────── */
let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiProblem>) => {
    const originalRequest = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const status = error.response?.status;

    // Try refresh once on 401 (except for auth endpoints themselves)
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/');
    if (
      status === 401 &&
      !isAuthEndpoint &&
      originalRequest &&
      !originalRequest._retry &&
      refreshFn
    ) {
      originalRequest._retry = true;

      try {
        // Single in-flight refresh shared across concurrent failed requests
        refreshPromise = refreshPromise ?? refreshFn();
        const newToken = await refreshPromise;
        refreshPromise = null;

        originalRequest.headers = originalRequest.headers ?? {};
        (originalRequest.headers as Record<string, string>).Authorization =
          `Bearer ${newToken}`;

        return api.request(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        await secureStorage.clear();
        onUnauthenticated?.();
        throw new ApiError({
          title: 'Sessão expirada',
          detail: 'Faça login novamente',
          status: 401,
        });
      }
    }

    // Normalise to ApiError so screens can rely on a single shape
    if (error.response?.data && typeof error.response.data === 'object' && 'title' in error.response.data) {
      throw new ApiError(error.response.data as ApiProblem);
    }

    throw new ApiError({
      title: error.message || 'Erro de comunicação com o servidor',
      status: status ?? 0,
    });
  }
);
