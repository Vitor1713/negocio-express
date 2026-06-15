"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { uploadImage } from "@/lib/upload-image";
import { useAuth } from "@/features/auth";
import {
  createPaymentAccount,
  getPaymentAccount,
  getStore,
  refreshPaymentAccountStatus,
  refundPayment,
  updateStore,
  type CreatePaymentAccountInput,
  type UpdateStoreInput,
} from "./service";

export const STORE_KEY = ["store"] as const;
export const PAYMENT_ACCOUNT_KEY = ["store", "payment-account"] as const;

/** Dados da loja do lojista logado (GET /store). */
export function useStore() {
  return useQuery({ queryKey: STORE_KEY, queryFn: getStore });
}

/** Atualiza a loja (PUT /store) e semeia o cache com a resposta. */
export function useUpdateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateStoreInput) => updateStore(body),
    onSuccess: (store) => qc.setQueryData(STORE_KEY, store),
  });
}

/**
 * Subconta de pagamento da loja (GET /store/payment-account). O 404 ("loja
 * ainda não criou a conta") é um estado de UI normal — onboarding — então não
 * fazemos retry e o componente trata `error.status === 404` como "sem conta".
 */
export function usePaymentAccount() {
  return useQuery({
    queryKey: PAYMENT_ACCOUNT_KEY,
    queryFn: getPaymentAccount,
    retry: (count, err) => !(err instanceof ApiError && err.status === 404) && count < 2,
  });
}

/** Cria a subconta (Owner) e semeia o cache com a resposta. */
export function useCreatePaymentAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePaymentAccountInput) => createPaymentAccount(body),
    onSuccess: (account) => qc.setQueryData(PAYMENT_ACCOUNT_KEY, account),
  });
}

/** Reconsulta o status da subconta no provedor (Owner) e semeia o cache com o estado atualizado. */
export function useRefreshPaymentAccountStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => refreshPaymentAccountStatus(),
    onSuccess: (account) => qc.setQueryData(PAYMENT_ACCOUNT_KEY, account),
  });
}

/** Estorna um pagamento (Manager). Invalida os pedidos para refletir o novo status. */
export function useRefundPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => refundPayment(paymentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

/** Upload do logotipo da loja ao Azure (via /api/uploads); usa o token do AuthProvider. */
export function useUploadLogo() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (file: File) => {
      if (!token) throw new Error("Sessão expirada. Faça login novamente.");
      return uploadImage(file, token);
    },
  });
}
