"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppButton, AppDrawer, AppField, AppInput, AppSpinner, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useCategory } from "../hooks";
import { slugify, type RequestCategory } from "../service";

const schema = z.object({
  name: z.string().min(1, "Informe o nome da categoria."),
  slug: z
    .string()
    .min(2, "Slug muito curto.")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e -"),
  displayOrder: z.coerce.number().int("Ordem inválida.").min(0, "Ordem inválida."),
  isActive: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  /** null = criar; id = editar (carrega detalhe via GET /categories/{id}). */
  categoryId: string | null;
  /** posição sugerida ao criar (fim da lista). */
  nextOrder?: number;
  saving?: boolean;
  deleting?: boolean;
  error?: string | null;
  onClose: () => void;
  onSave: (values: CategoryFormValues) => void;
  onDelete: () => void;
};

export function CategoryForm({
  open,
  categoryId,
  nextOrder = 1,
  saving,
  deleting,
  error,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const isEdit = !!categoryId;
  const detail = useCategory(open && isEdit ? categoryId : null);
  const [slugEdited, setSlugEdited] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "", displayOrder: nextOrder, isActive: true },
  });

  // Prefill: detalhe (edição) ou valores de criação.
  useEffect(() => {
    if (!open) return;
    setConfirmDel(false);
    if (isEdit && detail.data) {
      setSlugEdited(true);
      reset({
        name: detail.data.name ?? "",
        slug: detail.data.slug ?? "",
        displayOrder: Number(detail.data.displayOrder ?? 0),
        isActive: detail.data.isActive ?? true,
      });
    } else if (!isEdit) {
      setSlugEdited(false);
      reset({ name: "", slug: "", displayOrder: nextOrder, isActive: true });
    }
  }, [open, isEdit, detail.data, nextOrder, reset]);

  const name = watch("name");
  const isActive = watch("isActive");

  // Auto-slug a partir do nome enquanto o slug não foi editado à mão.
  useEffect(() => {
    if (!slugEdited && name) setValue("slug", slugify(name));
  }, [name, slugEdited, setValue]);

  function handleClose() {
    reset();
    setSlugEdited(false);
    onClose();
  }

  const loadingDetail = isEdit && detail.isLoading;

  return (
    <AppDrawer
      open={open}
      onClose={handleClose}
      icon="Tags"
      title={isEdit ? "Editar categoria" : "Nova categoria"}
      subtitle={isEdit ? "Atualize os dados da categoria" : "Crie uma categoria para organizar seus produtos"}
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
          <AppButton
            type="submit"
            form="category-form"
            fullWidth
            icon="Check"
            loading={saving}
            disabled={loadingDetail}
          >
            Salvar
          </AppButton>
        </div>
      }
    >
      {loadingDetail ? (
        <div className="flex justify-center py-16">
          <AppSpinner className="h-8 w-8" />
        </div>
      ) : (
        <form id="category-form" onSubmit={handleSubmit(onSave)} className="p-5 space-y-4" noValidate>
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700 flex items-center gap-2">
              <Icon name="CircleAlert" size={15} className="shrink-0" />
              {error}
            </div>
          )}

          <AppInput
            label="Nome"
            required
            placeholder="Ex: Bebidas"
            icon="Tag"
            error={errors.name?.message}
            {...register("name")}
          />

          <AppInput
            label="Slug"
            icon="Link"
            hint="Identificador na URL."
            error={errors.slug?.message}
            {...register("slug", {
              onChange: (e) => {
                setSlugEdited(true);
                e.target.value = slugify(e.target.value);
              },
            })}
          />

          <AppInput
            label="Ordem de exibição"
            type="number"
            inputMode="numeric"
            icon="ArrowDownUp"
            error={errors.displayOrder?.message}
            {...register("displayOrder")}
          />

          <button
            type="button"
            onClick={() => setValue("isActive", !isActive, { shouldDirty: true })}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-ink-200 bg-ink-50/40 text-left"
          >
            <span className="text-sm font-medium text-ink-900">Categoria ativa</span>
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
      )}
    </AppDrawer>
  );
}
