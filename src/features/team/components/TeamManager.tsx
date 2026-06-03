"use client";

import { useState } from "react";
import {
  AppBadge,
  AppButton,
  AppCard,
  AppEmptyState,
  AppErrorState,
  AppSpinner,
  Icon,
} from "@/components/ui";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/features/auth";
import {
  useAddTeamMember,
  useRemoveTeamMember,
  useTeam,
  useUpdateTeamMember,
} from "../hooks";
import { roleInfo } from "../roles";
import type { TeamMember } from "../service";
import { TeamInviteForm, type TeamInviteValues } from "./TeamInviteForm";
import { TeamMemberForm, type TeamMemberFormValues } from "./TeamMemberForm";

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "";

export function TeamManager() {
  const { storeRole, claims } = useAuth();
  const { data: members, isLoading, isError, error, refetch } = useTeam();
  const addMember = useAddTeamMember();
  const updateMember = useUpdateTeamMember();
  const removeMember = useRemoveTeamMember();
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  // Guarda de papel: só Owner gerencia equipe.
  if (storeRole !== "Owner") {
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
      await addMember.mutateAsync({ email: values.email, role: values.role });
      setFormOpen(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.messages[0] : "Erro ao convidar membro.");
    }
  }

  async function handleEditSave(values: TeamMemberFormValues) {
    if (!editing?.id) return;
    setEditError(null);
    try {
      await updateMember.mutateAsync({ memberId: editing.id, body: { role: values.role } });
      setEditing(null);
    } catch (err) {
      setEditError(err instanceof ApiError ? err.messages[0] : "Erro ao salvar membro.");
    }
  }

  async function handleRemove() {
    if (!editing?.id) return;
    setEditError(null);
    try {
      await removeMember.mutateAsync(editing.id);
      setEditing(null);
    } catch (err) {
      setEditError(err instanceof ApiError ? err.messages[0] : "Erro ao remover membro.");
    }
  }

  const list = members ?? [];

  /** Owner não é editável/removível; o próprio usuário logado também não. */
  function canManage(m: TeamMember) {
    if (m.role === "Owner") return false;
    if (m.userId && claims?.sub && m.userId === claims.sub) return false;
    if (m.userEmail && claims?.email && m.userEmail === claims.email) return false;
    return true;
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

      {isLoading ? (
        <div className="flex justify-center py-20">
          <AppSpinner className="h-10 w-10" />
        </div>
      ) : isError ? (
        <AppErrorState title="Erro ao carregar a equipe" error={error} onRetry={() => refetch()} />
      ) : list.length === 0 ? (
        <AppEmptyState
          icon="Users"
          title="Nenhum membro na equipe"
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
            {list.map((m) => {
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
                  {canManage(m) && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditError(null);
                        setEditing(m);
                      }}
                      title="Editar membro"
                      className="h-8 w-8 grid place-items-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition-colors shrink-0"
                    >
                      <Icon name="Pencil" size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </AppCard>
      )}

      <TeamMemberForm
        open={!!editing}
        member={editing}
        saving={updateMember.isPending}
        removing={removeMember.isPending}
        error={editError}
        onClose={() => {
          setEditing(null);
          setEditError(null);
        }}
        onSave={handleEditSave}
        onRemove={handleRemove}
      />

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
