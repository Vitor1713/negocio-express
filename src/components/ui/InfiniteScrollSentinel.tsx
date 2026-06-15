"use client";

import { useEffect, useRef } from "react";
import { AppSpinner } from "./AppSpinner";

type Props = {
  /** Há mais páginas para carregar (react-query `hasNextPage`). */
  hasMore: boolean;
  /** Uma página já está sendo buscada (react-query `isFetchingNextPage`). */
  isLoading: boolean;
  /** Dispara o carregamento da próxima página (react-query `fetchNextPage`). */
  onLoadMore: () => void;
  /** Margem extra do observer p/ pré-carregar antes de chegar ao fim. */
  rootMargin?: string;
};

/**
 * Sentinela de scroll infinito: observa uma `div` no fim da lista e chama
 * `onLoadMore` quando ela entra na viewport. Reutilizada pela vitrine e pelo
 * dashboard. Não renderiza nada quando não há mais páginas.
 */
export function InfiniteScrollSentinel({
  hasMore,
  isLoading,
  onLoadMore,
  rootMargin = "400px",
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore, rootMargin]);

  if (!hasMore && !isLoading) return null;

  return (
    <div ref={ref} className="col-span-full flex justify-center py-8">
      {isLoading && <AppSpinner />}
    </div>
  );
}
