"use client";

import { useState } from "react";
import {
  AppButton,
  AppCard,
  AppEmptyState,
  AppErrorState,
  AppSpinner,
  Icon,
} from "@/components/ui";
import { useAddresses } from "../hooks";
import { AddressFormDrawer } from "./AddressFormDrawer";

type Props = { slug: string };

export function AddressesTab({ slug }: Props) {
  const { data: addresses, isLoading, isError, error } = useAddresses(slug);
  const [formOpen, setFormOpen] = useState(false);

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

      <AddressFormDrawer slug={slug} open={formOpen} onClose={() => setFormOpen(false)} />
    </>
  );
}
