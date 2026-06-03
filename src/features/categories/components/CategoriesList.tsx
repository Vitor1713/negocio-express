"use client";

import { useMemo, useState } from "react";
import {
  AppBadge,
  AppButton,
  AppCard,
  AppEmptyState,
  AppErrorState,
  AppSpinner,
  Icon,
} from "@/components/ui";
import { ApiError } from "@/lib/api";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "../hooks";
import type { Category } from "../service";
import { CategoryForm, type CategoryFormValues } from "./CategoryForm";

const ord = (c: Category) => Number(c.displayOrder ?? 0);

export function CategoriesList() {
  const { data, isLoading, isError, error, refetch } = useCategories();
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const list = useMemo(() => [...(data ?? [])].sort((a, b) => ord(a) - ord(b)), [data]);
  const activeCount = list.filter((c) => c.isActive).length;
  const nextOrder = list.length ? Math.max(...list.map(ord)) + 1 : 1;

  function openNew() {
    setEditingId(null);
    setFormError(null);
    setOpen(true);
  }
  function openEdit(id: string) {
    setEditingId(id);
    setFormError(null);
    setOpen(true);
  }
  function close() {
    setOpen(false);
    setEditingId(null);
    setFormError(null);
  }

  async function handleSave(values: CategoryFormValues) {
    setFormError(null);
    const body = {
      name: values.name,
      slug: values.slug,
      displayOrder: values.displayOrder,
      isActive: values.isActive,
    };
    try {
      if (editingId) await updateCat.mutateAsync({ id: editingId, body });
      else await createCat.mutateAsync(body);
      close();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.messages[0] : "Erro ao salvar a categoria.");
    }
  }

  async function handleDelete() {
    if (!editingId) return;
    setFormError(null);
    try {
      await deleteCat.mutateAsync(editingId);
      close();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.messages[0] : "Erro ao excluir a categoria.");
    }
  }

  // Ativar/desativar rápido sem abrir o drawer.
  async function quickToggle(c: Category) {
    if (!c.id) return;
    setTogglingId(c.id);
    try {
      await updateCat.mutateAsync({
        id: c.id,
        body: {
          name: c.name ?? "",
          slug: c.slug ?? "",
          displayOrder: Number(c.displayOrder ?? 0),
          isActive: !c.isActive,
        },
      });
    } catch {
      /* erro silencioso no toggle rápido; estado volta ao refazer a query */
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-ink-900 tracking-tight">
            Categorias
          </h1>
          <p className="text-sm text-ink-500 mt-0.5">
            {list.length} {list.length === 1 ? "categoria" : "categorias"}
            {list.length > 0 && ` · ${activeCount} ${activeCount === 1 ? "ativa" : "ativas"}`}
          </p>
        </div>
        <AppButton icon="Plus" onClick={openNew}>
          Nova categoria
        </AppButton>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <AppSpinner className="h-10 w-10" />
        </div>
      ) : isError ? (
        <AppErrorState title="Erro ao carregar categorias" error={error} onRetry={() => refetch()} />
      ) : list.length === 0 ? (
        <AppEmptyState
          icon="Tags"
          title="Nenhuma categoria ainda"
          desc="Crie categorias para organizar o catálogo da sua loja."
          action={
            <AppButton icon="Plus" onClick={openNew}>
              Nova categoria
            </AppButton>
          }
        />
      ) : (
        <AppCard className="overflow-hidden">
          <div className="divide-y divide-ink-100">
            {list.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-ink-50 transition-colors"
              >
                <span className="h-8 w-8 rounded-lg bg-ink-100 text-ink-500 grid place-items-center text-xs font-bold tabular-nums shrink-0">
                  {ord(c)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-ink-900 truncate">{c.name}</div>
                  <div className="text-xs text-ink-500 font-mono truncate">/{c.slug}</div>
                </div>
                {c.isActive ? (
                  <AppBadge tone="success" size="sm">
                    Ativa
                  </AppBadge>
                ) : (
                  <AppBadge tone="neutral" size="sm">
                    Inativa
                  </AppBadge>
                )}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => quickToggle(c)}
                    disabled={togglingId === c.id}
                    title={c.isActive ? "Desativar" : "Ativar"}
                    className="h-8 w-8 grid place-items-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition-colors disabled:opacity-50"
                  >
                    {togglingId === c.id ? (
                      <AppSpinner className="h-4 w-4" />
                    ) : (
                      <Icon name={c.isActive ? "EyeOff" : "Eye"} size={16} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => c.id && openEdit(c.id)}
                    title="Editar"
                    className="h-8 w-8 grid place-items-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition-colors"
                  >
                    <Icon name="Pencil" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </AppCard>
      )}

      <CategoryForm
        open={open}
        categoryId={editingId}
        nextOrder={nextOrder}
        saving={createCat.isPending || updateCat.isPending}
        deleting={deleteCat.isPending}
        error={formError}
        onClose={close}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </>
  );
}
