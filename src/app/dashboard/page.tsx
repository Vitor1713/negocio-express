"use client";

import { AppButton, AppCard, Logo } from "@/components/ui";
import { useAuth } from "@/features/auth";

/**
 * Dashboard (RF-F04) — ESQUELETO. Visão geral e módulos vêm nas Fases 2 e 4.
 * Rota protegida pelo layout (RequireAuth).
 */
export default function DashboardPage() {
  const { role, storeId, logout } = useAuth();
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <Logo />
        <AppButton variant="outline" size="sm" icon="LogOut" onClick={logout}>
          Sair
        </AppButton>
      </div>
      <AppCard className="p-6">
        <h1 className="font-display text-xl font-extrabold text-ink-900">Dashboard do lojista</h1>
        <p className="mt-1 text-sm text-ink-500">Esqueleto protegido por guarda de rota (Fase 0).</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-ink-400">role (claim)</dt>
            <dd className="font-medium text-ink-900">{role ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-ink-400">store_id (claim)</dt>
            <dd className="font-medium text-ink-900">{storeId ?? "—"}</dd>
          </div>
        </dl>
      </AppCard>
    </main>
  );
}
