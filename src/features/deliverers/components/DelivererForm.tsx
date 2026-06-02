"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppButton, AppDrawer, AppField, AppInput, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { VEHICLE_TYPE } from "../vehicle";

const schema = z.object({
  name: z.string().min(2, "Informe o nome completo."),
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(z.string().min(10, "Telefone incompleto.")),
  vehicleType: z.string().min(1, "Selecione o veículo."),
});

export type DelivererFormValues = z.infer<typeof schema>;

function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

type Props = {
  open: boolean;
  saving?: boolean;
  error?: string | null;
  onClose: () => void;
  onSave: (values: DelivererFormValues) => void;
};

export function DelivererForm({ open, saving, error, onClose, onSave }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DelivererFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", vehicleType: "motorcycle" },
  });

  const vehicleType = watch("vehicleType");

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <AppDrawer
      open={open}
      onClose={handleClose}
      icon="Bike"
      title="Novo entregador"
      subtitle="Cadastrar um entregador da loja"
      footer={
        <AppButton
          type="submit"
          form="deliverer-form"
          fullWidth
          icon="Check"
          loading={saving}
        >
          Salvar
        </AppButton>
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
      </form>
    </AppDrawer>
  );
}
