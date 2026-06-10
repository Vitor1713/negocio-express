"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppButton, AppCard, AppInput, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { STORE_CATEGORIES } from "@/features/store/categories";

/** Segmentos = categorias de loja (fonte única, keys = enum do backend). */
const SEGMENTS = STORE_CATEGORIES;

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function formatCNPJ(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

const schema = z.object({
  storeName: z.string().min(1, "Informe o nome da loja."),
  storeSlug: z
    .string()
    .min(3, "Escolha um endereço com ao menos 3 letras.")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e -"),
  storeCnpj: z
    .string()
    .optional()
    .transform((v) => (v ? v.replace(/\D/g, "") : ""))
    .pipe(
      z.union([
        z.string().length(0),
        z.string().length(14, "CNPJ deve ter 14 dígitos."),
      ]),
    ),
  storeEmail: z.string().email("E-mail da loja inválido."),
  storePhone: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(z.string().min(10, "Telefone incompleto.")),
  storeCategory: z.string().min(1, "Selecione o segmento do seu negócio."),
});

export type Step2Values = z.infer<typeof schema>;

type RawStep2 = {
  storeName: string;
  storeSlug: string;
  storeCnpj?: string;
  storeEmail: string;
  storePhone: string;
  storeCategory: string;
};

type Props = {
  defaultValues?: Partial<RawStep2>;
  prefillEmail?: string;
  prefillPhone?: string;
  onNext: (values: Step2Values) => void;
  onBack: () => void;
};

export function Step2StoreData({
  defaultValues,
  prefillEmail,
  prefillPhone,
  onNext,
  onBack,
}: Props) {
  const [slugEdited, setSlugEdited] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RawStep2>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      storeName: "",
      storeSlug: "",
      storeCnpj: "",
      storeEmail: prefillEmail ?? "",
      storePhone: prefillPhone ? formatPhone(prefillPhone) : "",
      storeCategory: "",
      ...defaultValues,
    },
  });

  const watchedName = watch("storeName");
  const watchedCategory = watch("storeCategory");

  useEffect(() => {
    if (!slugEdited && watchedName) {
      setValue("storeSlug", slugify(watchedName));
    }
  }, [watchedName, slugEdited, setValue]);

  const [slugFocused, setSlugFocused] = useState(false);
  const slugValue = watch("storeSlug");

  return (
    <AppCard className="mt-8 p-7">
      <form onSubmit={handleSubmit(onNext as never)} noValidate>
        <div className="space-y-4">
          <AppInput
            label="Nome da loja"
            required
            placeholder="Ex: Padaria do João"
            icon="Store"
            error={errors.storeName?.message}
            {...register("storeName")}
          />

          {/* Slug input com prefixo */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">
              Endereço da loja <span className="text-brand-600">*</span>
            </label>
            <div
              className={cn(
                "flex items-stretch rounded-lg border overflow-hidden transition-all",
                errors.storeSlug
                  ? "border-red-400 ring-2 ring-red-100"
                  : slugFocused
                    ? "border-brand-600 ring-2 ring-brand-100"
                    : "border-ink-200",
              )}
            >
              <span className="flex items-center gap-1.5 px-3.5 bg-ink-50 border-r border-ink-200 text-ink-500 text-[13px] whitespace-nowrap">
                <Icon name="Link" size={14} />
                negocioexpress.com.br/
              </span>
              <input
                className="flex-1 min-w-0 bg-white px-3 py-2.5 text-sm text-ink-900 placeholder-ink-400 focus:outline-none"
                placeholder="padaria-do-joao"
                value={slugValue}
                onFocus={() => setSlugFocused(true)}
                onBlur={() => setSlugFocused(false)}
                onChange={(e) => {
                  setSlugEdited(true);
                  setValue("storeSlug", slugify(e.target.value), { shouldValidate: true });
                }}
              />
            </div>
            {errors.storeSlug?.message ? (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <Icon name="CircleAlert" size={13} /> {errors.storeSlug.message}
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-ink-500 flex items-center gap-1">
                <Icon name="Check" size={13} className="text-brand-600" />
                Este será o link público da sua loja.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AppInput
              label="CNPJ (opcional)"
              placeholder="00.000.000/0000-00"
              icon="Building2"
              hint={!errors.storeCnpj?.message ? "Pessoa física? Pode deixar em branco." : undefined}
              error={errors.storeCnpj?.message}
              {...register("storeCnpj", {
                onChange: (e) => {
                  e.target.value = formatCNPJ(e.target.value);
                },
              })}
            />
            <AppInput
              label="Telefone da loja"
              required
              placeholder="(11) 3333-4444"
              icon="Phone"
              error={errors.storePhone?.message}
              {...register("storePhone", {
                onChange: (e) => {
                  e.target.value = formatPhone(e.target.value);
                },
              })}
            />
          </div>

          <AppInput
            label="E-mail de contato"
            type="email"
            required
            placeholder="contato@sualoja.com.br"
            icon="Mail"
            error={errors.storeEmail?.message}
            {...register("storeEmail")}
          />

          {/* Segmento */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">
              Segmento do negócio <span className="text-brand-600">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SEGMENTS.map((s) => {
                const active = watchedCategory === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() =>
                      setValue("storeCategory", s.key, { shouldValidate: true })
                    }
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 py-3.5 px-2 rounded-xl border text-center transition-all",
                      active
                        ? "border-brand-600 bg-brand-50 ring-2 ring-brand-100"
                        : "border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50",
                    )}
                  >
                    <span
                      className={cn(
                        "h-9 w-9 rounded-lg grid place-items-center transition-colors",
                        active ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-500",
                      )}
                    >
                      <Icon name={s.icon} size={18} />
                    </span>
                    <span
                      className={cn(
                        "text-[12.5px] font-medium leading-tight",
                        active ? "text-brand-800" : "text-ink-700",
                      )}
                    >
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.storeCategory?.message && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <Icon name="CircleAlert" size={13} /> {errors.storeCategory.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <AppButton type="button" variant="outline" size="lg" icon="ArrowLeft" onClick={onBack}>
              Voltar
            </AppButton>
            <AppButton type="submit" fullWidth size="lg" iconRight="ArrowRight">
              Continuar
            </AppButton>
          </div>
        </div>
      </form>
    </AppCard>
  );
}
