"use client";

/**
 * Hooks de login (TanStack Query mutations).
 *
 * Cada hook encapsula o fluxo completo: chama a API → guarda o token no
 * contexto de auth → redireciona pelo role do token. A página só fornece os
 * valores do form e lê isPending / error para os estados de loading e erro.
 */
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { useAuth } from "./auth-context";
import { decodeToken } from "./jwt";
import { resolveHome } from "./redirect";
import {
  authService,
  type CustomerRegisterInput,
  type ForgotPasswordInput,
  type LoginInput,
  type MessageResponse,
  type ResetPasswordInput,
  type StoreLoginInput,
  type TokenResponse,
} from "./service";

/** Traduz o erro da API numa mensagem amigável para o form. */
export function loginErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 400 || error.status === 401)
      return "E-mail ou senha inválidos.";
    return error.messages[0] ?? "Não foi possível entrar. Tente novamente.";
  }
  return "Não foi possível entrar. Tente novamente.";
}

/** Traduz o erro de cadastro do cliente. */
export function registerErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) return "Já existe uma conta com este e-mail.";
    return error.messages[0] ?? "Não foi possível criar sua conta. Tente novamente.";
  }
  return "Não foi possível criar sua conta. Tente novamente.";
}

/** Traduz erros do fluxo de recuperação de senha. */
export function recoveryErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.messages[0] ?? "Não foi possível concluir. Tente novamente.";
  }
  return "Não foi possível concluir. Tente novamente.";
}

/** Login do painel do lojista → redireciona por role (Lojista/Owner → /dashboard). */
export function useLojistaLogin(): UseMutationResult<TokenResponse, unknown, LoginInput> {
  const { login } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: async (body: LoginInput) => {
      const res = await authService.loginLojista(body);
      if (!res.token) throw new ApiError(502, ["Resposta de login sem token."]);
      return res;
    },
    onSuccess: (res) => {
      login(res.token!);
      router.replace(resolveHome(decodeToken(res.token!)?.role ?? null));
    },
  });
}

/** Login do cliente na vitrine → Customer volta para /stores/{slug}. */
export function useCustomerLogin(
  slug: string,
): UseMutationResult<TokenResponse, unknown, StoreLoginInput> {
  const { login } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: async (body: StoreLoginInput) => {
      const res = await authService.loginCustomer(slug, body);
      if (!res.token) throw new ApiError(502, ["Resposta de login sem token."]);
      return res;
    },
    onSuccess: (res) => {
      login(res.token!);
      router.replace(resolveHome(decodeToken(res.token!)?.role ?? null, slug));
    },
  });
}

/** Solicita o e-mail de recuperação de senha. */
export function useForgotPassword(): UseMutationResult<MessageResponse, unknown, ForgotPasswordInput> {
  return useMutation({ mutationFn: (body: ForgotPasswordInput) => authService.forgotPassword(body) });
}

/** Redefine a senha com o token do e-mail → leva para o login ao concluir. */
export function useResetPassword(): UseMutationResult<MessageResponse, unknown, ResetPasswordInput> {
  return useMutation({ mutationFn: (body: ResetPasswordInput) => authService.resetPassword(body) });
}

/** Cadastro do cliente na vitrine → login automático e volta para /stores/{slug}. */
export function useCustomerRegister(
  slug: string,
): UseMutationResult<TokenResponse, unknown, CustomerRegisterInput> {
  const { login } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: async (body: CustomerRegisterInput) => {
      const res = await authService.registerCustomer(slug, body);
      if (!res.token) throw new ApiError(502, ["Resposta de cadastro sem token."]);
      return res;
    },
    onSuccess: (res) => {
      login(res.token!);
      router.replace(resolveHome(decodeToken(res.token!)?.role ?? null, slug));
    },
  });
}
