import { api } from "@/lib/api";
import type { components } from "@/lib/api-types";

type Schemas = components["schemas"];

export type TeamMember = Schemas["ResponseTeamMember"];
export type RequestAddTeamMember = Schemas["RequestAddTeamMember"];

export async function addTeamMember(body: RequestAddTeamMember): Promise<TeamMember> {
  return api.post<TeamMember>("/team", body);
}
