"use client";

import { useState } from "react";
import {
  AppBadge,
  AppButton,
  AppCard,
  AppEmptyState,
  Icon,
} from "@/components/ui";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/features/auth";
import { useAddTeamMember } from "../hooks";
import { roleInfo } from "../roles";
import type { TeamMember } from "../service";
import { TeamInviteForm, type TeamInviteValues } from "./TeamInviteForm";

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "";

export function TeamManager() {
  const { role } = useAuth();
  const addMember = useAddTeamMember();
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  // Sem GET /team — guardamos os adicionados nesta sessão.
  const [added, setAdded] = useState<TeamMember[]>([]);

  // Guarda de papel: só Owner gerencia equipe.
  if (role !== "Owner") {
    return (
      <AppEmptyState
        icon="Lock"
        title="Acesso restrito"
        desc="Apenas o dono da loja pode gerenciar a equipe."
      />
    );
  }

  async function handleSave(values: TeamInviteValues) {
    setFormError(null);
    try {
      const member = await addMember.mutateAsync({ email: values.email, role: values.role });
      setAdded((prev) => [member, ...prev]);
      setFormOpen(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.messages[0] : "Erro ao convidar membro.");
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-ink-900 tracking-tight">Equipe</h1>
          <p className="text-sm text-ink-500 mt-0.5">Convide e gerencie membros da sua loja</p>
        </div>
        <AppButton icon="UserPlus" onClick={() => setFormOpen(true)}>
          Convidar membro
        </AppButton>
      </div>

      {/* Aviso: sem endpoint de listagem */}
      <div className="mb-4 rounded-lg border border-dashed border-ink-300 bg-ink-50/40 px-4 py-3 text-xs text-ink-500 flex items-start gap-2">
        <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
        A API ainda não expõe a listagem da equipe (<span className="font-mono">GET /team</span>).
        Abaixo aparecem os membros adicionados nesta sessão.
      </div>

      {added.length === 0 ? (
        <AppEmptyState
          icon="Users"
          title="Nenhum membro adicionado nesta sessão"
          desc="Convide alguém para começar a montar sua equipe."
          action={
            <AppButton icon="UserPlus" onClick={() => setFormOpen(true)}>
              Convidar membro
            </AppButton>
          }
        />
      ) : (
        <AppCard className="overflow-hidden">
          <div className="divide-y divide-ink-100">
            {added.map((m) => {
              const r = roleInfo(m.role);
              const display = m.userName || m.userEmail || "—";
              return (
                <div
                  key={m.id ?? m.userEmail}
                  className="flex items-center gap-3 px-4 sm:px-5 py-4"
                >
                  <span className="h-10 w-10 rounded-full bg-brand-100 text-brand-700 grid place-items-center font-bold shrink-0">
                    {display.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-ink-900 truncate">{display}</div>
                    {m.userEmail && (
                      <div className="text-[12.5px] text-ink-500 truncate">{m.userEmail}</div>
                    )}
                  </div>
                  {m.createdAt && (
                    <div className="hidden sm:block text-xs text-ink-400">
                      desde {fmtDate(m.createdAt)}
                    </div>
                  )}
                  <AppBadge tone={r.tone} size="sm">
                    {r.label}
                  </AppBadge>
                </div>
              );
            })}
          </div>
        </AppCard>
      )}

      <TeamInviteForm
        open={formOpen}
        saving={addMember.isPending}
        error={formError}
        onClose={() => {
          setFormOpen(false);
          setFormError(null);
        }}
        onSave={handleSave}
      />
    </>
  );
}
