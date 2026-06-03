/**
 * Service de cupons do lojista (dashboard). Resolve a loja pelo token.
 * - GET    /coupons        → lista
 * - GET    /coupons/{id}   → detalhe
 * - POST   /coupons        → cria
 * - PUT    /coupons/{id}   → atualiza
 * - DELETE /coupons/{id}   → remove
 *
 * (A validação pública na vitrine usa `/stores/{slug}/coupons/validate` — outra feature.)
 */
import { api } from "@/lib/api";
import type { components } from "@/lib/api-types";

type Schemas = components["schemas"];

export type Coupon = Schemas["ResponseCoupon"];
export type RequestCoupon = Schemas["RequestCoupon"];

export async function listCoupons(): Promise<Coupon[]> {
  const data = await api.get<Schemas["ResponseCoupons"]>("/coupons");
  return data.coupons ?? [];
}

export async function getCoupon(id: string): Promise<Coupon> {
  return api.get<Coupon>(`/coupons/${id}`);
}

export async function createCoupon(body: RequestCoupon): Promise<Coupon> {
  return api.post<Coupon>("/coupons", body);
}

export async function updateCoupon(id: string, body: RequestCoupon): Promise<void> {
  return api.put<void>(`/coupons/${id}`, body);
}

export async function deleteCoupon(id: string): Promise<void> {
  return api.delete<void>(`/coupons/${id}`);
}
