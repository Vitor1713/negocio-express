"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppButton, AppDrawer, AppField, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { INVITABLE_ROLES, TEAM_ROLES } from "../roles";
import type { TeamMember } from "../service";

const schema = z.object({ role: z.enum(INVITABLE_ROLES) });

export type TeamMemberFormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  member: TeamMember | null;
  saving?: boolean;
  removing?: boolean;
  error?: string | null;
  onClose: () => void;
  onSave: (values: TeamMemberFormValues) => void;
  onRemove: () => void;
};

export function TeamMemberForm({
  open,
  member,
  saving,
  removing,
  error,
  onClose,
  onSave,
  onRemove,
}: Props) {
  const [confirmDel, setConfirmDel] = useState(false);
  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TeamMemberFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "Staff" },
  });

  useEffect(() => {
    if (!open) return;
    setConfirmDel(false);
    const current = member?.role;
    reset({
      role: (INVITABLE_ROLES as readonly string[]).includes(current ?? "")
        ? (current as TeamMemberFormValues["role"])
        : "Staff",
    });
  }, [open, member, reset]);

  const role = watch("role");
  const display = member?.userName || member?.userEmail || "Membro";

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <AppDrawer
      open={open}
      onClose={handleClose}
      icon="UserCog"
      title="Editar membro"
      subtitle="Atualize a função ou remova da equipe"
      footer={
        <div className="flex gap-2">
          {confirmDel ? (
            <AppButton variant="danger" icon="Trash2" loading={removing} onClick={onRemove}>
              Confirmar
            </AppButton>
          ) : (
            <AppButton variant="outline" icon="Trash2" onClick={() => setConfirmDel(true)}>
              Remover
            </AppButton>
          )}
          <AppButton type="submit" form="team-member-form" fullWidth icon="Check" loading={saving}>
            Salvar
          </AppButton>
        </div>
      }
    >
      <form id="team-member-form" onSubmit={handleSubmit(onSave)} className="p-5 space-y-4" noValidate>
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700 flex items-center gap-2">
            <Icon name="CircleAlert" size={15} className="shrink-0" />
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 rounded-lg border border-ink-200 bg-ink-50/40 p-3">
          <span className="h-10 w-10 rounded-full bg-brand-100 text-brand-700 grid place-items-center font-bold shrink-0">
            {display.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <div className="text-[14px] font-medium text-ink-900 truncate">{display}</div>
            {member?.userEmail && (
              <div className="text-[12.5px] text-ink-500 truncate">{member.userEmail}</div>
            )}
          </div>
        </div>

        <AppField label="Função" error={errors.role?.message}>
          <div className="space-y-2">
            {INVITABLE_ROLES.map((key) => {
              const active = role === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setValue("role", key, { shouldValidate: true })}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-all",
                    active
                      ? "border-brand-600 bg-brand-50 ring-2 ring-brand-100"
                      : "border-ink-200 hover:bg-ink-50",
                  )}
                >
                  <span className="font-medium text-ink-900">{TEAM_ROLES[key].label}</span>
                  {active && <Icon name="Check" size={16} className="text-brand-600" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </AppField>
      </form>
    </AppDrawer>
  );
}
