/**
 * Service de autenticação — chamadas tipadas à API via cliente central.
 *
 * Dois endpoints (multi-tenant):
 * - Painel (lojista):  POST /auth/login              → resolve a loja pelo token
 * - Vitrine (cliente): POST /stores/{slug}/auth/login → loja vem do slug da rota
 *
 * Ambas são públicas (sem token): { auth: false }. Tipos sempre de api-types.
 */
import { api } from "@/lib/api";
import type { components } from "@/lib/api-types";

type Schemas = components["schemas"];

export type LoginInput = Schemas["RequestLogin"];
export type StoreLoginInput = Schemas["RequestLoginStore"];
export type TokenResponse = Schemas["ResponseToken"];

export const authService = {
  /** Login do painel do lojista. */
  loginLojista: (body: LoginInput) =>
    api.post<TokenResponse>("/auth/login", body, { auth: false }),

  /** Login do cliente na vitrine de uma loja específica. */
  loginCustomer: (slug: string, body: StoreLoginInput) =>
    api.post<TokenResponse>(`/stores/${encodeURIComponent(slug)}/auth/login`, body, {
      auth: false,
    }),
};
