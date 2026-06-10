"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCoupon,
  deleteCoupon,
  getCoupon,
  listCoupons,
  updateCoupon,
  type RequestCoupon,
} from "./service";

export const COUPONS_KEY = ["coupons"] as const;

export function useCoupons() {
  return useQuery({ queryKey: COUPONS_KEY, queryFn: listCoupons });
}

export function useCoupon(id: string | null) {
  return useQuery({
    queryKey: [...COUPONS_KEY, id],
    queryFn: () => getCoupon(id as string),
    enabled: !!id,
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RequestCoupon) => createCoupon(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: COUPONS_KEY }),
  });
}

export function useUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: RequestCoupon }) => updateCoupon(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: COUPONS_KEY }),
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCoupon(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: COUPONS_KEY }),
  });
}
