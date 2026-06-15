"use client";

import { useMemo, useState } from "react";
import { AppBadge, AppButton, AppErrorState, AppSpinner, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { usePlans } from "../hooks";
import type { Plan } from "../service";

/** Formata BRL: inteiro sem casas, fracionário com 2 casas. */
const BRL = (n: number) =>
  "R$ " +
  n.toLocaleString("pt-BR", {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  });

/** Coerção segura: `price`/`annualPrice` chegam como number | string | null. */
const num = (v: number | string | null | undefined) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

/** Limite de usuários: `null`/ausente = ilimitado. */
const usersLabel = (max: number | string | null | undefined) =>
  max == null ? "Ilimitado" : `Até ${num(max)}`;

type Props = {
  submitting?: boolean;
  onConfirm: (planId: string) => void;
  onBack: () => void;
};

export function Step4Plan({ submitting, onConfirm, onBack }: Props) {
  const { data: plans = [], isLoading, isError } = usePlans();
  const [selected, setSelected] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<Plan | null>(null);

  // Toggle mensal/anual só aparece se algum plano expõe preço anual.
  const hasAnnual = useMemo(
    () => plans.some((p) => p.annualPrice != null && num(p.annualPrice) > 0),
    [plans],
  );
  const [annual, setAnnual] = useState(false);

  // Economia anual headline (maior % entre os planos), arredondada.
  const savingsPct = useMemo(() => {
    let best = 0;
    for (const p of plans) {
      const m = num(p.price);
      const a = num(p.annualPrice);
      if (m > 0 && a > 0) best = Math.max(best, 1 - a / (m * 12));
    }
    return Math.round(best * 100);
  }, [plans]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <AppSpinner className="h-10 w-10" />
      </div>
    );
  }

  if (isError) {
    return <AppErrorState title="Erro ao carregar planos" error={null} />;
  }

  /** Preço mensal exibido: no anual, é o total/12 (equivalente mensal). */
  const monthlyShown = (plan: Plan) => {
    const annualTotal = num(plan.annualPrice);
    return annual && annualTotal > 0 ? annualTotal / 12 : num(plan.price);
  };

  return (
    <>
      <div className="mt-10 text-center">
        <h2 className="font-display font-extrabold text-2xl sm:text-[30px] text-ink-900 tracking-tight text-balance">
          Escolha o plano ideal para o seu negócio
        </h2>
        <p className="mt-2 text-ink-500">Comece grátis e faça upgrade quando quiser.</p>
      </div>

      {/* Toggle de cobrança (apenas quando há preço anual) */}
      {hasAnnual && (
        <div className="mt-7 flex items-center justify-center gap-3">
          <span className={cn("text-sm font-medium", !annual ? "text-ink-900" : "text-ink-400")}>
            Mensal
          </span>
          <button
            type="button"
            onClick={() => setAnnual((a) => !a)}
            className={cn(
              "relative h-7 w-12 rounded-full transition-colors",
              annual ? "bg-brand-600" : "bg-ink-300",
            )}
            aria-label="Alternar cobrança anual"
          >
            <span
              className={cn(
                "absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all",
                annual ? "left-6" : "left-1",
              )}
            />
          </button>
          <span className={cn("text-sm font-medium", annual ? "text-ink-900" : "text-ink-400")}>
            Anual
          </span>
          {savingsPct > 0 && (
            <AppBadge tone="success" size="sm">
              Economize {savingsPct}%
            </AppBadge>
          )}
        </div>
      )}

      {/* Cards de planos */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {plans.map((plan, idx) => {
          const price = monthlyShown(plan);
          const annualTotal = num(plan.annualPrice);
          const isSel = selected === plan.id;
          const isHighlight = idx === 1 && plans.length >= 3;
          const hasTrial = num(plan.trialDays) > 0;
          const features = plan.features ?? [];

          return (
            <div
              key={plan.id}
              onClick={() => setSelected(plan.id ?? null)}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-white p-7 cursor-pointer transition-all duration-200",
                isHighlight
                  ? "border-brand-600 shadow-pop md:-mt-3"
                  : isSel
                    ? "border-brand-400 shadow-soft"
                    : "border-ink-200 shadow-soft hover:border-ink-300 hover:shadow-pop",
              )}
            >
              {isHighlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-600 text-white text-[11px] font-bold px-3 py-1 shadow-soft uppercase tracking-wide">
                    <Icon name="Star" size={11} strokeWidth={3} /> Mais popular
                  </span>
                </div>
              )}

              {/* Header do card */}
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "h-10 w-10 rounded-xl grid place-items-center",
                    isHighlight ? "bg-brand-600 text-white" : "bg-brand-100 text-brand-700",
                  )}
                >
                  <Icon name={price === 0 ? "Sparkles" : idx === 1 ? "Rocket" : "Crown"} size={20} />
                </span>
                <div className="font-display font-extrabold text-lg text-ink-900 leading-none">
                  {plan.name}
                </div>
              </div>

              {/* Tagline */}
              {plan.description && (
                <p className="mt-3 text-sm text-ink-500 leading-snug">{plan.description}</p>
              )}

              {/* Preço */}
              <div className="mt-5 flex items-end gap-1.5">
                <span className="font-display font-extrabold text-[36px] leading-none tracking-tight text-ink-900">
                  {BRL(price)}
                </span>
                {price > 0 && <span className="text-ink-500 text-sm mb-1">/mês</span>}
              </div>
              <div className="mt-1 h-4 text-[12.5px] text-ink-400">
                {price > 0 && annual && annualTotal > 0
                  ? `Cobrado anualmente (${BRL(annualTotal)}/ano)`
                  : price > 0
                    ? "Cobrado mensalmente"
                    : "Para sempre"}
              </div>

              {/* Limites estruturados (Plan DTO) */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-ink-50 border border-ink-100 px-3 py-2">
                  <div className="text-[11px] text-ink-500">Produtos</div>
                  <div className="text-[13px] font-display font-semibold text-ink-900 flex items-center gap-1">
                    <Icon name="Package" size={13} className="text-brand-600" />
                    {plan.productLimit == null ? "Ilimitado" : `Até ${plan.productLimit}`}
                  </div>
                </div>
                {/* Usuários quando o backend expõe maxUsers; senão, Preço (fallback). */}
                {plan.maxUsers !== undefined ? (
                  <div className="rounded-lg bg-ink-50 border border-ink-100 px-3 py-2">
                    <div className="text-[11px] text-ink-500">Usuários</div>
                    <div className="text-[13px] font-display font-semibold text-ink-900 flex items-center gap-1">
                      <Icon name="Users" size={13} className="text-brand-600" />
                      {usersLabel(plan.maxUsers)}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-ink-50 border border-ink-100 px-3 py-2">
                    <div className="text-[11px] text-ink-500">Preço</div>
                    <div className="text-[13px] font-display font-semibold text-ink-900 flex items-center gap-1">
                      <Icon name="CreditCard" size={13} className="text-brand-600" />
                      {price === 0 ? "Grátis" : BRL(price) + "/mês"}
                    </div>
                  </div>
                )}
              </div>

              {/* CTA */}
              <AppButton
                type="button"
                variant={isHighlight ? "primary" : "outline"}
                fullWidth
                className="mt-4"
                iconRight="ArrowRight"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(plan.id ?? null);
                  setConfirming(plan);
                }}
              >
                {price === 0 ? "Começar grátis" : hasTrial ? "Iniciar teste grátis" : "Selecionar plano"}
              </AppButton>
              {hasTrial && (
                <p className="mt-1.5 text-center text-[11.5px] text-ink-500">
                  {plan.trialDays} dias grátis · depois {BRL(price)}/mês
                </p>
              )}

              {/* Recursos (string[] — todos incluídos) */}
              {features.length > 0 && (
                <ul className="mt-6 space-y-2.5 flex-1">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-0.5 h-4 w-4 rounded-full grid place-items-center shrink-0 bg-brand-100 text-brand-700">
                        <Icon name="Check" size={11} strokeWidth={3} />
                      </span>
                      <span className="text-ink-700">{f}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Garantias */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-500">
        <span className="inline-flex items-center gap-1.5">
          <Icon name="ShieldCheck" size={16} className="text-brand-600" /> Pagamento seguro
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Icon name="RefreshCw" size={16} className="text-brand-600" /> Cancele quando quiser
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Icon name="Headset" size={16} className="text-brand-600" /> Suporte em português
        </span>
      </div>

      <div className="mt-6 flex justify-center">
        <AppButton type="button" variant="ghost" icon="ArrowLeft" onClick={onBack} size="sm">
          Voltar
        </AppButton>
      </div>

      {/* Modal de confirmação */}
      {confirming && (
        <PlanConfirmModal
          plan={confirming}
          annual={annual}
          submitting={submitting}
          onClose={() => setConfirming(null)}
          onConfirm={() => onConfirm(confirming.id!)}
        />
      )}
    </>
  );
}

function PlanConfirmModal({
  plan,
  annual,
  submitting,
  onClose,
  onConfirm,
}: {
  plan: Plan;
  annual: boolean;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const annualTotal = num(plan.annualPrice);
  const useAnnual = annual && annualTotal > 0;
  const monthly = useAnnual ? annualTotal / 12 : num(plan.price);
  const hasTrial = num(plan.trialDays) > 0;
  const isFree = monthly === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-ink-900/50" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-[440px] sm:rounded-2xl rounded-t-2xl shadow-2xl p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full text-ink-500 hover:bg-ink-100 transition-colors"
        >
          <Icon name="X" size={18} />
        </button>

        <div className="flex items-center gap-3">
          <span className="h-12 w-12 rounded-xl bg-brand-100 text-brand-700 grid place-items-center">
            <Icon name={monthly === 0 ? "Sparkles" : "Rocket"} size={24} />
          </span>
          <div>
            <div className="text-xs text-ink-500">Plano selecionado</div>
            <div className="font-display font-extrabold text-xl text-ink-900">{plan.name}</div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-ink-200 divide-y divide-ink-100">
          {hasTrial ? (
            <>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-ink-500">Hoje você paga</span>
                <span className="font-display font-bold text-brand-700">R$ 0,00</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-ink-500">Após {plan.trialDays} dias</span>
                <span className="font-medium text-ink-900 tabular-nums">
                  {useAnnual ? `${BRL(annualTotal)}/ano` : `${BRL(monthly)}/mês`}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-ink-500">Plano {isFree ? "gratuito" : useAnnual ? "anual" : "mensal"}</span>
              <span className="font-display font-bold text-brand-700">
                {isFree
                  ? "R$ 0,00 para sempre"
                  : useAnnual
                    ? `${BRL(annualTotal)}/ano`
                    : `${BRL(monthly)}/mês`}
              </span>
            </div>
          )}
          {plan.productLimit != null && (
            <div className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-ink-500">Limite de produtos</span>
              <span className="font-medium text-ink-900">Até {plan.productLimit}</span>
            </div>
          )}
          {plan.maxUsers !== undefined && (
            <div className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-ink-500">Usuários</span>
              <span className="font-medium text-ink-900">{usersLabel(plan.maxUsers)}</span>
            </div>
          )}
        </div>

        {hasTrial && (
          <p className="mt-3 text-xs text-ink-500 flex items-start gap-1.5">
            <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
            Você pode cancelar antes do fim do teste e não será cobrado.
          </p>
        )}

        <AppButton
          type="button"
          fullWidth
          size="lg"
          iconRight="ArrowRight"
          loading={submitting}
          className="mt-5"
          onClick={onConfirm}
        >
          {isFree ? "Começar a usar" : "Confirmar e iniciar teste"}
        </AppButton>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full h-10 rounded-lg text-sm text-ink-500 hover:text-ink-900 transition-colors"
        >
          Voltar aos planos
        </button>
      </div>
    </div>
  );
}
