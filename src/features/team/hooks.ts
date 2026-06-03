import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addTeamMember,
  listTeam,
  removeTeamMember,
  updateTeamMember,
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
