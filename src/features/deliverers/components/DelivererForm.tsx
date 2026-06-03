"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppButton, AppDrawer, AppField, AppInput, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { VEHICLE_TYPE } from "../vehicle";
import type { Deliverer } from "../service";

const schema = z.object({
  name: z.string().min(2, "Informe o nome completo."),
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(z.string().min(10, "Telefone incompleto.")),
  vehicleType: z.string().min(1, "Selecione o veículo."),
  isActive: z.boolean(),
});

export type DelivererFormValues = z.infer<typeof schema>;

function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const EMPTY: DelivererFormValues = {
  name: "",
  phone: "",
  vehicleType: "Motorcycle",
  isActive: true,
};

type Props = {
  open: boolean;
  /** null = criar; objeto = editar (prefill direto, sem GET por id). */
  deliverer: Deliverer | null;
  saving?: boolean;
  deleting?: boolean;
  error?: string | null;
  onClose: () => void;
  onSave: (values: DelivererFormValues) => void;
  onDelete: () => void;
};

export function DelivererForm({
  open,
  deliverer,
  saving,
  deleting,
  error,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const isEdit = !!deliverer;
  const [confirmDel, setConfirmDel] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DelivererFormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    setConfirmDel(false);
    if (deliverer) {
      reset({
        name: deliverer.name ?? "",
        phone: deliverer.phone ? formatPhone(deliverer.phone) : "",
        vehicleType: deliverer.vehicleType ?? "Motorcycle",
        isActive: deliverer.isActive ?? true,
      });
    } else {
      reset(EMPTY);
    }
  }, [open, deliverer, reset]);

  const vehicleType = watch("vehicleType");
  const isActive = watch("isActive");

  function handleClose() {
    reset(EMPTY);
    onClose();
  }

  return (
    <AppDrawer
      open={open}
      onClose={handleClose}
      icon="Bike"
      title={isEdit ? "Editar entregador" : "Novo entregador"}
      subtitle={isEdit ? "Atualize os dados do entregador" : "Cadastrar um entregador da loja"}
      footer={
        <div className="flex gap-2">
          {isEdit &&
            (confirmDel ? (
              <AppButton variant="danger" icon="Trash2" loading={deleting} onClick={onDelete}>
                Confirmar
              </AppButton>
            ) : (
              <AppButton variant="outline" icon="Trash2" onClick={() => setConfirmDel(true)}>
                Excluir
              </AppButton>
            ))}
          <AppButton type="submit" form="deliverer-form" fullWidth icon="Check" loading={saving}>
            Salvar
          </AppButton>
        </div>
      }
    >
      <form id="deliverer-form" onSubmit={handleSubmit(onSave)} className="p-5 space-y-4" noValidate>
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700 flex items-center gap-2">
            <Icon name="CircleAlert" size={15} className="shrink-0" />
            {error}
          </div>
        )}

        <AppInput
          label="Nome completo"
          required
          placeholder="Ex: Marcos Souza"
          icon="User"
          error={errors.name?.message}
          {...register("name")}
        />

        <AppInput
          label="Telefone"
          required
          placeholder="(11) 99999-9999"
          icon="Phone"
          error={errors.phone?.message}
          {...register("phone", {
            onChange: (e) => {
              e.target.value = formatPhone(e.target.value);
            },
          })}
        />

        <AppField label="Veículo" error={errors.vehicleType?.message}>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(VEHICLE_TYPE).map(([key, t]) => {
              const active = vehicleType === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setValue("vehicleType", key, { shouldValidate: true })}
                  className={cn(
                    "py-2.5 rounded-lg border text-sm font-medium transition-all inline-flex items-center justify-center gap-1.5",
                    active
                      ? "border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-100"
                      : "border-ink-200 text-ink-700 hover:bg-ink-50",
                  )}
                >
                  <Icon name={t.icon} size={15} /> {t.label}
                </button>
              );
            })}
          </div>
        </AppField>

        <button
          type="button"
          onClick={() => setValue("isActive", !isActive, { shouldDirty: true })}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-ink-200 bg-ink-50/40 text-left"
        >
          <span className="text-sm font-medium text-ink-900">Disponível para entregas</span>
          <span
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors shrink-0",
              isActive ? "bg-brand-600" : "bg-ink-300",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all",
                isActive ? "left-[22px]" : "left-0.5",
              )}
            />
          </span>
        </button>
      </form>
    </AppDrawer>
  );
}
