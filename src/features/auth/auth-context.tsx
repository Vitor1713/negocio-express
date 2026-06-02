"use client";

/**
 * Contexto de autenticação. Guarda o token, expõe claims (role/storeId)
 * e conecta o token ao cliente HTTP central via setTokenProvider.
 *
 * As telas de login (Fase 1) chamam `login(token)` após o POST de auth.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { setTokenProvider } from "@/lib/api";
import { decodeToken, isExpired, type AuthClaims, type Role } from "./jwt";
import { tokenStorage } from "./storage";

type AuthContextValue = {
  token: string | null;
  claims: AuthClaims | null;
  role: Role | null;
  storeId: string | null;
  isAuthenticated: boolean;
  /** true até hidratar o token do storage (evita flash/redirect indevido). */
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);

  // Liga o cliente HTTP ao token atual (lê do ref para evitar stale closure).
  useEffect(() => {
    setTokenProvider(() => tokenRef.current);
  }, []);

  // Hidrata a sessão do storage no mount.
  useEffect(() => {
    const stored = tokenStorage.get();
    if (stored && !isExpired(decodeToken(stored))) {
      tokenRef.current = stored;
      setToken(stored);
    } else if (stored) {
      tokenStorage.clear();
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((next: string) => {
    tokenRef.current = next;
    tokenStorage.set(next);
    setToken(next);
  }, []);

  const logout = useCallback(() => {
    tokenRef.current = null;
    tokenStorage.clear();
    setToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const claims = token ? decodeToken(token) : null;
    return {
      token,
      claims,
      role: claims?.role ?? null,
      storeId: claims?.storeId ?? null,
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      logout,
    };
  }, [token, isLoading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>.");
  return ctx;
}
