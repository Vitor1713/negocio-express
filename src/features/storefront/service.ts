import { api } from "@/lib/api";
import type { components } from "@/lib/api-types";

type Schemas = components["schemas"];

export type CatalogProduct = Schemas["ResponseCatalogProduct"];
export type CatalogProductDetail = Schemas["ResponseCatalogProductDetail"];
export type CatalogVariant = Schemas["ResponseCatalogVariant"];
export type CatalogImage = Schemas["ResponseCatalogImage"];
export type CatalogReview = Schemas["ResponseCatalogReview"];
export type StoreCategory = Schemas["ResponseCategory"];
export type PublicStore = Schemas["ResponsePublicStore"];

const enc = encodeURIComponent;

/** Dados públicos da loja (nome, status, taxa/mínimo de entrega) — para header e SEO. */
export async function getStore(slug: string): Promise<PublicStore> {
  return api.get<PublicStore>(`/stores/${enc(slug)}`, { auth: false });
}

/** Catálogo público de uma loja. Filtros opcionais via query (server-side). */
export async function listStoreProducts(
  slug: string,
  filters?: { search?: string; categoryId?: string },
  signal?: AbortSignal,
): Promise<CatalogProduct[]> {
  const data = await api.get<Schemas["ResponseCatalogProducts"]>(`/stores/${enc(slug)}/products`, {
    auth: false,
    signal,
    query: { search: filters?.search, categoryId: filters?.categoryId },
  });
  return data.products ?? [];
}

/** Detalhe público de um produto (variações, imagens, avaliações). */
export async function getStoreProduct(
  slug: string,
  productSlug: string,
): Promise<CatalogProductDetail> {
  return api.get<CatalogProductDetail>(`/stores/${enc(slug)}/products/${enc(productSlug)}`, {
    auth: false,
  });
}

/** Categorias públicas da loja (para o filtro do catálogo). */
export async function listStoreCategories(slug: string): Promise<StoreCategory[]> {
  const data = await api.get<Schemas["ResponseCategories"]>(`/stores/${enc(slug)}/categories`, {
    auth: false,
  });
  return (data.categories ?? []).filter((c) => c.isActive);
}
