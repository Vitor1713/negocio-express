import { api, ApiError } from "@/lib/api";
import type { components } from "@/lib/api-types";

type Schemas = components["schemas"];

export type OrderResponse = Schemas["ResponseOrder"];
export type OrderPreview = Schemas["ResponseOrderPreview"];
export type PaymentResponse = Schemas["ResponsePayment"];
export type ValidatedCoupon = Schemas["ResponseValidatedCoupon"];
export type Address = Schemas["ResponseAddress"];

/** Métodos aceitos no checkout. O enum do back tem mais valores; só estes dois entram. */
export type PaymentMethod = "Pix" | "CreditCard";

/** Body de pagamento (espelha RequestPayment). CPF/CNPJ vai só com dígitos. */
export type PaymentInput = {
  method: PaymentMethod;
  customerCpfCnpj: string;
  creditCardToken?: string;
  installments?: number;
};

const enc = encodeURIComponent;

/** Gera uma Idempotency-Key (uuid) para evitar pedido duplicado em retry/duplo-clique. */
function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

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
  return api.post<OrderResponse>(`/stores/${enc(slug)}/orders`, body, {
    headers: { "Idempotency-Key": newIdempotencyKey() },
  });
}

export async function createPayment(
  slug: string,
  orderId: string,
  input: PaymentInput,
): Promise<PaymentResponse> {
  const body: Schemas["RequestPayment"] =
    input.method === "CreditCard"
      ? {
          method: "CreditCard",
          customerCpfCnpj: input.customerCpfCnpj,
          creditCardToken: input.creditCardToken,
          installments: input.installments ?? 1,
        }
      : { method: "Pix", customerCpfCnpj: input.customerCpfCnpj };
  return api.post<PaymentResponse>(`/stores/${enc(slug)}/orders/${enc(orderId)}/payment`, body);
}

/**
 * Acompanha o status do pedido (não há GET de pagamento p/ o cliente).
 * Usado no polling do PIX: localiza o pedido pelo id na lista do cliente.
 */
export async function getCustomerOrder(slug: string, orderId: string): Promise<OrderResponse | null> {
  const data = await api.get<Schemas["ResponseCustomerOrders"]>(`/stores/${enc(slug)}/orders`);
  return (data.orders ?? []).find((o) => o.id === orderId) ?? null;
}

/**
 * Códigos de erro do checkout (corpo `ResponseError.errorMessages`) → mensagem
 * amigável em pt-BR. O back pode mandar o código cru ou já uma frase; mapeamos
 * o que reconhecemos e caímos na mensagem da API quando não houver match.
 */
const CHECKOUT_ERROR_MESSAGES: Record<string, string> = {
  STORE_ACCOUNT_NOT_APPROVED:
    "Esta loja ainda não está habilitada a receber pagamentos. Tente novamente mais tarde.",
  ORDER_ALREADY_PAID: "Este pedido já foi pago.",
  ORDER_NOT_PAYABLE: "Este pedido não pode mais ser pago.",
  METHOD_NOT_SUPPORTED: "Esta forma de pagamento não está disponível nesta loja.",
  INSUFFICIENT_STOCK: "Um ou mais itens ficaram sem estoque. Revise seu carrinho.",
};

/** Traduz um erro de checkout para uma mensagem amigável ao cliente. */
export function checkoutErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    for (const [code, friendly] of Object.entries(CHECKOUT_ERROR_MESSAGES)) {
      if (err.messages.some((m) => m.toUpperCase().includes(code))) return friendly;
    }
    return err.messages[0] ?? "Não foi possível concluir o pagamento. Tente novamente.";
  }
  return "Erro ao finalizar o pedido. Tente novamente.";
}

export async function listAddresses(slug: string): Promise<Address[]> {
  const data = await api.get<Schemas["ResponseAddresses"]>(`/stores/${enc(slug)}/addresses`);
  return data.addresses ?? [];
}

export async function createAddress(slug: string, body: Schemas["RequestAddress"]): Promise<Address> {
  return api.post<Address>(`/stores/${enc(slug)}/addresses`, body);
}
