import { api } from "@/lib/api";
import { uploadImage } from "@/lib/upload-image";
import type { components } from "@/lib/api-types";

type Schemas = components["schemas"];

export type Product = Schemas["ResponseProduct"];
export type ProductShort = Schemas["ResponseProductShort"];
export type ProductVariant = Schemas["ResponseProductVariant"];
export type ProductImage = Schemas["ResponseProductImage"];
// Categorias têm dono próprio (feature `categories`); reexporta p/ compatibilidade.
export type { Category } from "@/features/categories/service";
export type RequestProduct = Schemas["RequestProduct"];
export type RequestProductVariant = Schemas["RequestProductVariant"];
export type RequestProductImage = Schemas["RequestProductImage"];

/** Tamanho de página padrão do scroll infinito do dashboard. */
export const PRODUCTS_PAGE_SIZE = 20;

export type ProductsPage = {
  products: ProductShort[];
  total: number;
  hasMore: boolean;
};

export type ListProductsParams = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export async function listProducts(params: ListProductsParams = {}): Promise<ProductsPage> {
  const { page = 1, pageSize = PRODUCTS_PAGE_SIZE, search } = params;
  const data = await api.get<Schemas["ResponseProducts"]>("/products", {
    query: { page, pageSize, search: search?.trim() || undefined },
  });
  return {
    products: data.products ?? [],
    total: Number(data.total ?? 0),
    hasMore: data.hasMore ?? false,
  };
}

export async function getProduct(id: string): Promise<Product> {
  return api.get<Product>(`/products/${id}`);
}

export async function createProduct(body: RequestProduct): Promise<ProductShort> {
  return api.post<ProductShort>("/products", body);
}

export async function updateProduct(id: string, body: RequestProduct): Promise<void> {
  return api.put<void>(`/products/${id}`, body);
}

export async function deleteProduct(id: string): Promise<void> {
  return api.delete<void>(`/products/${id}`);
}

export async function addVariant(productId: string, body: RequestProductVariant): Promise<ProductVariant> {
  return api.post<ProductVariant>(`/products/${productId}/variants`, body);
}

export async function updateVariant(variantId: string, body: RequestProductVariant): Promise<void> {
  return api.put<void>(`/products/variants/${variantId}`, body);
}

export async function deleteVariant(variantId: string): Promise<void> {
  return api.delete<void>(`/products/variants/${variantId}`);
}

export async function addImage(productId: string, body: RequestProductImage): Promise<ProductImage> {
  return api.post<ProductImage>(`/products/${productId}/images`, body);
}

export async function deleteImage(imageId: string): Promise<void> {
  return api.delete<void>(`/products/images/${imageId}`);
}

/** Sobe a imagem do produto ao Azure Blob via `/api/uploads`. Ver `lib/upload-image`. */
export const uploadProductImage = uploadImage;

// Reusa a fonte canônica da feature `categories` (evita duplicar GET /categories).
export { listCategories as listDashboardCategories } from "@/features/categories/service";
