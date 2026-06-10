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
import { ApiError, setTokenProvider } from "@/lib/api";
import { decodeToken, isExpired, type AuthClaims, type Role, type StoreRole } from "./jwt";
import { authService } from "./service";
import { tokenStorage } from "./storage";

/** Renova o token este tanto de tempo ANTES de expirar (enquanto ainda é válido). */
const REFRESH_SKEW_MS = 60_000;

type AuthContextValue = {
  token: string | null;
  claims: AuthClaims | null;
  role: Role | null;
  /** Papel na loja (Owner/Manager/Staff) — usar nas guardas de permissão. */
  storeRole: StoreRole | null;
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

  // Renovação proativa: agenda um POST /auth/refresh pouco antes de o token
  // expirar (enquanto o bearer atual ainda é aceito). Sucesso → novo token
  // reagenda o ciclo; 401 → sessão encerrada. Reroda a cada troca de token.
  useEffect(() => {
    if (!token) return;
    const exp = decodeToken(token)?.exp;
    if (!exp) return; // sem expiração conhecida → não há o que agendar

    // Nunca dispara em loop imediato: pelo menos 5s mesmo se já estiver na janela.
    const delay = Math.max(5_000, exp * 1000 - Date.now() - REFRESH_SKEW_MS);
    const timer = setTimeout(async () => {
      try {
        const res = await authService.refresh();
        if (res.token) login(res.token);
      } catch (err) {
        // Sessão não renovável → encerra. Erros transitórios (rede) preservam a sessão.
        if (err instanceof ApiError && err.isAuth) logout();
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [token, login, logout]);

  const value = useMemo<AuthContextValue>(() => {
    const claims = token ? decodeToken(token) : null;
    return {
      token,
      claims,
      role: claims?.role ?? null,
      storeRole: claims?.storeRole ?? null,
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
