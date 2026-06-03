"use client";

import { useState } from "react";
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
  useCreateDeliverer,
  useDeleteDeliverer,
  useDeliverers,
  useUpdateDeliverer,
} from "../hooks";
import { vehicleInfo } from "../vehicle";
import type { Deliverer } from "../service";
import { DelivererForm, type DelivererFormValues } from "./DelivererForm";

export function DeliverersList() {
  const { data: deliverers, isLoading, isError, error, refetch } = useDeliverers();
  const createD = useCreateDeliverer();
  const updateD = useUpdateDeliverer();
  const deleteD = useDeleteDeliverer();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Deliverer | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const list = deliverers ?? [];
  const activeCount = list.filter((d) => d.isActive).length;

  function openNew() {
    setEditing(null);
    setFormError(null);
    setOpen(true);
  }
  function openEdit(d: Deliverer) {
    setEditing(d);
    setFormError(null);
    setOpen(true);
  }
  function close() {
    setOpen(false);
    setEditing(null);
    setFormError(null);
  }

  async function handleSave(values: DelivererFormValues) {
    setFormError(null);
    try {
      if (editing?.id) {
        await updateD.mutateAsync({
          id: editing.id,
          body: {
            name: values.name,
            phone: values.phone,
            vehicleType: values.vehicleType,
            isActive: values.isActive,
          },
        });
      } else {
        await createD.mutateAsync({
          name: values.name,
          phone: values.phone,
          vehicleType: values.vehicleType,
        });
      }
      close();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.messages[0] : "Erro ao salvar entregador.");
    }
  }

  async function handleDelete() {
    if (!editing?.id) return;
    setFormError(null);
    try {
      await deleteD.mutateAsync(editing.id);
      close();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.messages[0] : "Erro ao excluir entregador.");
    }
  }

  async function quickToggle(d: Deliverer) {
    if (!d.id) return;
    setTogglingId(d.id);
    try {
      await updateD.mutateAsync({
        id: d.id,
        body: {
          name: d.name ?? "",
          phone: d.phone ?? "",
          vehicleType: d.vehicleType ?? "Motorcycle",
          isActive: !d.isActive,
        },
      });
    } catch {
      /* silencioso; o refetch corrige */
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-ink-900 tracking-tight">
            Entregadores
          </h1>
          <p className="text-sm text-ink-500 mt-0.5">
            {list.length === 0 ? "Nenhum entregador" : `${activeCount} ativos de ${list.length}`}
          </p>
        </div>
        <AppButton icon="Plus" onClick={openNew}>
          Novo entregador
        </AppButton>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <AppSpinner className="h-10 w-10" />
        </div>
      ) : isError ? (
        <AppErrorState title="Erro ao carregar entregadores" error={error} onRetry={() => refetch()} />
      ) : list.length === 0 ? (
        <AppEmptyState
          icon="Bike"
          title="Nenhum entregador cadastrado"
          desc="Cadastre os entregadores que farão as entregas da sua loja."
          action={
            <AppButton icon="Plus" onClick={openNew}>
              Novo entregador
            </AppButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map((d) => {
            const vt = vehicleInfo(d.vehicleType);
            return (
              <AppCard key={d.id} className="p-4 flex items-center gap-3">
                <span
                  className={`h-12 w-12 rounded-full grid place-items-center font-bold shrink-0 ${
                    d.isActive ? "bg-brand-100 text-brand-700" : "bg-ink-100 text-ink-400"
                  }`}
                >
                  {(d.name ?? "?").slice(0, 1).toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold text-[15px] text-ink-900 truncate">
                    {d.name}
                  </div>
                  <div className="text-[12.5px] text-ink-500 truncate">{d.phone}</div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <AppBadge tone="neutral" size="sm">
                      <Icon name={vt.icon} size={11} /> {vt.label}
                    </AppBadge>
                    {d.isActive ? (
                      <AppBadge tone="success" size="sm" dot>
                        Ativo
                      </AppBadge>
                    ) : (
                      <AppBadge tone="neutral" size="sm">
                        Inativo
                      </AppBadge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0 self-start">
                  <button
                    type="button"
                    onClick={() => quickToggle(d)}
                    disabled={togglingId === d.id}
                    title={d.isActive ? "Desativar" : "Ativar"}
                    className="h-8 w-8 grid place-items-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition-colors disabled:opacity-50"
                  >
                    {togglingId === d.id ? (
                      <AppSpinner className="h-4 w-4" />
                    ) : (
                      <Icon name={d.isActive ? "EyeOff" : "Eye"} size={16} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(d)}
                    title="Editar"
                    className="h-8 w-8 grid place-items-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition-colors"
                  >
                    <Icon name="Pencil" size={16} />
                  </button>
                </div>
              </AppCard>
            );
          })}
        </div>
      )}

      <DelivererForm
        open={open}
        deliverer={editing}
        saving={createD.isPending || updateD.isPending}
        deleting={deleteD.isPending}
        error={formError}
        onClose={close}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </>
  );
}
