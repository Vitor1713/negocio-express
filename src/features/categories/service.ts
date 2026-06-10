/**
 * Service de categorias do lojista (dashboard). Resolve a loja pelo token.
 * Fonte canônica das categorias — reusada pelo módulo de Produtos.
 * - GET    /categories        → lista
 * - GET    /categories/{id}   → detalhe
 * - POST   /categories        → cria
 * - PUT    /categories/{id}   → atualiza
 * - DELETE /categories/{id}   → remove
 */
import { api } from "@/lib/api";
import type { components } from "@/lib/api-types";

type Schemas = components["schemas"];

export type Category = Schemas["ResponseCategory"];
export type RequestCategory = Schemas["RequestCategory"];

export async function listCategories(): Promise<Category[]> {
  const data = await api.get<Schemas["ResponseCategories"]>("/categories");
  return data.categories ?? [];
}

export async function getCategory(id: string): Promise<Category> {
  return api.get<Category>(`/categories/${id}`);
}

export async function createCategory(body: RequestCategory): Promise<Category> {
  return api.post<Category>("/categories", body);
}

export async function updateCategory(id: string, body: RequestCategory): Promise<void> {
  return api.put<void>(`/categories/${id}`, body);
}

export async function deleteCategory(id: string): Promise<void> {
  return api.delete<void>(`/categories/${id}`);
}

/** slug a partir de um texto livre (minúsculas, sem acento, hífens). */
export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
