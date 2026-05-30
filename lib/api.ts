// ─── API Base URL ─────────────────────────────────────────────────────────────
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// ─── Token Helper ─────────────────────────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('lth_token');
}

// ─── Core Fetch ───────────────────────────────────────────────────────────────
/**
 * Wrapper around `fetch` that:
 * 1. Injects Authorization: Bearer <token> header when available
 * 2. Unwraps the `{ statusCode, message, data }` ResponseInterceptor envelope
 * 3. Throws a user-readable Error on non-2xx responses
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    // NestJS validation errors can be an array in json.message
    const msg =
      typeof json.message === 'string'
        ? json.message
        : Array.isArray(json.message)
        ? json.message[0]
        : 'Terjadi kesalahan pada server.';
    throw new Error(msg);
  }

  // Unwrap ResponseInterceptor envelope: prefer json.data, fallback to json
  return (json.data ?? json) as T;
}

// ─── Typed Endpoint Helpers ───────────────────────────────────────────────────

/** GET helper */
export const apiGet = <T>(path: string) => apiFetch<T>(path, { method: 'GET' });

/** POST helper */
export const apiPost = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) });

/** PATCH helper */
export const apiPatch = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body) });

/** DELETE helper */
export const apiDelete = <T>(path: string) =>
  apiFetch<T>(path, { method: 'DELETE' });
