"use client";

/** Providers globais montados na raiz: TanStack Query + Auth. */
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import { makeQueryClient } from "@/lib/query-client";
import { AuthProvider } from "@/features/auth/auth-context";

export function Providers({ children }: { children: ReactNode }) {
  // useState garante uma única instância estável no client.
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
