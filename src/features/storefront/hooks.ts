import { useQuery } from "@tanstack/react-query";
import { listStoreProducts, type CatalogProduct } from "./service";

export const storefrontKey = (slug: string, categoryId?: string) =>
  ["storefront", slug, categoryId ?? "all"] as const;

/**
 * Catálogo da loja filtrado por categoria (server-side, pois o item do catálogo
 * não traz categoryId). `initialData` semeia o estado inicial vindo do SSR.
 */
export function useStoreProducts(
  slug: string,
  categoryId: string | undefined,
  initialData?: CatalogProduct[],
) {
  return useQuery({
    queryKey: storefrontKey(slug, categoryId),
    queryFn: ({ signal }) => listStoreProducts(slug, { categoryId }, signal),
    initialData: categoryId ? undefined : initialData,
  });
}
