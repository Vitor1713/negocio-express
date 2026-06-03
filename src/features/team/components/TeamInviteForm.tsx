"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppButton, AppDrawer, AppField, AppInput, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { INVITABLE_ROLES, TEAM_ROLES } from "../roles";

const schema = z.object({
  name: z.string().min(2, "Informe o nome do membro."),
  email: z.string().email("E-mail inválido."),
  role: z.enum(INVITABLE_ROLES),
});

export type TeamInviteValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  saving?: boolean;
  error?: string | null;
  onClose: () => void;
  onSave: (values: TeamInviteValues) => void;
};

export function TeamInviteForm({ open, saving, error, onClose, onSave }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TeamInviteValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", role: "Staff" },
  });

  const role = watch("role");

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <AppDrawer
      open={open}
      onClose={handleClose}
      icon="UserPlus"
      title="Convidar membro"
      subtitle="Adicionar alguém à sua equipe"
      footer={
        <AppButton type="submit" form="team-invite-form" fullWidth icon="Send" loading={saving}>
          Enviar convite
        </AppButton>
      }
    >
      <form id="team-invite-form" onSubmit={handleSubmit(onSave)} className="p-5 space-y-4" noValidate>
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700 flex items-center gap-2">
            <Icon name="CircleAlert" size={15} className="shrink-0" />
            {error}
          </div>
        )}

        <AppInput
          label="Nome"
          required
          placeholder="Nome do membro"
          icon="User"
          error={errors.name?.message}
          {...register("name")}
        />

        <AppInput
          label="E-mail"
          type="email"
          required
          placeholder="pessoa@email.com"
          icon="Mail"
          hint={
            !errors.email?.message
              ? "Enviaremos um link para o membro definir a própria senha."
              : undefined
          }
          error={errors.email?.message}
          {...register("email")}
        />

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
