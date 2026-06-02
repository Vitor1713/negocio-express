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
import { useCreateDeliverer, useDeliverers } from "../hooks";
import { vehicleInfo } from "../vehicle";
import { DelivererForm, type DelivererFormValues } from "./DelivererForm";

export function DeliverersList() {
  const { data: deliverers, isLoading, isError, error } = useDeliverers();
  const createDeliverer = useCreateDeliverer();
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSave(values: DelivererFormValues) {
    setFormError(null);
    try {
      await createDeliverer.mutateAsync({
        name: values.name,
        phone: values.phone,
        vehicleType: values.vehicleType,
      });
      setFormOpen(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.messages[0] : "Erro ao salvar entregador.");
    }
  }

  const list = deliverers ?? [];
  const activeCount = list.filter((d) => d.isActive).length;

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-ink-900 tracking-tight">
            Entregadores
          </h1>
          <p className="text-sm text-ink-500 mt-0.5">
            {activeCount} ativos de {list.length}
          </p>
        </div>
        <AppButton icon="Plus" onClick={() => setFormOpen(true)}>
          Novo entregador
        </AppButton>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <AppSpinner className="h-10 w-10" />
        </div>
      ) : isError ? (
        <AppErrorState title="Erro ao carregar entregadores" error={error} />
      ) : list.length === 0 ? (
        <AppEmptyState
          icon="Bike"
          title="Nenhum entregador cadastrado"
          desc="Cadastre os entregadores que farão as entregas da sua loja."
          action={
            <AppButton icon="Plus" onClick={() => setFormOpen(true)}>
              Novo entregador
            </AppButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map((d) => {
            const vt = vehicleInfo(d.vehicleType);
            return (
              <AppCard key={d.id} className="p-4 flex items-center gap-3" hoverable>
                <span className="h-12 w-12 rounded-full bg-brand-100 text-brand-700 grid place-items-center font-bold shrink-0">
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
              </AppCard>
            );
          })}
        </div>
      )}

      <DelivererForm
        open={formOpen}
        saving={createDeliverer.isPending}
        error={formError}
        onClose={() => {
          setFormOpen(false);
          setFormError(null);
        }}
        onSave={handleSave}
      />
    </>
  );
}
