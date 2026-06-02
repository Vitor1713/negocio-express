import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listOrders, updateOrderStatus } from "./service";

export const ORDERS_KEY = ["orders"] as const;

export function useOrders() {
  return useQuery({ queryKey: ORDERS_KEY, queryFn: listOrders });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ORDERS_KEY }),
  });
}
