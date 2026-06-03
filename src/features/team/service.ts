import { api } from "@/lib/api";
import type { components } from "@/lib/api-types";

type Schemas = components["schemas"];

export type TeamMember = Schemas["ResponseTeamMember"];
export type RequestAddTeamMember = Schemas["RequestAddTeamMember"];
export type RequestUpdateTeamMember = Schemas["RequestUpdateTeamMember"];

export async function listTeam(): Promise<TeamMember[]> {
  const data = await api.get<Schemas["ResponseTeamMembers"]>("/team");
  return data.members ?? [];
}

export async function addTeamMember(body: RequestAddTeamMember): Promise<TeamMember> {
  return api.post<TeamMember>("/team", body);
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
