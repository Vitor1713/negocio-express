import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createOrder,
  createPayment,
  listAddresses,
  previewOrder,
  validateCoupon,
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
    mutationFn: ({ orderId, method }: { orderId: string; method: string }) =>
      createPayment(slug, orderId, method),
  });
}
