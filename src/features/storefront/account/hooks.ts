import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAddress, createReview, listAddresses, type RequestAddress, type RequestCreateReview } from "./service";

export const ADDRESSES_KEY = (slug: string) => ["addresses", slug] as const;

export function useAddresses(slug: string) {
  return useQuery({
    queryKey: ADDRESSES_KEY(slug),
    queryFn: () => listAddresses(slug),
    retry: false,
  });
}

export function useCreateAddress(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RequestAddress) => createAddress(slug, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADDRESSES_KEY(slug) }),
  });
}

export function useCreateReview(slug: string) {
  return useMutation({
    mutationFn: (body: RequestCreateReview) => createReview(slug, body),
  });
}
