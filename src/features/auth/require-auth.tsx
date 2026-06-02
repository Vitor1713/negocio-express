"use client";

/**
 * Guarda de rota para o dashboard do lojista.
 * Sem token → redireciona para /login. Enquanto hidrata, mostra fallback.
 *
 * Multi-tenant: o dashboard resolve a loja pelo TOKEN (não usa slug).
 */
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "./auth-context";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-50">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600"
          role="status"
          aria-label="Carregando"
        />
      </div>
    );
  }

  return <>{children}</>;
}
