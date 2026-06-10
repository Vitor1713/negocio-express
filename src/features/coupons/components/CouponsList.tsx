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
import { cn } from "@/lib/cn";
import {
  useCoupons,
  useCreateCoupon,
  useDeleteCoupon,
  useUpdateCoupon,
} from "../hooks";
import { BRL, couponValueLabel, discountTypeLabel, num } from "../discount";
import type { Coupon, RequestCoupon } from "../service";
import { CouponForm } from "./CouponForm";

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : null;

/** Coupon (resposta) → RequestCoupon (corpo), p/ reenviar no toggle rápido. */
const toRequest = (c: Coupon): RequestCoupon => ({
  code: c.code ?? "",
  discountType: c.discountType ?? "Percentage",
  discountValue: num(c.discountValue),
  minOrderAmount: c.minOrderAmount != null ? num(c.minOrderAmount) : null,
  maxUses: c.maxUses != null ? Number(c.maxUses) : null,
  validFrom: c.validFrom ?? null,
  validUntil: c.validUntil ?? null,
  isActive: c.isActive ?? false,
});

export function CouponsList() {
  const { data, isLoading, isError, error, refetch } = useCoupons();
  const createC = useCreateCoupon();
  const updateC = useUpdateCoupon();
  const deleteC = useDeleteCoupon();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const list = data ?? [];
  const activeCount = list.filter((c) => c.isActive).length;

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

  async function handleSave(body: RequestCoupon) {
    setFormError(null);
    try {
      if (editingId) await updateC.mutateAsync({ id: editingId, body });
      else await createC.mutateAsync(body);
      close();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.messages[0] : "Erro ao salvar o cupom.");
    }
  }

  async function handleDelete() {
    if (!editingId) return;
    setFormError(null);
    try {
      await deleteC.mutateAsync(editingId);
      close();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.messages[0] : "Erro ao excluir o cupom.");
    }
  }

  async function quickToggle(c: Coupon) {
    if (!c.id) return;
    setTogglingId(c.id);
    try {
      await updateC.mutateAsync({ id: c.id, body: { ...toRequest(c), isActive: !c.isActive } });
    } catch {
      /* silencioso; o refetch corrige o estado */
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-ink-900 tracking-tight">Cupons</h1>
          <p className="text-sm text-ink-500 mt-0.5">
            {list.length === 0
              ? "Nenhum cupom"
              : `${activeCount} ${activeCount === 1 ? "ativo" : "ativos"} de ${list.length}`}
          </p>
        </div>
        <AppButton icon="Plus" onClick={openNew}>
          Novo cupom
        </AppButton>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <AppSpinner className="h-10 w-10" />
        </div>
      ) : isError ? (
        <AppErrorState title="Erro ao carregar cupons" error={error} onRetry={() => refetch()} />
      ) : list.length === 0 ? (
        <AppEmptyState
          icon="Ticket"
          title="Nenhum cupom ainda"
          desc="Crie cupons de desconto para atrair e fidelizar clientes."
          action={
            <AppButton icon="Plus" onClick={openNew}>
              Novo cupom
            </AppButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map((c) => {
            const maxUses = c.maxUses != null ? Number(c.maxUses) : null;
            const used = Number(c.usedCount ?? 0);
            const exhausted = maxUses != null && used >= maxUses;
            const pct = maxUses ? Math.min(100, Math.round((used / maxUses) * 100)) : null;
            const validUntil = fmtDate(c.validUntil);
            const minOrder = c.minOrderAmount != null ? num(c.minOrderAmount) : null;

            return (
              <AppCard key={c.id} className="p-5 flex flex-col" hoverable>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={cn(
                        "h-10 w-10 rounded-xl grid place-items-center shrink-0",
                        c.isActive && !exhausted
                          ? "bg-brand-100 text-brand-700"
                          : "bg-ink-100 text-ink-400",
                      )}
                    >
                      <Icon name="Ticket" size={20} />
                    </span>
                    <div className="min-w-0">
                      <div className="font-mono font-bold text-ink-900 truncate">{c.code}</div>
                      <div className="text-xs text-ink-500">{discountTypeLabel(c.discountType)}</div>
                    </div>
                  </div>
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

                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="font-display font-extrabold text-2xl text-brand-700 tabular-nums">
                    {couponValueLabel(c)}
                  </span>
                  <span className="text-sm text-ink-500">de desconto</span>
                </div>

                <div className="mt-3 space-y-1 text-[12.5px] text-ink-500">
                  {minOrder != null && (
                    <div className="flex items-center gap-1.5">
                      <Icon name="ShoppingCart" size={13} /> Pedido mín. {BRL(minOrder)}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Icon name="Calendar" size={13} />
                    {validUntil ? `Válido até ${validUntil}` : "Sem prazo de validade"}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-ink-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-ink-500">Usos</span>
                    <span className="font-medium text-ink-900 tabular-nums">
                      {used}
                      {maxUses ? ` / ${maxUses}` : " · ilimitado"}
                    </span>
                  </div>
                  {pct != null && (
                    <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", exhausted ? "bg-red-400" : "bg-brand-500")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                  <div className="mt-2">
                    {exhausted ? (
                      <AppBadge tone="danger" size="sm">
                        Esgotado
                      </AppBadge>
                    ) : c.isActive ? (
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

      <CouponForm
        open={open}
        couponId={editingId}
        saving={createC.isPending || updateC.isPending}
        deleting={deleteC.isPending}
        error={formError}
        onClose={close}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </>
  );
}
