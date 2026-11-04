import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { API_URL } from "@/config/api";
import { apiFetch, setUnauthorizedHandler } from "@/services/api";
import { fetchWithTimeout } from "@/services/http";
import { deleteToken, getToken, saveToken } from "@/services/tokenStorage";

type User = { id: number; username: string; email: string; is_staff: boolean };

type AuthContextType = {
  token: string | null;
  user: User | null;
  isStaff: boolean;
  loading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getToken().then((t) => {
      setToken(t);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await deleteToken();
      setToken(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    apiFetch("/me/")
      .then((res) => (res.ok ? res.json() : null))
      .then(setUser)
      .catch(() => setUser(null));
  }, [token]);

  const signIn = async (newToken: string) => {
    await saveToken(newToken);
    setToken(newToken);
  };

  const signOut = async () => {
    const current = token;
    await deleteToken();
    setToken(null);
    if (current) {
      fetchWithTimeout(`${API_URL}/logout/`, {
        method: "POST",
        headers: { Authorization: `Token ${current}` },
      }).catch(() => {});
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isStaff: user?.is_staff ?? false,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
