"use client";

import { useState } from "react";
import { AppButton, AppSpinner, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useAuth } from "@/features/auth";
import { AddressFormDrawer } from "../../account/components/AddressFormDrawer";
import { useAddresses } from "../hooks";
import type { Address } from "../service";

type Props = {
  slug: string;
  deliveryType: "delivery" | "pickup";
  addressId: string | null;
  onDeliveryType: (t: "delivery" | "pickup") => void;
  onAddress: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
};

function fmtAddress(a: Address) {
  const line1 = [a.street, a.number, a.complement].filter(Boolean).join(", ");
  const line2 = [a.neighborhood, a.city && a.state ? `${a.city}/${a.state}` : a.city ?? a.state, a.zipCode]
    .filter(Boolean)
    .join(" · ");
  return { line1, line2 };
}

const TYPES = [
  { key: "delivery" as const, label: "Entrega", icon: "Bike" as const, desc: "30–40 min" },
  { key: "pickup" as const, label: "Retirada na loja", icon: "Store" as const, desc: "Pronto em 15 min" },
];

export function DeliveryStep({ slug, deliveryType, addressId, onDeliveryType, onAddress, onNext, onBack }: Props) {
  const { isAuthenticated } = useAuth();
  const { data: addresses, isLoading, isError } = useAddresses(slug);
  const [formOpen, setFormOpen] = useState(false);

  const hasAddresses = !!addresses?.length;
  const canProceed = deliveryType === "pickup" || (deliveryType === "delivery" && addressId);

  return (
    <div className="space-y-5">
      {/* Tipo */}
      <section className="bg-white border border-ink-200 rounded-2xl shadow-soft p-5 sm:p-6">
        <h2 className="font-display font-bold text-ink-900 mb-3">Como deseja receber?</h2>
        <div className="grid grid-cols-2 gap-3">
          {TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => onDeliveryType(t.key)}
              className={cn(
                "p-4 rounded-xl border text-left transition-all",
                deliveryType === t.key
                  ? "border-brand-600 bg-brand-50 ring-2 ring-brand-100"
                  : "border-ink-200 hover:bg-ink-50",
              )}
            >
              <Icon name={t.icon} size={22} className={deliveryType === t.key ? "text-brand-700" : "text-ink-500"} />
              <div className="mt-2 text-sm font-semibold text-ink-900">{t.label}</div>
              <div className="text-[12px] text-ink-500">{t.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Endereço */}
      {deliveryType === "delivery" ? (
        <section className="bg-white border border-ink-200 rounded-2xl shadow-soft p-5 sm:p-6">
          <h2 className="font-display font-bold text-ink-900 mb-3">Endereço de entrega</h2>

          {isLoading ? (
            <div className="flex justify-center py-6"><AppSpinner /></div>
          ) : !isAuthenticated ? (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
              <Icon name="Info" size={15} className="mt-0.5 shrink-0" />
              <span>
                Faça <a href={`/stores/${slug}/login`} className="font-semibold underline">login</a> para usar seus endereços salvos, ou prossiga sem selecionar (o endereço será confirmado no preparo do pedido).
              </span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {isError ? (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                  <Icon name="CircleAlert" size={15} className="mt-0.5 shrink-0" />
                  <span>Não foi possível carregar seus endereços. Você pode cadastrar um novo abaixo.</span>
                </div>
              ) : !hasAddresses ? (
                <p className="text-[13.5px] text-ink-500">
                  Você ainda não tem endereço cadastrado. Adicione um para receber seu pedido.
                </p>
              ) : null}
              {addresses?.map((a) => {
                const { line1, line2 } = fmtAddress(a);
                const active = addressId === a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => onAddress(a.id!)}
                    className={cn(
                      "w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3",
                      active ? "border-brand-600 bg-brand-50/60 ring-2 ring-brand-100" : "border-ink-200 hover:bg-ink-50",
                    )}
                  >
                    <Icon name="MapPin" size={18} className={cn("mt-0.5", active ? "text-brand-700" : "text-ink-400")} />
                    <div className="flex-1 min-w-0 text-[13.5px]">
                      <div className="font-medium text-ink-900">{line1}</div>
                      <div className="text-ink-500">{line2}</div>
                    </div>
                    {active && <Icon name="CircleCheck" size={18} className="text-brand-600" />}
                  </button>
                );
              })}
              <button
                onClick={() => setFormOpen(true)}
                className="w-full p-3.5 rounded-xl border border-dashed border-ink-300 text-sm font-medium text-ink-600 hover:border-brand-400 hover:text-brand-700 transition-all inline-flex items-center justify-center gap-1.5"
              >
                <Icon name="Plus" size={15} /> Adicionar novo endereço
              </button>
            </div>
          )}
        </section>
      ) : (
        <section className="bg-white border border-ink-200 rounded-2xl shadow-soft p-5 sm:p-6 flex items-start gap-3">
          <span className="h-11 w-11 rounded-lg bg-brand-100 text-brand-700 grid place-items-center shrink-0">
            <Icon name="Store" size={20} />
          </span>
          <div className="text-[13.5px]">
            <div className="font-medium text-ink-900">Retirar na loja</div>
            <div className="text-ink-500 mt-0.5">Pronto para retirada em aproximadamente 15 minutos.</div>
          </div>
        </section>
      )}

      <div className="flex gap-3">
        <AppButton variant="outline" icon="ArrowLeft" onClick={onBack}>
          Voltar
        </AppButton>
        <AppButton
          fullWidth
          size="lg"
          iconRight="ArrowRight"
          onClick={onNext}
          disabled={!canProceed && deliveryType === "delivery" && !!addresses?.length}
        >
          Ir para pagamento
        </AppButton>
      </div>

      <AddressFormDrawer
        slug={slug}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onCreated={(a) => a.id && onAddress(a.id)}
      />
    </div>
  );
}
