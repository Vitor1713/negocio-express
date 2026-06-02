"use client";

import { AppBadge, AppButton, AppDrawer, Icon } from "@/components/ui";
import type { OrderShort } from "../service";
import {
  ORDER_FLOW,
  deliveryInfo,
  isFinal,
  nextStatus,
  statusInfo,
} from "../status";

const BRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

const fmtDateTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";

const orderNo = (id?: string) => "#" + (id ?? "").replace(/\D/g, "").slice(0, 4).padStart(4, "0");

type Props = {
  order: OrderShort | null;
  onClose: () => void;
  onAdvance: (order: OrderShort, next: string) => void;
  onCancel: (order: OrderShort) => void;
  updating?: boolean;
};

export function OrderDrawer({ order, onClose, onAdvance, onCancel, updating }: Props) {
  const st = statusInfo(order?.status);
  const dt = deliveryInfo(order?.deliveryType);
  const stepIdx = order ? ORDER_FLOW.indexOf(order.status as (typeof ORDER_FLOW)[number]) : -1;
  const next = nextStatus(order?.status);
  const final = isFinal(order?.status);
  const cancelled = order?.status === "cancelled";

  return (
    <AppDrawer
      open={!!order}
      onClose={onClose}
      icon="ShoppingBag"
      title={order ? `Pedido ${orderNo(order.id)}` : ""}
      subtitle={order ? fmtDateTime(order.createdAt) : ""}
      footer={
        order && !final ? (
          <div className="flex gap-2">
            <AppButton variant="danger" icon="X" onClick={() => onCancel(order)} loading={updating}>
              Cancelar
            </AppButton>
            {next && (
              <AppButton
                fullWidth
                iconRight="ArrowRight"
                onClick={() => onAdvance(order, next)}
                loading={updating}
              >
                Marcar como {statusInfo(next).label}
              </AppButton>
            )}
          </div>
        ) : null
      }
    >
      {order && (
        <div className="p-5 space-y-5">
          {/* Cliente + status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="h-10 w-10 rounded-full bg-brand-100 text-brand-700 grid place-items-center font-bold">
                {(order.customerId ?? "?").slice(0, 1).toUpperCase()}
              </span>
              <div>
                <div className="text-sm font-semibold text-ink-900 leading-tight">
                  {order.customerId}
                </div>
                <div className="text-xs text-ink-500 inline-flex items-center gap-1">
                  <Icon name={dt.icon} size={12} /> {dt.label}
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

          {/* Itens — não disponíveis no contrato atual */}
          <div className="rounded-lg border border-dashed border-ink-300 bg-ink-50/40 px-3 py-3 text-xs text-ink-500 flex items-start gap-2">
            <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
            Os itens do pedido aparecerão aqui quando a API expuser o detalhe do pedido
            (<span className="font-mono">GET /orders/&#123;id&#125;</span>).
          </div>

          {/* Total */}
          <div className="flex justify-between items-center border-t border-ink-200 pt-4">
            <span className="font-display font-bold text-ink-900">Total</span>
            <span className="font-display font-extrabold text-ink-900 text-lg tabular-nums">
              {BRL(Number(order.total ?? 0))}
            </span>
          </div>
        </div>
      )}
    </AppDrawer>
  );
}
