import { api } from "@/lib/api";
import type { components } from "@/lib/api-types";

type Schemas = components["schemas"];

export type TeamMember = Schemas["ResponseTeamMember"];
export type RequestAddTeamMember = Schemas["RequestAddTeamMember"];
export type RequestUpdateTeamMember = Schemas["RequestUpdateTeamMember"];
export type RequestAcceptInvite = Schemas["RequestAcceptInvite"];
export type InviteInfo = Schemas["ResponseInviteInfo"];
export type TokenResponse = Schemas["ResponseToken"];

export async function listTeam(): Promise<TeamMember[]> {
  const data = await api.get<Schemas["ResponseTeamMembers"]>("/team");
  return data.members ?? [];
}

/** Convida um membro (POST /team) — cria o membro pendente e dispara o e-mail de convite. */
export async function addTeamMember(body: RequestAddTeamMember): Promise<TeamMember> {
  return api.post<TeamMember>("/team", body);
}

/** Valida o token do convite e retorna os dados da tela de aceite (GET /team/invite/{token}, público). */
export async function getInvite(token: string): Promise<InviteInfo> {
  return api.get<InviteInfo>(`/team/invite/${encodeURIComponent(token)}`, { auth: false });
}

/** Aceita o convite definindo a senha (POST /team/accept, público) — retorna token (login automático). */
export async function acceptInvite(body: RequestAcceptInvite): Promise<TokenResponse> {
  return api.post<TokenResponse>("/team/accept", body, { auth: false });
}

/** Atualiza a função de um membro (PUT /team/{memberId}). Só `role` é editável. */
export async function updateTeamMember(
  memberId: string,
  body: RequestUpdateTeamMember,
): Promise<TeamMember> {
  return api.put<TeamMember>(`/team/${encodeURIComponent(memberId)}`, body);
}

/** Remove um membro da equipe (DELETE /team/{memberId}, 204). */
export async function removeTeamMember(memberId: string): Promise<void> {
  return api.delete<void>(`/team/${encodeURIComponent(memberId)}`);
}
