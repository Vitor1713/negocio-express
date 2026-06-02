import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createOrder,
  createPayment,
  listAddresses,
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
