import { ApiError } from './errors';
import type { ApiFailure, ApiSuccess, Page } from './types';

export const API_BASE = '/api/v1';

/** Sessiya tugadi (qayta kirish kerak) va texnik ishlar hodisalari. */
export const sessionEvents = new EventTarget();
export const SESSION_ENDED = 'session-ended';
export const MAINTENANCE = 'maintenance';

type Primitive = string | number | boolean;
export type Query = Record<string, Primitive | Primitive[] | null | undefined>;

export interface RequestOptions {
  params?: Query;
  body?: unknown;                    // JSON yoki FormData
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

const NO_REFRESH = /^\/auth\/(login|register|refresh|logout|forgot-password|reset-password|verify-email)$/;
const REFRESH_ON = new Set(['TOKEN_EXPIRED', 'UNAUTHORIZED']);
const LOCK_NAME = 'ustozai-refresh';
const STAMP_KEY = 'ustozai:refreshed-at';
const FRESH_MS = 5_000;

export function buildUrl(path: string, params?: Query): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) continue;
    qs.set(k, Array.isArray(v) ? v.join(',') : String(v));
  }
  const s = qs.toString();
  return `${API_BASE}${path}${s ? `?${s}` : ''}`;
}

const networkError = () => new ApiError(0, 'NETWORK_ERROR', 'Network error');
const endSession = () => sessionEvents.dispatchEvent(new Event(SESSION_ENDED));

async function readCode(res: Response): Promise<string | undefined> {
  try { return ((await res.clone().json()) as ApiFailure)?.error?.code; } catch { return undefined; }
}

async function rawFetch(method: string, path: string, o: RequestOptions): Promise<Response> {
  const isForm = typeof FormData !== 'undefined' && o.body instanceof FormData;
  try {
    return await fetch(buildUrl(path, o.params), {
      method,
      credentials: 'include',
      signal: o.signal,
      headers: {
        Accept: 'application/json',
        ...(o.body !== undefined && !isForm && { 'Content-Type': 'application/json' }),
        ...o.headers,
      },
      body: o.body === undefined ? undefined : isForm ? (o.body as FormData) : JSON.stringify(o.body),
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err; // React Query bekor qilgan
    throw networkError();
  }
}

// ---------- token yangilash ----------
let inflight: Promise<boolean> | null = null;

function stamp() { try { localStorage.setItem(STAMP_KEY, String(Date.now())); } catch { /* storage yo'q */ } }
function recentlyRefreshed() {
  try { return Date.now() - Number(localStorage.getItem(STAMP_KEY) ?? 0) < FRESH_MS; } catch { return false; }
}

async function runRefresh(): Promise<boolean> {
  if (recentlyRefreshed()) return true; // boshqa tab hozirgina yangilagan: cookie'lar yangi
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST', credentials: 'include', body: '{}',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
  } catch {
    throw networkError(); // tarmoq xatosi sessiyani tugatmaydi
  }
  if (res.ok) { stamp(); return true; }
  const code = await readCode(res);
  if (code === 'REFRESH_RACE') return true;               // parallel so'rov cookie'ni allaqachon yangilagan
  if (res.status === 401 || res.status === 403) return false; // sessiya haqiqatan tugagan / bloklangan
  throw new ApiError(res.status, code ?? 'REFRESH_FAILED', 'Refresh failed'); // 5xx: sessiya saqlanadi
}

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const locks = typeof navigator !== 'undefined' ? (navigator as Navigator & { locks?: LockManager }).locks : undefined;
  return locks ? (locks.request(LOCK_NAME, fn) as unknown as Promise<T>) : fn(); // tablar orasida ketma-ket
}

/** true: sessiya yangilandi; false: qayta kirish kerak. Tarmoq/5xx xatosida ApiError tashlaydi. */
export function refreshSession(): Promise<boolean> {
  inflight ??= withLock(runRefresh).finally(() => { inflight = null; });
  return inflight;
}

// ---------- so'rov ----------
/** Xom Response (SSE kabi hollar uchun). 401 bo'lsa, bir marta yangilab qayta uriniladi. */
export async function fetchWithAuth(method: string, path: string, o: RequestOptions = {}): Promise<Response> {
  let res = await rawFetch(method, path, o);
  if (res.status !== 401 || NO_REFRESH.test(path)) return res;

  const code = await readCode(res);
  if (!code || !REFRESH_ON.has(code)) { endSession(); return res; } // SESSION_REVOKED va h.k.

  if (!(await refreshSession())) { endSession(); return res; }
  res = await rawFetch(method, path, o);
  if (res.status === 401) endSession();
  return res;
}

async function parse<T>(res: Response): Promise<ApiSuccess<T>> {
  const text = await res.text();
  let body: { success?: boolean; error?: ApiFailure['error'] } | null = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = null; }

  if (res.ok && body?.success === true) return body as unknown as ApiSuccess<T>;
  if (body?.success === false && body.error) {
    if (body.error.code === 'MAINTENANCE') sessionEvents.dispatchEvent(new Event(MAINTENANCE));
    throw new ApiError(res.status, body.error.code, body.error.message, body.error.details ?? {});
  }
  throw new ApiError(res.status, res.ok ? 'BAD_RESPONSE' : `HTTP_${res.status}`, 'Unexpected response');
}

const call = async <T>(method: string, path: string, o?: RequestOptions) => parse<T>(await fetchWithAuth(method, path, o));

export const api = {
  get: async <T>(path: string, o?: Omit<RequestOptions, 'body'>) => (await call<T>('GET', path, o)).data,
  getPage: async <T>(path: string, o?: Omit<RequestOptions, 'body'>): Promise<Page<T>> => {
    const r = await call<T[]>('GET', path, o);
    return { items: r.data, meta: r.meta };
  },
  post: async <T = null>(path: string, body?: unknown, o?: RequestOptions) => (await call<T>('POST', path, { ...o, body })).data,
  put: async <T = null>(path: string, body?: unknown, o?: RequestOptions) => (await call<T>('PUT', path, { ...o, body })).data,
  patch: async <T = null>(path: string, body?: unknown, o?: RequestOptions) => (await call<T>('PATCH', path, { ...o, body })).data,
  delete: async <T = null>(path: string, o?: RequestOptions) => (await call<T>('DELETE', path, o)).data,
  upload: async <T>(path: string, form: FormData, o?: RequestOptions) => (await call<T>('POST', path, { ...o, body: form })).data,
};

export const __test = { reset() { inflight = null; } };
