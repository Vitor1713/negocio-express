import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api";

/** Cria o QueryClient. Uma instância por request no server, singleton no client. */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Não reintenta erros de auth/validação (4xx); só falhas transitórias.
          if (error instanceof ApiError && error.status < 500) return false;
          return failureCount < 2;
        },
      },
    },
  });
}
