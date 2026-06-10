"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  updateCategory,
  type RequestCategory,
} from "./service";

/** Mesma key usada pelo módulo de Produtos — invalidar aqui atualiza ambos. */
export const CATEGORIES_KEY = ["categories"] as const;

export function useCategories() {
  return useQuery({ queryKey: CATEGORIES_KEY, queryFn: listCategories });
}

export function useCategory(id: string | null) {
  return useQuery({
    queryKey: [...CATEGORIES_KEY, id],
    queryFn: () => getCategory(id as string),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RequestCategory) => createCategory(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: RequestCategory }) => updateCategory(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}
