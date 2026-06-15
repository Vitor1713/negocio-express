"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { AppButton, AppDrawer, AppInput } from "@/components/ui";
import { ApiError } from "@/lib/api";
import { useCreateAddress } from "../hooks";
import type { Address } from "../service";

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

type Props = {
  slug: string;
  open: boolean;
  onClose: () => void;
  /** Chamado com o endereço criado (ex.: checkout seleciona-o automaticamente). */
  onCreated?: (address: Address) => void;
};

/** Drawer de cadastro de endereço. Reutilizado na conta e no checkout. */
export function AddressFormDrawer({ slug, open, onClose, onCreated }: Props) {
  const createAddress = useCreateAddress(slug);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function close() {
    reset();
    setFormError(null);
    onClose();
  }

  async function handleSave(values: FormValues) {
    setFormError(null);
    try {
      const created = await createAddress.mutateAsync({
        street: values.street,
        number: values.number,
        complement: values.complement || null,
        neighborhood: values.neighborhood,
        city: values.city,
        state: values.state,
        zipCode: values.zipCode.replace(/\D/g, ""),
      });
      reset();
      onCreated?.(created);
      onClose();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.messages[0] : "Erro ao salvar endereço.");
    }
  }

  return (
    <AppDrawer
      open={open}
      onClose={close}
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
  );
}
