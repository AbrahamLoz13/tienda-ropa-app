import { API_URL } from "@/config/api";
import { fetchWithTimeout } from "@/services/http";

export async function login(
  username: string,
  password: string,
): Promise<string> {
  const res = await fetchWithTimeout(`${API_URL}/api-token-auth/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (res.status === 400) {
    const data = await res.json().catch(() => null);
    if (data) throw new Error("CREDENCIALES");
    throw new Error("SERVIDOR");
  }
  if (!res.ok) throw new Error("SERVIDOR");

  const data = await res.json();
  return data.token;
}
