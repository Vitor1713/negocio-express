"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AppButton,
  AppCard,
  AppField,
  AppInput,
  AppBadge,
  AppSpinner,
  Icon,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Category, Product } from "../service";

const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome obrigatório"),
  sku: z.string().optional().nullable(),
  stock: z.coerce.number().int().min(0, "Mínimo 0"),
  additionalPrice: z.coerce.number().min(0, "Mínimo 0"),
  isActive: z.boolean(),
});

const schema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  slug: z.string().min(1, "Slug obrigatório").regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e -"),
  description: z.string().optional(),
  basePrice: z.coerce.number().min(0, "Mínimo 0"),
  categoryId: z.string().nullable().optional(),
  isActive: z.boolean(),
  variants: z.array(variantSchema).min(1, "Adicione ao menos uma variação"),
  imageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

export type ProductFormValues = z.infer<typeof schema>;

type Props = {
  product?: Product;
  categories: Category[];
  saving?: boolean;
  onSave: (values: ProductFormValues) => void;
  onDelete?: () => void;
  onCancel: () => void;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const BRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

export function ProductForm({ product, categories, saving, onSave, onDelete, onCancel }: Props) {
  const isNew = !product?.id;

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      basePrice: Number(product?.basePrice ?? 0),
      categoryId: categories[0]?.id ?? null,
      isActive: product?.isActive ?? true,
      imageUrl: product?.images?.[0]?.url ?? "",
      variants: product?.variants?.length
        ? product.variants.map((v) => ({
            id: v.id,
            name: v.name ?? "",
            sku: v.sku ?? "",
            stock: Number(v.stock ?? 0),
            additionalPrice: Number(v.additionalPrice ?? 0),
            isActive: v.isActive ?? true,
          }))
        : [{ name: "Padrão", sku: "", stock: 0, additionalPrice: 0, isActive: true }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });

  const watchedName = watch("name");
  const watchedBasePrice = watch("basePrice");
  const watchedVariants = watch("variants");
  const watchedIsActive = watch("isActive");

  useEffect(() => {
    if (isNew) {
      setValue("slug", slugify(watchedName ?? ""));
    }
  }, [watchedName, isNew, setValue]);

  const totalStock = watchedVariants.reduce((s, v) => s + (Number(v.stock) || 0), 0);
  const prices = watchedVariants.map((v) => Number(watchedBasePrice || 0) + Number(v.additionalPrice || 0));
  const priceRange =
    prices.length === 0
      ? "—"
      : Math.min(...prices) === Math.max(...prices)
        ? BRL(Math.min(...prices))
        : `${BRL(Math.min(...prices))} – ${BRL(Math.max(...prices))}`;

  return (
    <form onSubmit={handleSubmit(onSave)}>
      {/* Cabeçalho */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 w-10 grid place-items-center rounded-lg border border-ink-200 text-ink-700 hover:bg-ink-50 transition-colors shrink-0"
          >
            <Icon name="ArrowLeft" size={18} />
          </button>
          <div className="min-w-0">
            <div className="text-xs text-ink-500 flex items-center gap-1.5">
              <span>Produtos</span>
              <Icon name="ChevronRight" size={12} />
              <span className="text-ink-700">{isNew ? "Novo" : "Editar"}</span>
            </div>
            <h1 className="font-display font-extrabold text-xl sm:text-2xl text-ink-900 tracking-tight truncate">
              {isNew ? "Novo produto" : (watch("name") || "Editar produto")}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && onDelete && (
            <AppButton type="button" variant="danger" icon="Trash2" onClick={onDelete}>
              Excluir
            </AppButton>
          )}
          <AppButton type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </AppButton>
          <AppButton type="submit" icon="Check" loading={saving}>
            Salvar produto
          </AppButton>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-5">
          {/* Informações */}
          <AppCard className="p-5 sm:p-6">
            <h2 className="font-display font-bold text-ink-900 mb-4">Informações</h2>
            <div className="space-y-4">
              <AppInput
                label="Nome do produto"
                required
                placeholder="Ex: Pão Francês"
                error={errors.name?.message}
                {...register("name")}
              />
              <AppInput
                label="Slug"
                hint="Usado no link público do produto."
                placeholder="pao-frances"
                error={errors.slug?.message}
                {...register("slug", {
                  onChange: (e) => setValue("slug", slugify(e.target.value)),
                })}
              />
              <AppField label="Descrição">
                <textarea
                  rows={4}
                  placeholder="Descreva o produto, ingredientes, diferenciais..."
                  className="w-full bg-white border border-ink-200 rounded-lg px-3 py-2.5 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 resize-none"
                  {...register("description")}
                />
              </AppField>
              <div className="max-w-[200px]">
                <AppInput
                  label="Preço base (R$)"
                  required
                  hint="Preço da variação sem adicional."
                  placeholder="0,00"
                  error={errors.basePrice?.message}
                  {...register("basePrice")}
                />
              </div>
            </div>
          </AppCard>

          {/* Imagem de capa (URL) */}
          <AppCard className="p-5 sm:p-6">
            <h2 className="font-display font-bold text-ink-900 mb-4">Imagem de capa</h2>
            <AppInput
              label="URL da imagem"
              placeholder="https://..."
              error={errors.imageUrl?.message}
              {...register("imageUrl")}
            />
            <p className="mt-2 text-xs text-ink-500">Cole a URL de uma imagem JPG/PNG.</p>
          </AppCard>

          {/* Variações */}
          <AppCard className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-display font-bold text-ink-900">Variações</h2>
              <button
                type="button"
                onClick={() =>
                  append({ name: "", sku: "", stock: 0, additionalPrice: 0, isActive: true })
                }
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <Icon name="Plus" size={15} /> Adicionar variação
              </button>
            </div>
            <p className="text-xs text-ink-500 mb-4">
              O estoque e o SKU são controlados por variação (ex.: Unidade, Dúzia, Tamanho).
            </p>
            {errors.variants?.root?.message && (
              <p className="text-xs text-red-600 mb-3">{errors.variants.root.message}</p>
            )}

            <div className="space-y-3">
              {fields.map((field, idx) => {
                const variantPrice =
                  Number(watchedBasePrice || 0) +
                  Number(watchedVariants[idx]?.additionalPrice || 0);
                const stock = Number(watchedVariants[idx]?.stock || 0);
                const isActive = watchedVariants[idx]?.isActive;

                return (
                  <div key={field.id} className="rounded-xl border border-ink-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
                        Variação {idx + 1}
                      </span>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs text-ink-600 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="accent-brand-600"
                            {...register(`variants.${idx}.isActive`)}
                          />
                          {isActive ? "Ativa" : "Inativa"}
                        </label>
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(idx)}
                            className="h-7 w-7 grid place-items-center rounded-md text-ink-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Icon name="Trash2" size={15} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <AppInput
                        label="Nome"
                        placeholder="Unidade"
                        error={errors.variants?.[idx]?.name?.message}
                        {...register(`variants.${idx}.name`)}
                      />
                      <AppInput
                        label="SKU"
                        placeholder="PF-UN"
                        {...register(`variants.${idx}.sku`)}
                      />
                      <AppInput
                        label="Estoque"
                        placeholder="0"
                        type="number"
                        min="0"
                        error={errors.variants?.[idx]?.stock?.message}
                        {...register(`variants.${idx}.stock`)}
                      />
                      <AppInput
                        label="Preço adic."
                        placeholder="0,00"
                        type="number"
                        min="0"
                        step="0.01"
                        error={errors.variants?.[idx]?.additionalPrice?.message}
                        {...register(`variants.${idx}.additionalPrice`)}
                      />
                    </div>

                    <div className="text-[12px] text-ink-500 flex items-center justify-between pt-3 mt-3 border-t border-ink-100">
                      <span className="inline-flex items-center gap-1.5">
                        {stock === 0 ? (
                          <AppBadge tone="danger" size="sm">Sem estoque</AppBadge>
                        ) : stock <= 10 ? (
                          <AppBadge tone="warning" size="sm">{stock} un.</AppBadge>
                        ) : (
                          <AppBadge tone="success" size="sm">{stock} un.</AppBadge>
                        )}
                      </span>
                      <span>
                        Preço final:{" "}
                        <span className="font-display font-semibold text-brand-700 tabular-nums">
                          {BRL(variantPrice)}
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </AppCard>
        </div>

        {/* Coluna lateral */}
        <div className="space-y-5 lg:sticky lg:top-24">
          {/* Organização */}
          <AppCard className="p-5 sm:p-6">
            <h2 className="font-display font-bold text-ink-900 mb-4">Organização</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-ink-200 bg-ink-50/40">
                <div>
                  <div className="text-sm font-medium text-ink-900">Produto ativo</div>
                  <div className="text-xs text-ink-500">
                    {watchedIsActive ? "Visível na loja" : "Oculto da loja"}
                  </div>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    {...register("isActive")}
                  />
                  <div
                    className={cn(
                      "relative w-10 h-6 rounded-full transition-colors",
                      watchedIsActive ? "bg-brand-600" : "bg-ink-300",
                    )}
                    onClick={() => setValue("isActive", !watchedIsActive)}
                  >
                    <div
                      className={cn(
                        "absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform",
                        watchedIsActive ? "translate-x-5" : "translate-x-1",
                      )}
                    />
                  </div>
                </label>
              </div>

              <AppField label="Categoria">
                <select
                  className="w-full bg-white border border-ink-200 rounded-lg px-3 py-2.5 text-sm text-ink-900 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  {...register("categoryId")}
                >
                  <option value="">Sem categoria</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </AppField>
            </div>
          </AppCard>

          {/* Resumo */}
          <AppCard className="p-5 sm:p-6">
            <h2 className="font-display font-bold text-ink-900 mb-4">Resumo</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-ink-500">Variações</dt>
                <dd className="font-medium text-ink-900 tabular-nums">{fields.length}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-500">Estoque total</dt>
                <dd className={cn("font-medium tabular-nums", totalStock === 0 ? "text-red-600" : "text-ink-900")}>
                  {totalStock} un.
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-500">Faixa de preço</dt>
                <dd className="font-display font-semibold text-brand-700 tabular-nums">{priceRange}</dd>
              </div>
            </dl>
          </AppCard>

          {/* Salvar (mobile) */}
          <AppButton
            type="submit"
            fullWidth
            size="lg"
            icon="Check"
            loading={saving}
            className="lg:hidden"
          >
            Salvar produto
          </AppButton>
        </div>
      </div>
    </form>
  );
}
