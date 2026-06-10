import { api } from "@/lib/api";
import type { components } from "@/lib/api-types";

type Schemas = components["schemas"];

export type Address = Schemas["ResponseAddress"];
export type RequestAddress = Schemas["RequestAddress"];
export type Review = Schemas["ResponseReview"];
export type RequestCreateReview = Schemas["RequestCreateReview"];
export type CustomerOrder = Schemas["ResponseOrder"];

const enc = encodeURIComponent;

export async function listAddresses(slug: string): Promise<Address[]> {
  const data = await api.get<Schemas["ResponseAddresses"]>(`/stores/${enc(slug)}/addresses`);
  return data.addresses ?? [];
}

/** Histórico de pedidos do cliente autenticado na loja. */
export async function listCustomerOrders(slug: string, status?: string): Promise<CustomerOrder[]> {
  const data = await api.get<Schemas["ResponseCustomerOrders"]>(`/stores/${enc(slug)}/orders`, {
    query: { status },
  });
  return data.orders ?? [];
}

export async function createAddress(slug: string, body: RequestAddress): Promise<Address> {
  return api.post<Address>(`/stores/${enc(slug)}/addresses`, body);
}

/**
 * Cria uma avaliação. Exige orderId + productId (UUID). O productId vem do
 * item do pedido (ResponseOrderItem.productId), retornado por listCustomerOrders.
 */
export async function createReview(slug: string, body: RequestCreateReview): Promise<Review> {
  return api.post<Review>(`/stores/${enc(slug)}/reviews`, body);
}
