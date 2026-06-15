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

/** Tamanho de página padrão do scroll infinito da vitrine. */
export const CATALOG_PAGE_SIZE = 20;

export type CatalogPage = {
  products: CatalogProduct[];
  total: number;
  hasMore: boolean;
};

export type ListStoreProductsParams = {
  search?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
};

/** Catálogo público de uma loja, paginado (scroll infinito). Filtros server-side. */
export async function listStoreProducts(
  slug: string,
  params?: ListStoreProductsParams,
  signal?: AbortSignal,
): Promise<CatalogPage> {
  const { search, categoryId, page = 1, pageSize = CATALOG_PAGE_SIZE } = params ?? {};
  const data = await api.get<Schemas["ResponseCatalogProducts"]>(`/stores/${enc(slug)}/products`, {
    auth: false,
    signal,
    query: { search: search?.trim() || undefined, categoryId, page, pageSize },
  });
  return {
    products: data.products ?? [],
    total: Number(data.total ?? 0),
    hasMore: data.hasMore ?? false,
  };
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
