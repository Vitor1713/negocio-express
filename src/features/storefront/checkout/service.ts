import { api } from "@/lib/api";
import type { components } from "@/lib/api-types";

type Schemas = components["schemas"];

export type OrderResponse = Schemas["ResponseOrder"];
export type OrderPreview = Schemas["ResponseOrderPreview"];
export type PaymentResponse = Schemas["ResponsePayment"];
export type ValidatedCoupon = Schemas["ResponseValidatedCoupon"];
export type Address = Schemas["ResponseAddress"];

const enc = encodeURIComponent;

/**
 * Calcula subtotal/frete/desconto/total no backend antes de confirmar
 * (POST /stores/{slug}/orders/preview). Fonte da verdade dos valores — o
 * cálculo client-side (`calcTotals`) é só fallback enquanto isto carrega.
 */
export async function previewOrder(
  slug: string,
  body: Schemas["RequestCreateOrder"],
): Promise<OrderPreview> {
  return api.post<OrderPreview>(`/stores/${enc(slug)}/orders/preview`, body);
}

export async function validateCoupon(slug: string, code: string, subtotal: number): Promise<ValidatedCoupon> {
  return api.post<ValidatedCoupon>(`/stores/${enc(slug)}/coupons/validate`, { code, subtotal }, { auth: false });
}

export async function createOrder(slug: string, body: Schemas["RequestCreateOrder"]): Promise<OrderResponse> {
  return api.post<OrderResponse>(`/stores/${enc(slug)}/orders`, body);
}

export async function createPayment(slug: string, orderId: string, method: string): Promise<PaymentResponse> {
  return api.post<PaymentResponse>(`/stores/${enc(slug)}/orders/${enc(orderId)}/payment`, { method });
}

export async function listAddresses(slug: string): Promise<Address[]> {
  const data = await api.get<Schemas["ResponseAddresses"]>(`/stores/${enc(slug)}/addresses`);
  return data.addresses ?? [];
}

export async function createAddress(slug: string, body: Schemas["RequestAddress"]): Promise<Address> {
  return api.post<Address>(`/stores/${enc(slug)}/addresses`, body);
}
