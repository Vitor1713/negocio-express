import { useMutation } from "@tanstack/react-query";
import { addTeamMember, type RequestAddTeamMember } from "./service";

/**
 * Não há GET /team no contrato — só POST. A listagem é mantida na sessão
 * (estado do componente) com os membros adicionados durante o uso.
 */
export function useAddTeamMember() {
  return useMutation({ mutationFn: (body: RequestAddTeamMember) => addTeamMember(body) });
}
