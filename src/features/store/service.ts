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
export type PaymentAccount = Schemas["ResponseStorePaymentAccount"];
export type CreatePaymentAccountInput = Schemas["RequestCreateStorePaymentAccount"];
export type Payment = Schemas["ResponsePayment"];

export async function getStore(): Promise<Store> {
  return api.get<Store>("/store");
}

export async function updateStore(body: UpdateStoreInput): Promise<Store> {
  return api.put<Store>("/store", body);
}

/**
 * Subconta de pagamento Asaas da loja (split). Resolve pela própria loja (token).
 * - GET    /store/payment-account                → status da conta (404 se ainda não criada)
 * - POST   /store/payment-account                → cria a subconta (Owner)
 * - POST   /store/payment-account/refresh-status → reconsulta o status no provedor (Owner)
 */
export async function getPaymentAccount(): Promise<PaymentAccount> {
  return api.get<PaymentAccount>("/store/payment-account");
}

export async function createPaymentAccount(body: CreatePaymentAccountInput): Promise<PaymentAccount> {
  return api.post<PaymentAccount>("/store/payment-account", body);
}

/** Reconsulta o status da subconta no provedor e devolve o estado atualizado (Owner). */
export async function refreshPaymentAccountStatus(): Promise<PaymentAccount> {
  return api.post<PaymentAccount>("/store/payment-account/refresh-status");
}

/** Estorna um pagamento (Manager). POST /store/payments/{paymentId}/refund. */
export async function refundPayment(paymentId: string): Promise<Payment> {
  return api.post<Payment>(`/store/payments/${encodeURIComponent(paymentId)}/refund`);
}
