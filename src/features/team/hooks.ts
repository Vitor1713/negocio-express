"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { useAuth, decodeToken, resolveHome } from "@/features/auth";
import {
  acceptInvite,
  addTeamMember,
  getInvite,
  listTeam,
  removeTeamMember,
  updateTeamMember,
  type RequestAcceptInvite,
  type RequestAddTeamMember,
  type RequestUpdateTeamMember,
} from "./service";

export const TEAM_KEY = ["team"] as const;

export function useTeam() {
  return useQuery({ queryKey: TEAM_KEY, queryFn: listTeam });
}

export function useAddTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RequestAddTeamMember) => addTeamMember(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: TEAM_KEY }),
  });
}

export function useUpdateTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, body }: { memberId: string; body: RequestUpdateTeamMember }) =>
      updateTeamMember(memberId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: TEAM_KEY }),
  });
}

export function useRemoveTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => removeTeamMember(memberId),
    onSuccess: () => qc.invalidateQueries({ queryKey: TEAM_KEY }),
  });
}

/** Valida o token do convite (tela de aceite). `enabled` desliga quando não há token. */
export function useInvite(token: string | null) {
  return useQuery({
    queryKey: ["team-invite", token],
    queryFn: () => getInvite(token!),
    enabled: !!token,
    retry: false,
  });
}

/** Aceita o convite, define a senha → login automático e leva ao painel. */
export function useAcceptInvite() {
  const { login } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: async (body: RequestAcceptInvite) => {
      const res = await acceptInvite(body);
      if (!res.token) throw new ApiError(502, ["Resposta de convite sem token."]);
      return res;
    },
    onSuccess: (res) => {
      login(res.token!);
      router.replace(resolveHome(decodeToken(res.token!)?.role ?? null));
    },
  });
}

/** Traduz o erro do aceite de convite numa mensagem amigável. */
export function acceptInviteErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 404 || error.status === 410)
      return "Este convite é inválido ou expirou. Peça um novo ao dono da loja.";
    return error.messages[0] ?? "Não foi possível concluir. Tente novamente.";
  }
  return "Não foi possível concluir. Tente novamente.";
}
