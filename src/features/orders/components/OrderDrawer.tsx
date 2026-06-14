"use client";

import { useState } from "react";
import { AppBadge, AppButton, AppDrawer, AppSpinner, Icon } from "@/components/ui";
import { ApiError } from "@/lib/api";
import { useRefundPayment } from "@/features/store";
import { useOrder, useStatusFlow } from "../hooks";
import type { OrderShort } from "../service";
import { CANCELLED, ORDER_FLOW, deliveryInfo, isFinal, statusInfo } from "../status";

const num = (v: number | string | null | undefined) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};
const BRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

const fmtDateTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";

type Props = {
  order: OrderShort | null;
  onClose: () => void;
  onAdvance: (order: OrderShort, next: string) => void;
  onCancel: (order: OrderShort) => void;
  updating?: boolean;
};

export function OrderDrawer({ order, onClose, onAdvance, onCancel, updating }: Props) {
  const detailQ = useOrder(order?.id ?? null);
  const flowQ = useStatusFlow();
  const detail = detailQ.data;

  const refund = useRefundPayment();
  const [confirmingRefund, setConfirmingRefund] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  // O estorno precisa do id do pagamento. O contrato ainda NÃO expõe esse id no
  // detalhe do pedido (ResponseOrderDetail) nem há GET de pagamentos — então a
  // ação fica disponível só quando o backend passar a trazer `payment.id`.
  const paymentId = (detail as { payment?: { id?: string } } | undefined)?.payment?.id;

  async function handleRefund() {
    if (!paymentId) return;
    setRefundError(null);
    try {
      await refund.mutateAsync(paymentId);
      setConfirmingRefund(false);
    } catch (err) {
      setRefundError(
        err instanceof ApiError
          ? err.status === 502
            ? "Falha de comunicação com o provedor. Tente novamente."
            : err.messages[0]
          : "Não foi possível estornar. Tente novamente.",
      );
    }
  }

  // Status "ao vivo" (detalhe) com fallback no short.
  const status = detail?.status ?? order?.status;
  const st = statusInfo(status);
  const dt = deliveryInfo(detail?.deliveryType ?? order?.deliveryType);
  const stepIdx = ORDER_FLOW.indexOf(status as (typeof ORDER_FLOW)[number]);
  const cancelled = status === CANCELLED;
  const final = isFinal(status);

  const allowed = flowQ.data?.find((n) => n.status === status)?.allowedNextStatuses ?? [];
  const advanceTo = allowed.filter((s) => s !== CANCELLED);
  const canCancel = allowed.includes(CANCELLED);

  const number = detail?.number ?? order?.number;
  const customerName = detail?.customer?.name ?? order?.customerId ?? "—";

  return (
    <AppDrawer
      open={!!order}
      onClose={onClose}
      icon="ShoppingBag"
      title={order ? `Pedido #${number ?? ""}` : ""}
      subtitle={order ? fmtDateTime(detail?.createdAt ?? order.createdAt) : ""}
      footer={
        order && !final ? (
          <div className="flex gap-2">
            {canCancel && (
              <AppButton variant="danger" icon="X" onClick={() => onCancel(order)} loading={updating}>
                Cancelar
              </AppButton>
            )}
            {advanceTo.map((next) => (
              <AppButton
                key={next}
                fullWidth
                iconRight="ArrowRight"
                onClick={() => onAdvance(order, next)}
                loading={updating}
              >
                Marcar como {statusInfo(next).label}
              </AppButton>
            ))}
          </div>
        ) : null
      }
    >
      {order && (
        <div className="p-5 space-y-5">
          {/* Cliente + status */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="h-10 w-10 rounded-full bg-brand-100 text-brand-700 grid place-items-center font-bold shrink-0">
                {customerName.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink-900 leading-tight truncate">
                  {customerName}
                </div>
                <div className="text-xs text-ink-500 inline-flex items-center gap-1">
                  <Icon name={dt.icon} size={12} /> {dt.label}
                  {detail?.customer?.phone && <span>· {detail.customer.phone}</span>}
                </div>
              </div>
            </div>
            <AppBadge tone={st.tone} dot>
              {st.label}
            </AppBadge>
          </div>

          {/* Timeline */}
          {!cancelled ? (
            <div className="flex items-center gap-1">
              {ORDER_FLOW.map((s, i) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      i <= stepIdx ? "bg-brand-500" : "bg-ink-200"
                    }`}
                  />
                  {i < ORDER_FLOW.length - 1 && (
                    <div className={`flex-1 h-0.5 ${i < stepIdx ? "bg-brand-500" : "bg-ink-200"}`} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 flex items-center gap-2">
              <Icon name="CircleX" size={15} /> Pedido cancelado
            </div>
          )}

          {/* Itens (GET /orders/{id}) */}
          {detailQ.isLoading ? (
            <div className="flex justify-center py-6">
              <AppSpinner className="h-7 w-7" />
            </div>
          ) : detailQ.isError ? (
            <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
              Não foi possível carregar os itens do pedido.
            </div>
          ) : detail ? (
            <>
              <div>
                <div className="text-xs font-medium text-ink-500 uppercase tracking-wide mb-2">
                  Itens
                </div>
                <div className="divide-y divide-ink-100 rounded-lg border border-ink-200">
                  {(detail.items ?? []).map((it) => (
                    <div key={it.id} className="flex items-center gap-3 px-3 py-2.5">
                      <span className="h-6 min-w-6 px-1.5 rounded-md bg-ink-100 text-ink-700 text-xs font-bold grid place-items-center tabular-nums">
                        {num(it.quantity)}×
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-ink-900 truncate">
                          {it.productName}
                        </div>
                        {it.variantName && (
                          <div className="text-[11.5px] text-ink-500 truncate">{it.variantName}</div>
                        )}
                      </div>
                      <span className="text-[13px] text-ink-900 tabular-nums">
                        {BRL(num(it.quantity) * num(it.unitPrice))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Endereço de entrega */}
              {detail.address && (
                <div>
                  <div className="text-xs font-medium text-ink-500 uppercase tracking-wide mb-2">
                    Endereço
                  </div>
                  <div className="rounded-lg border border-ink-200 px-3 py-2.5 text-[13px] text-ink-700 flex items-start gap-2">
                    <Icon name="MapPin" size={14} className="mt-0.5 shrink-0 text-ink-400" />
                    <span>
                      {detail.address.street}, {detail.address.number}
                      {detail.address.complement ? ` — ${detail.address.complement}` : ""}
                      <br />
                      {detail.address.neighborhood} · {detail.address.city}/{detail.address.state}
                      {detail.address.zipCode ? ` · ${detail.address.zipCode}` : ""}
                    </span>
                  </div>
                </div>
              )}

              {/* Entregador */}
              {detail.delivery?.delivererName && (
                <div className="flex items-center gap-2 text-[13px] text-ink-700">
                  <Icon name="Bike" size={14} className="text-ink-400" />
                  Entregador: <span className="font-medium">{detail.delivery.delivererName}</span>
                </div>
              )}

              {/* Totais */}
              <div className="border-t border-ink-200 pt-4 space-y-1.5 text-sm">
                <Row label="Subtotal" value={BRL(num(detail.subtotal))} />
                {num(detail.deliveryFee) > 0 && (
                  <Row label="Taxa de entrega" value={BRL(num(detail.deliveryFee))} />
                )}
                {num(detail.discountAmount) > 0 && (
                  <Row label="Desconto" value={`- ${BRL(num(detail.discountAmount))}`} accent />
                )}
                <div className="flex justify-between items-center pt-1.5">
                  <span className="font-display font-bold text-ink-900">Total</span>
                  <span className="font-display font-extrabold text-ink-900 text-lg tabular-nums">
                    {BRL(num(detail.total))}
                  </span>
                </div>
              </div>

              {/* Estorno (Manager) — visível só quando o pagamento estiver disponível. */}
              {paymentId && (
                <div className="rounded-lg border border-red-200 bg-red-50/50 px-3.5 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-ink-900">
                    <Icon name="RotateCcw" size={15} className="text-red-600" /> Estornar pagamento
                  </div>
                  <p className="mt-1 text-[12.5px] text-ink-500">
                    Devolve o valor ao cliente. Esta ação não pode ser desfeita.
                  </p>
                  {refundError && (
                    <div className="mt-2.5 text-[12.5px] text-red-700 flex items-center gap-1.5">
                      <Icon name="CircleAlert" size={14} className="shrink-0" />
                      {refundError}
                    </div>
                  )}
                  <div className="mt-3">
                    {confirmingRefund ? (
                      <div className="flex gap-2">
                        <AppButton
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmingRefund(false)}
                          disabled={refund.isPending}
                        >
                          Cancelar
                        </AppButton>
                        <AppButton variant="danger" size="sm" loading={refund.isPending} onClick={handleRefund}>
                          Confirmar estorno
                        </AppButton>
                      </div>
                    ) : (
                      <AppButton variant="outline" size="sm" icon="RotateCcw" onClick={() => setConfirmingRefund(true)}>
                        Estornar
                      </AppButton>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </AppDrawer>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-ink-500">{label}</span>
      <span className={`tabular-nums ${accent ? "text-brand-700 font-medium" : "text-ink-900"}`}>
        {value}
      </span>
    </div>
  );
}
