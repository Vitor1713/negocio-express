"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStore, updateStore, type UpdateStoreInput } from "./service";

export const STORE_KEY = ["store"] as const;

/** Dados da loja do lojista logado (GET /store). */
export function useStore() {
  return useQuery({ queryKey: STORE_KEY, queryFn: getStore });
}

/** Atualiza a loja (PUT /store) e semeia o cache com a resposta. */
export function useUpdateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateStoreInput) => updateStore(body),
    onSuccess: (store) => qc.setQueryData(STORE_KEY, store),
  });
}
