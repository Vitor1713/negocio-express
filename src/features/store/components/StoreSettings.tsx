"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AppBadge,
  AppButton,
  AppCard,
  AppErrorState,
  AppField,
  AppInput,
  AppSpinner,
  Icon,
} from "@/components/ui";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/features/auth";
import { STORE_CATEGORIES } from "../categories";
import { storeStatusInfo } from "../status";
import { useStore, useUpdateStore } from "../hooks";
import type { Store } from "../service";

const fmtDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    : "—";

function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const schema = z.object({
  name: z.string().min(1, "Informe o nome da loja."),
  email: z.string().email("E-mail inválido."),
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(z.string().min(10, "Telefone incompleto.")),
  category: z.string().min(1, "Selecione o segmento."),
});

type FormValues = {
  name: string;
  email: string;
  phone: string;
  category: string;
};

export function StoreSettings() {
  const { storeRole } = useAuth();
  const { data: store, isLoading, isError, error, refetch } = useStore();

  // Apenas Owner edita os dados da loja.
  if (storeRole && storeRole !== "Owner") {
    return (
      <>
        <Header />
        <AppCard className="p-6 mt-2">
          <p className="text-sm text-ink-500">
            Apenas o dono da loja pode editar as configurações.
          </p>
        </AppCard>
      </>
    );
  }

  return (
    <>
      <Header />
      {isLoading ? (
        <div className="flex justify-center py-20">
          <AppSpinner className="h-10 w-10" />
        </div>
      ) : isError ? (
        <AppErrorState title="Erro ao carregar a loja" error={error} onRetry={() => refetch()} />
      ) : store ? (
        <SettingsForm store={store} />
      ) : null}
    </>
  );
}

function Header() {
  return (
    <div className="mb-6">
      <h1 className="font-display font-extrabold text-2xl text-ink-900 tracking-tight">
        Configurações da loja
      </h1>
      <p className="text-sm text-ink-500 mt-0.5">Dados públicos e de contato</p>
    </div>
  );
}

function SettingsForm({ store }: { store: Store }) {
  const update = useUpdateStore();
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const status = storeStatusInfo(store.status);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      name: store.name ?? "",
      email: store.email ?? "",
      phone: store.phone ? formatPhone(store.phone) : "",
      category: store.category ?? "",
    },
  });

  const category = watch("category");

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    try {
      // Preserva os campos operacionais (não editados nesta tela) para o PUT
      // não os zerar.
      const updated = await update.mutateAsync({
        name: values.name,
        email: values.email,
        phone: values.phone,
        category: values.category,
        logoUrl: store.logoUrl,
        isOpen: store.isOpen,
        deliveryFee: store.deliveryFee,
        minOrderAmount: store.minOrderAmount,
        estimatedDeliveryMinutes: store.estimatedDeliveryMinutes,
      });
      reset({
        name: updated.name ?? "",
        email: updated.email ?? "",
        phone: updated.phone ? formatPhone(updated.phone) : "",
        category: updated.category ?? "",
      });
      setSaved(true);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.messages[0] : "Não foi possível salvar. Tente novamente.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit as never)}
      onChange={() => saved && setSaved(false)}
      noValidate
      className="max-w-2xl space-y-4"
    >
      {/* Identidade */}
      <AppCard className="p-5 sm:p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-ink-100">
          <span className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center shadow-soft">
            <Icon name="Store" size={22} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-ink-900 truncate">{store.name}</div>
            <div className="text-xs text-ink-500 font-mono truncate">
              negocioexpress.com.br/{store.slug}
            </div>
          </div>
          <AppBadge tone={status.tone} dot>
            {status.label}
          </AppBadge>
        </div>

        <div className="mt-5 space-y-4">
          <AppInput label="Nome da loja" required error={errors.name?.message} {...register("name")} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AppInput label="Endereço (slug)" hint="Não pode ser alterado." value={store.slug ?? ""} disabled readOnly />
            <AppInput label="CNPJ" hint="Não pode ser alterado." value={store.cnpj ?? "—"} disabled readOnly />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AppInput
              label="E-mail de contato"
              type="email"
              required
              error={errors.email?.message}
              {...register("email")}
            />
            <AppInput
              label="Telefone"
              required
              error={errors.phone?.message}
              {...register("phone", {
                onChange: (e) => {
                  e.target.value = formatPhone(e.target.value);
                },
              })}
            />
          </div>

          <AppField label="Segmento" error={errors.category?.message} htmlFor="store-category">
            <select
              id="store-category"
              value={category}
              onChange={(e) => setValue("category", e.target.value, { shouldDirty: true })}
              className="w-full bg-white border border-ink-200 rounded-lg px-3 py-2.5 text-sm text-ink-900 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            >
              {STORE_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </AppField>
        </div>

        {submitError && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <Icon name="CircleAlert" size={16} className="shrink-0" />
            {submitError}
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-ink-100 flex items-center justify-between gap-3">
          <span
            className={`text-sm inline-flex items-center gap-1.5 text-brand-700 transition-opacity ${
              saved ? "opacity-100" : "opacity-0"
            }`}
          >
            <Icon name="CircleCheck" size={15} /> Alterações salvas
          </span>
          <AppButton type="submit" icon="Check" loading={update.isPending}>
            Salvar alterações
          </AppButton>
        </div>
      </AppCard>

      {/* Meta */}
      <AppCard className="p-5 sm:p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-500">Loja criada em</span>
          <span className="text-ink-900 font-medium">{fmtDate(store.createdAt)}</span>
        </div>
        <div className="mt-3 pt-3 border-t border-ink-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-medium text-ink-900">Ver loja pública</div>
            <div className="text-xs text-ink-500">Veja como os clientes enxergam sua vitrine.</div>
          </div>
          {store.slug && (
            <Link href={`/stores/${store.slug}`} target="_blank" className="shrink-0">
              <AppButton type="button" variant="outline" icon="ExternalLink">
                Abrir
              </AppButton>
            </Link>
          )}
        </div>
      </AppCard>
    </form>
  );
}
