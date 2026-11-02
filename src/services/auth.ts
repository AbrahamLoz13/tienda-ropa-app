import { API_URL } from "@/config/api";
import { fetchWithTimeout } from "@/services/http";

export type RegisterErrors = Partial<
  Record<"username" | "email" | "password", string>
>;
export type ValidationError = Error & { fields: RegisterErrors };

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

export async function register(
  username: string,
  email: string,
  password: string,
): Promise<string> {
  const res = await fetchWithTimeout(`${API_URL}/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  if (res.status === 400) {
    const data = await res.json().catch(() => null);
    if (!data) throw new Error("SERVIDOR");
    const fields: RegisterErrors = {};
    for (const key of ["username", "email", "password"] as const) {
      if (Array.isArray(data[key]) && data[key].length)
        fields[key] = data[key].join(" ");
    }
    throw Object.assign(new Error("VALIDACION"), { fields });
  }
  if (!res.ok) throw new Error("SERVIDOR");

  const data = await res.json();
  return data.token;
}
