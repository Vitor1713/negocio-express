"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AppButton,
  AppCard,
  AppDrawer,
  AppEmptyState,
  AppErrorState,
  AppInput,
  AppSpinner,
  Icon,
} from "@/components/ui";
import { ApiError } from "@/lib/api";
import { useAddresses, useCreateAddress } from "../hooks";

const schema = z.object({
  street: z.string().min(1, "Rua obrigatória"),
  number: z.string().min(1, "Número obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro obrigatório"),
  city: z.string().min(1, "Cidade obrigatória"),
  state: z.string().length(2, "Use a sigla do estado (ex: SP)"),
  zipCode: z.string().min(8, "CEP incompleto"),
});

type FormValues = z.infer<typeof schema>;

function formatZip(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

function fmtAddress(a: FormValues) {
  return `${a.street}, ${a.number}${a.complement ? ` · ${a.complement}` : ""} — ${a.neighborhood}, ${a.city}/${a.state}`;
}

type Props = { slug: string };

export function AddressesTab({ slug }: Props) {
  const { data: addresses, isLoading, isError, error } = useAddresses(slug);
  const createAddress = useCreateAddress(slug);
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function handleSave(values: FormValues) {
    setFormError(null);
    try {
      await createAddress.mutateAsync({
        street: values.street,
        number: values.number,
        complement: values.complement || null,
        neighborhood: values.neighborhood,
        city: values.city,
        state: values.state,
        zipCode: values.zipCode.replace(/\D/g, ""),
      });
      reset();
      setFormOpen(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.messages[0] : "Erro ao salvar endereço.");
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display font-bold text-lg text-ink-900">Meus endereços</h2>
        <AppButton icon="Plus" size="sm" onClick={() => setFormOpen(true)}>
          Novo endereço
        </AppButton>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><AppSpinner /></div>
      ) : isError ? (
        <AppErrorState title="Erro ao carregar endereços" error={error} />
      ) : !addresses?.length ? (
        <AppEmptyState
          icon="MapPin"
          title="Nenhum endereço cadastrado"
          desc="Adicione um endereço para agilizar seus próximos pedidos."
          action={<AppButton icon="Plus" size="sm" onClick={() => setFormOpen(true)}>Novo endereço</AppButton>}
        />
      ) : (
        <div className="space-y-3">
          {addresses.map((a) => (
            <AppCard key={a.id} className="p-4 flex items-start gap-3">
              <span className="h-9 w-9 rounded-lg bg-brand-100 text-brand-700 grid place-items-center shrink-0">
                <Icon name="MapPin" size={16} />
              </span>
              <div className="text-[13.5px]">
                <div className="font-medium text-ink-900">
                  {a.street}, {a.number}{a.complement ? ` · ${a.complement}` : ""}
                </div>
                <div className="text-ink-500">
                  {a.neighborhood} · {a.city}/{a.state} · {a.zipCode}
                </div>
              </div>
            </AppCard>
          ))}
        </div>
      )}

      <AppDrawer
        open={formOpen}
        onClose={() => { setFormOpen(false); reset(); setFormError(null); }}
        icon="MapPin"
        title="Novo endereço"
        footer={
          <AppButton type="submit" form="address-form" fullWidth icon="Check" loading={createAddress.isPending}>
            Salvar endereço
          </AppButton>
        }
      >
        <form id="address-form" onSubmit={handleSubmit(handleSave)} className="p-5 space-y-4" noValidate>
          {formError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
              {formError}
            </div>
          )}
          <AppInput label="Rua" required error={errors.street?.message} {...register("street")} />
          <div className="grid grid-cols-2 gap-3">
            <AppInput label="Número" required error={errors.number?.message} {...register("number")} />
            <AppInput label="Complemento" placeholder="Apto, sala..." error={errors.complement?.message} {...register("complement")} />
          </div>
          <AppInput label="Bairro" required error={errors.neighborhood?.message} {...register("neighborhood")} />
          <div className="grid grid-cols-2 gap-3">
            <AppInput label="Cidade" required error={errors.city?.message} {...register("city")} />
            <AppInput label="Estado" required placeholder="SP" maxLength={2} error={errors.state?.message} {...register("state")} />
          </div>
          <AppInput
            label="CEP"
            required
            placeholder="00000-000"
            error={errors.zipCode?.message}
            {...register("zipCode", { onChange: (e) => { e.target.value = formatZip(e.target.value); } })}
          />
        </form>
      </AppDrawer>
    </>
  );
}
