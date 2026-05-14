const isServer = typeof window === 'undefined';
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const PUBLIC_IMG_BASE = process.env.NEXT_PUBLIC_IMG_BASE || 'http://localhost:8000';

// In Docker local dev, server-side code needs to talk to 'backend:8000' directly
const INTERNAL_API_URL = 'http://backend:8000';

export const API_BASE = (isServer ? (process.env.INTERNAL_API_URL || INTERNAL_API_URL) : PUBLIC_API_URL).replace(/\/+$/, '');
export const IMG_BASE = (isServer ? (process.env.INTERNAL_API_URL || INTERNAL_API_URL) : PUBLIC_IMG_BASE).replace(/\/+$/, '');

function isBrowser() { return typeof window !== 'undefined'; }

const TOKEN_KEY = 'access';
const REFRESH_KEY = 'refresh';

export function getToken(): string | null { return isBrowser() ? localStorage.getItem(TOKEN_KEY) : null; }
export function getRefreshToken(): string | null { return isBrowser() ? localStorage.getItem(REFRESH_KEY) : null; }
export function setToken(token: string) { if (isBrowser()) localStorage.setItem(TOKEN_KEY, token); }
export function setRefreshToken(token: string) { if (isBrowser()) localStorage.setItem(REFRESH_KEY, token); }
export function clearToken() { 
  if (isBrowser()) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }
}

// Global variable to prevent multiple simultaneous refreshes
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
}

async function doRefreshToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const res = await fetch(`${API_BASE}/api/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (res.ok) {
      const data = await res.json();
      setToken(data.access);
      return data.access;
    }
  } catch (err) {
    console.error('Refresh token failed:', err);
  }

  clearToken();
  if (isBrowser()) window.location.href = '/login';
  return null;
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isAbsolute = /^https?:\/\//i.test(path);
  const url = isAbsolute ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  const isFormData = init.body instanceof FormData;

  const headers: HeadersInit = {
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
  };

  let res = await fetch(url, { ...init, headers });

  // Handle Token Expired (401)
  if (res.status === 401 && !url.includes('/api/token/refresh/')) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await doRefreshToken();
      isRefreshing = false;

      if (newToken) {
        onTokenRefreshed(newToken);
      }
    }

    if (isRefreshing) {
      // Wait for the token refresh to finish
      const newToken = await new Promise<string>((resolve) => {
        subscribeTokenRefresh((token) => resolve(token));
      });

      // Retry the request with the new token
      return apiFetch<T>(path, {
        ...init,
        headers: {
          ...init.headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
    }
    
    // If refresh failed and we are here, doRefreshToken already handled redirection
  }

  if (!res.ok) {
    try {
      const data = await res.json();
      let errorMsg = (data?.detail as string) || (data?.error as string);
      
      if (!errorMsg && typeof data === 'object' && data !== null) {
        // Try to extract validation errors (e.g., {"email": ["..."]})
        const values = Object.values(data);
        if (values.length > 0) {
          const firstErr = values[0];
          if (Array.isArray(firstErr)) errorMsg = firstErr[0];
          else if (typeof firstErr === 'string') errorMsg = firstErr;
        }
      }
      
      throw new Error(errorMsg || JSON.stringify(data) || `HTTP ${res.status}`);
    } catch (e: any) {
      if (e instanceof Error) throw e;
      throw new Error(`HTTP ${res.status}`);
    }
  }

  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? (res.json() as Promise<T>) : (res as unknown as T);
}

export const api = {
  get: <T>(p: string) => apiFetch<T>(p),
  post: <T>(p: string, body?: unknown) =>
    apiFetch<T>(p, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body ?? {}) }),
  put:  <T>(p: string, body?: unknown) =>
    apiFetch<T>(p, { method: 'PUT',  body: body instanceof FormData ? body : JSON.stringify(body ?? {}) }),
  patch:<T>(p: string, body?: unknown) =>
    apiFetch<T>(p, { method: 'PATCH',body: body instanceof FormData ? body : JSON.stringify(body ?? {}) }),
  del:  <T>(p: string) => apiFetch<T>(p, { method: 'DELETE' }),
};

export function mediaUrl(path?: string | null) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  // Add /media prefix if it's not already there
  const mediaPrefix = p.startsWith('/media/') ? '' : '/media';
  return `${IMG_BASE}${mediaPrefix}${p}`;
}
