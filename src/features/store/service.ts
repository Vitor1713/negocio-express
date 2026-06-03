/**
 * Service da loja do lojista (dashboard). Resolve a loja pelo token — sem slug.
 * - GET /store  → dados da loja (ResponseStore)
 * - PUT /store  → atualiza dados (RequestUpdateStore) e devolve a loja
 */
import { api } from "@/lib/api";
import type { components } from "@/lib/api-types";

type Schemas = components["schemas"];

export type Store = Schemas["ResponseStore"];
export type UpdateStoreInput = Schemas["RequestUpdateStore"];

export async function getStore(): Promise<Store> {
  return api.get<Store>("/store");
}

export async function updateStore(body: UpdateStoreInput): Promise<Store> {
  return api.put<Store>("/store", body);
}
