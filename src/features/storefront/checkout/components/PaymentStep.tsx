"use client";

import { AppButton, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { IconName } from "@/components/ui";
import { storeBRL } from "../../format";

const PAYMENT_METHODS: { key: string; label: string; icon: IconName; hint: string }[] = [
  { key: "pix", label: "Pix", icon: "QrCode", hint: "Aprovação imediata" },
  { key: "credit_card", label: "Cartão de crédito", icon: "CreditCard", hint: "Em até 12x" },
  { key: "cash", label: "Dinheiro", icon: "Banknote", hint: "Pague na entrega" },
];

type Props = {
  method: string;
  total: number;
  submitting: boolean;
  onMethod: (m: string) => void;
  onConfirm: () => void;
  onBack: () => void;
};

export function PaymentStep({ method, total, submitting, onMethod, onConfirm, onBack }: Props) {
  return (
    <div className="space-y-5">
      <section className="bg-white border border-ink-200 rounded-2xl shadow-soft p-5 sm:p-6">
        <h2 className="font-display font-bold text-ink-900 mb-3">Forma de pagamento</h2>
        <div className="space-y-2.5">
          {PAYMENT_METHODS.map((m) => {
            const active = method === m.key;
            return (
              <button
                key={m.key}
                onClick={() => onMethod(m.key)}
                className={cn(
                  "w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3",
                  active ? "border-brand-600 bg-brand-50/60 ring-2 ring-brand-100" : "border-ink-200 hover:bg-ink-50",
                )}
              >
                <span className={cn("h-10 w-10 rounded-lg grid place-items-center shrink-0", active ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-500")}>
                  <Icon name={m.icon} size={18} />
                </span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-ink-900">{m.label}</div>
                  <div className="text-[12px] text-ink-500">{m.hint}</div>
                </div>
                {active && <Icon name="CircleCheck" size={18} className="text-brand-600" />}
              </button>
            );
          })}
        </div>

        {method === "pix" && (
          <div className="mt-4 p-4 rounded-xl bg-ink-50 border border-ink-200 text-center">
            <div className="mx-auto h-24 w-24 rounded-xl bg-ink-900 grid place-items-center">
              <Icon name="QrCode" size={52} className="text-white" />
            </div>
            <p className="mt-2 text-xs text-ink-500">QR Code gerado após confirmar o pedido.</p>
          </div>
        )}
      </section>

      <div className="flex gap-3">
        <AppButton variant="outline" icon="ArrowLeft" onClick={onBack}>
          Voltar
        </AppButton>
        <AppButton fullWidth size="lg" icon="Check" onClick={onConfirm} loading={submitting}>
          Finalizar pedido · {storeBRL(total)}
        </AppButton>
      </div>
    </div>
  );
}
