import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrder, getStatusFlow, listOrders, updateOrderStatus } from "./service";

export const ORDERS_KEY = ["orders"] as const;
export const STATUS_FLOW_KEY = ["orders", "status-flow"] as const;

export function useOrders() {
  return useQuery({ queryKey: ORDERS_KEY, queryFn: listOrders });
}

export function useOrder(id: string | null) {
  return useQuery({
    queryKey: [...ORDERS_KEY, id],
    queryFn: () => getOrder(id as string),
    enabled: !!id,
  });
}

/** Fluxo de status (raramente muda) — cache longo. */
export function useStatusFlow() {
  return useQuery({ queryKey: STATUS_FLOW_KEY, queryFn: getStatusFlow, staleTime: 1000 * 60 * 30 });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ORDERS_KEY });
      qc.invalidateQueries({ queryKey: [...ORDERS_KEY, id] });
    },
  });
}
