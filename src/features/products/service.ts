import { api } from "@/lib/api";
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

export async function listProducts(): Promise<ProductShort[]> {
  const data = await api.get<Schemas["ResponseProducts"]>("/products");
  return data.products ?? [];
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

/**
 * Sobe um arquivo para o Azure Blob via Route Handler interno (`/api/uploads`)
 * e devolve a URL pública. NÃO usa `lib/api.ts` (JSON-only, aponta ao .NET):
 * é uma chamada multipart à rota do próprio Next. O token vai no Authorization
 * (gate v1 da rota só confere presença do Bearer).
 */
export async function uploadProductImage(file: File, token: string): Promise<{ url: string }> {
  const body = new FormData();
  body.append("file", file);

  const res = await fetch("/api/uploads", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });

  if (!res.ok) {
    let message = "Falha ao enviar a imagem.";
    try {
      const data = (await res.json()) as { errorMessages?: string[] };
      if (data?.errorMessages?.[0]) message = data.errorMessages[0];
    } catch {
      /* corpo vazio ou não-JSON */
    }
    throw new Error(message);
  }

  return (await res.json()) as { url: string };
}

// Reusa a fonte canônica da feature `categories` (evita duplicar GET /categories).
export { listCategories as listDashboardCategories } from "@/features/categories/service";
