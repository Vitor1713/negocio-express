import { useInfiniteQuery } from "@tanstack/react-query";
import { listStoreProducts, type CatalogPage } from "./service";

export const storefrontKey = (slug: string, categoryId?: string, search?: string) =>
  ["storefront", slug, categoryId ?? "all", search?.trim() || ""] as const;

/**
 * Catálogo da loja paginado (scroll infinito), filtrado por categoria/busca
 * server-side. `initialPage` semeia a 1ª página vinda do SSR — só quando não há
 * filtro ativo (categoria/busca), pois aí o SSR corresponde à página inicial.
 */
export function useStoreProducts(
  slug: string,
  categoryId: string | undefined,
  search: string | undefined,
  initialPage?: CatalogPage,
) {
  const term = search?.trim() || undefined;
  const noFilter = !categoryId && !term;
  return useInfiniteQuery({
    queryKey: storefrontKey(slug, categoryId, term),
    queryFn: ({ pageParam, signal }) =>
      listStoreProducts(slug, { categoryId, search: term, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (last, pages) => (last.hasMore ? pages.length + 1 : undefined),
    initialData:
      noFilter && initialPage
        ? { pages: [initialPage], pageParams: [1] }
        : undefined,
  });
}
