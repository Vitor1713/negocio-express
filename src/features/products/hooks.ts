import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/auth-context";
import {
  addImage,
  addVariant,
  createProduct,
  deleteImage,
  deleteProduct,
  deleteVariant,
  getProduct,
  listDashboardCategories,
  listProducts,
  updateProduct,
  updateVariant,
  uploadProductImage,
  type RequestProduct,
  type RequestProductImage,
  type RequestProductVariant,
} from "./service";

export const PRODUCTS_KEY = ["products"] as const;
export const CATEGORIES_KEY = ["categories"] as const;

export function useProducts() {
  return useQuery({ queryKey: PRODUCTS_KEY, queryFn: listProducts });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, id],
    queryFn: () => getProduct(id),
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({ queryKey: CATEGORIES_KEY, queryFn: listDashboardCategories });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RequestProduct) => createProduct(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RequestProduct) => updateProduct(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCTS_KEY });
      qc.invalidateQueries({ queryKey: [...PRODUCTS_KEY, id] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}

export function useAddVariant(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RequestProductVariant) => addVariant(productId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...PRODUCTS_KEY, productId] }),
  });
}

export function useUpdateVariant(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ variantId, body }: { variantId: string; body: RequestProductVariant }) =>
      updateVariant(variantId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...PRODUCTS_KEY, productId] }),
  });
}

export function useDeleteVariant(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variantId: string) => deleteVariant(variantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...PRODUCTS_KEY, productId] }),
  });
}

export function useAddImage(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RequestProductImage) => addImage(productId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...PRODUCTS_KEY, productId] }),
  });
}

export function useDeleteImage(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) => deleteImage(imageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...PRODUCTS_KEY, productId] }),
  });
}

/** Upload de imagem ao Azure (via /api/uploads); usa o token do AuthProvider. */
export function useUploadImage() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (file: File) => {
      if (!token) throw new Error("Sessão expirada. Faça login novamente.");
      return uploadProductImage(file, token);
    },
  });
}
