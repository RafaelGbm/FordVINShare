import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

import { ENV } from '../config/env';
import { secureStorage } from './secureStorage';

// eslint-disable-next-line import/no-named-as-default-member -- axios.create is the canonical instance factory
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
 * Success envelope wrapping every 2xx body returned by the Java backend.
 * The `data` field carries the real payload; the response interceptor unwraps it
 * so services keep reading `response.data` as the payload.
 */
interface SuccessEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp?: string;
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

/**
 * Builds a problem payload for responses the backend did not describe itself.
 *
 * Most errors arrive as problem+json and are used as-is. But some do not: a
 * 401 with no body (what the API returns for a missing token), a gateway
 * error, or no response at all. Those used to surface axios's own
 * `error.message` — English text like "Request failed with status code 401" —
 * straight into the UI, so they get a translated message here instead.
 */
export function fallbackProblem(error: AxiosError): ApiProblem {
  const status = error.response?.status ?? 0;

  if (!error.response) {
    const timedOut = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
    return {
      title: timedOut ? 'Tempo de conexão esgotado' : 'Sem conexão com o servidor',
      detail: timedOut
        ? 'O servidor demorou demais para responder. Tente novamente.'
        : 'Verifique sua conexão com a internet e tente novamente.',
      status: 0,
    };
  }

  const BY_STATUS: Record<number, { title: string; detail: string }> = {
    400: { title: 'Requisição inválida', detail: 'Confira os dados enviados e tente novamente.' },
    401: { title: 'Sessão expirada', detail: 'Faça login novamente para continuar.' },
    403: { title: 'Acesso negado', detail: 'Você não tem permissão para esta ação.' },
    404: { title: 'Não encontrado', detail: 'O recurso solicitado não existe.' },
    409: { title: 'Conflito', detail: 'Este registro foi alterado por outra pessoa.' },
    422: { title: 'Não foi possível concluir', detail: 'Os dados enviados não são válidos.' },
    429: { title: 'Muitas tentativas', detail: 'Aguarde um instante antes de tentar de novo.' },
  };

  const known = BY_STATUS[status];
  if (known) return { ...known, status };

  if (status >= 500) {
    return {
      title: 'Erro no servidor',
      detail: 'O servidor não conseguiu responder. Tente novamente em instantes.',
      status,
    };
  }

  return { title: 'Erro de comunicação com o servidor', status };
}

/* ─────────────────────────────────────────────
 *  Response interceptor — refresh on 401, normalise errors
 * ───────────────────────────────────────────── */
let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (response) => {
    // Backend wraps every 2xx body in { success, data, message?, timestamp? }.
    // Unwrap here so each service can keep reading `response.data` as the payload.
    const body = response.data as unknown;
    if (
      body !== null &&
      typeof body === 'object' &&
      !Array.isArray(body) &&
      'success' in body
    ) {
      const envelope = body as SuccessEnvelope<unknown>;
      if (envelope.success === false) {
        throw new ApiError({
          title: envelope.message || 'Erro',
          detail: envelope.message,
          status: response.status,
        });
      }
      if ('data' in envelope) {
        response.data = envelope.data;
      }
    }
    return response;
  },
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
      } catch {
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

    throw new ApiError(fallbackProblem(error));
  }
);
