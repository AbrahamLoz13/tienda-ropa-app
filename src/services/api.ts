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

  const esSubida =
    options.body instanceof FormData || options.body instanceof Uint8Array;
  const tieneTipo = Object.keys(headers).some(
    (k) => k.toLowerCase() === "content-type",
  );

  if (token) headers.Authorization = `Token ${token}`;
  if (options.body && !esSubida && !tieneTipo) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetchWithTimeout(
    `${API_URL}${path}`,
    { ...options, headers },
    esSubida ? 60000 : 10000,
  );
  if (res.status === 401 && token) onUnauthorized?.();
  return res;
}
