import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createDeliverer, listDeliverers, type RequestCreateDeliverer } from "./service";

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
