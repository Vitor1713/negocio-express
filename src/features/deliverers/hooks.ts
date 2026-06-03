import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignDeliverer,
  createDeliverer,
  deleteDeliverer,
  listDeliverers,
  updateDeliverer,
  type RequestCreateDeliverer,
  type RequestUpdateDeliverer,
} from "./service";

export const DELIVERERS_KEY = ["deliverers"] as const;

export function useDeliverers() {
  return useQuery({ queryKey: DELIVERERS_KEY, queryFn: listDeliverers });
}

export function useCreateDeliverer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RequestCreateDeliverer) => createDeliverer(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: DELIVERERS_KEY }),
  });
}

export function useUpdateDeliverer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: RequestUpdateDeliverer }) =>
      updateDeliverer(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: DELIVERERS_KEY }),
  });
}

export function useDeleteDeliverer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDeliverer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: DELIVERERS_KEY }),
  });
}

/**
 * Atribuição de entregador a uma entrega. Pronto para uso, mas a UI só pode
 * ser ligada quando o contrato expuser um `deliveryId` (ver service.ts).
 */
export function useAssignDeliverer() {
  return useMutation({
    mutationFn: ({ deliveryId, delivererId }: { deliveryId: string; delivererId: string }) =>
      assignDeliverer(deliveryId, delivererId),
  });
}
