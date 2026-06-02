import { api } from "@/lib/api";
import type { components } from "@/lib/api-types";

type Schemas = components["schemas"];

export type Address = Schemas["ResponseAddress"];
export type RequestAddress = Schemas["RequestAddress"];
export type Review = Schemas["ResponseReview"];
export type RequestCreateReview = Schemas["RequestCreateReview"];

const enc = encodeURIComponent;

export async function listAddresses(slug: string): Promise<Address[]> {
  const data = await api.get<Schemas["ResponseAddresses"]>(`/stores/${enc(slug)}/addresses`);
  return data.addresses ?? [];
}

export async function createAddress(slug: string, body: RequestAddress): Promise<Address> {
  return api.post<Address>(`/stores/${enc(slug)}/addresses`, body);
}

/**
 * Cria uma avaliação. O contrato exige productId (UUID), mas a API só
 * expõe productVariantId nos itens do pedido — enviamos o variantId como
 * melhor esforço; a API pode rejeitar se não corresponder a um productId válido.
 */
export async function createReview(slug: string, body: RequestCreateReview): Promise<Review> {
  return api.post<Review>(`/stores/${enc(slug)}/reviews`, body);
}
