import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createOrder,
  createPayment,
  getCustomerOrder,
  listAddresses,
  previewOrder,
  validateCoupon,
  type PaymentInput,
} from "./service";
import type { components } from "@/lib/api-types";

export function useAddresses(slug: string) {
  return useQuery({
    queryKey: ["addresses", slug],
    queryFn: () => listAddresses(slug),
    retry: false,
  });
}

export function useValidateCoupon(slug: string) {
  return useMutation({
    mutationFn: ({ code, subtotal }: { code: string; subtotal: number }) =>
      validateCoupon(slug, code, subtotal),
  });
}

type PreviewBody = components["schemas"]["RequestCreateOrder"];

/**
 * Preview autoritativo dos totais. Roda quando há itens e o usuário já passou
 * do carrinho (`enabled`); refaz sozinho ao mudar entrega/endereço/cupom/itens.
 */
export function usePreviewOrder(slug: string, body: PreviewBody, enabled: boolean) {
  return useQuery({
    queryKey: ["order-preview", slug, body],
    queryFn: () => previewOrder(slug, body),
    enabled: enabled && (body.items?.length ?? 0) > 0,
    retry: false,
    staleTime: 0,
    placeholderData: (prev) => prev,
  });
}

export function useCreateOrder(slug: string) {
  return useMutation({
    mutationFn: (body: components["schemas"]["RequestCreateOrder"]) => createOrder(slug, body),
  });
}

export function useCreatePayment(slug: string) {
  return useMutation({
    mutationFn: ({ orderId, input }: { orderId: string; input: PaymentInput }) =>
      createPayment(slug, orderId, input),
  });
}

/**
 * Polling do status do pedido (PIX). Refaz a cada 4s enquanto `Pending`;
 * para sozinho quando o pedido vira `Confirmed`/`Cancelled` (estado terminal).
 */
export function useOrderStatusPolling(slug: string, orderId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["order-status", slug, orderId],
    queryFn: () => getCustomerOrder(slug, orderId!),
    enabled: enabled && !!orderId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "Confirmed" || status === "Cancelled" ? false : 4000;
    },
    refetchIntervalInBackground: true,
  });
}
