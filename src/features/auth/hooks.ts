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
import { authService, type LoginInput, type StoreLoginInput, type TokenResponse } from "./service";

/** Traduz o erro da API numa mensagem amigável para o form. */
export function loginErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 400 || error.status === 401)
      return "E-mail ou senha inválidos.";
    return error.messages[0] ?? "Não foi possível entrar. Tente novamente.";
  }
  return "Não foi possível entrar. Tente novamente.";
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
