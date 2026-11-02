import { API_URL } from "@/config/api";
import { fetchWithTimeout } from "@/services/http";
import { getToken } from "@/services/tokenStorage";
let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  onUnauthorized = fn;
};

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = await getToken();
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) ?? {}),
  };

  if (token) headers.Authorization = `Token ${token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetchWithTimeout(`${API_URL}${path}`, {
    ...options,
    headers,
  });
  if (res.status === 401 && token) onUnauthorized?.();
  return res;
}
