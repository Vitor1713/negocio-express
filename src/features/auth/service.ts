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
export type CustomerRegisterInput = Schemas["RequestRegisterCustomer"];
export type ForgotPasswordInput = Schemas["RequestForgotPassword"];
export type ResetPasswordInput = Schemas["RequestResetPassword"];
export type TokenResponse = Schemas["ResponseToken"];
export type MessageResponse = Schemas["ResponseMessage"];

export const authService = {
  /** Login do painel do lojista. */
  loginLojista: (body: LoginInput) =>
    api.post<TokenResponse>("/auth/login", body, { auth: false }),

  /**
   * Renova o token da sessão (POST /auth/refresh). Não tem body: o backend
   * renova a partir do bearer atual — por isso deve ser chamado **antes** de
   * o token expirar, enquanto ainda é válido. 401 = sessão não renovável.
   */
  refresh: () => api.post<TokenResponse>("/auth/refresh", undefined),

  /** Solicita o e-mail de recuperação de senha (público). */
  forgotPassword: (body: ForgotPasswordInput) =>
    api.post<MessageResponse>("/auth/forgot-password", body, { auth: false }),

  /** Redefine a senha a partir do token recebido por e-mail (público). */
  resetPassword: (body: ResetPasswordInput) =>
    api.post<MessageResponse>("/auth/reset-password", body, { auth: false }),

  /** Login do cliente na vitrine de uma loja específica. */
  loginCustomer: (slug: string, body: StoreLoginInput) =>
    api.post<TokenResponse>(`/stores/${encodeURIComponent(slug)}/auth/login`, body, {
      auth: false,
    }),

  /** Cadastro do cliente na vitrine — retorna token (login automático). */
  registerCustomer: (slug: string, body: CustomerRegisterInput) =>
    api.post<TokenResponse>(`/stores/${encodeURIComponent(slug)}/auth/register`, body, {
      auth: false,
    }),
};
