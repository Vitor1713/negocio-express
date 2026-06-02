"use client";

import { AppBadge, AppCard, AppEmptyState, Icon } from "@/components/ui";
import { useOrders } from "../../orders-context";
import { storeBRL } from "../../format";

const STATUS: Record<string, { label: string; tone: "success" | "warning" | "danger" | "neutral" }> = {
  approved: { label: "Aprovado", tone: "success" },
  pending: { label: "Pendente", tone: "warning" },
  failed: { label: "Recusado", tone: "danger" },
};

const DELIVERY: Record<string, string> = {
  delivery: "Entrega",
  pickup: "Retirada",
};

export function OrdersTab() {
  const { orders } = useOrders();

  return (
    <>
      <div className="mb-5">
        <h2 className="font-display font-bold text-lg text-ink-900">Meus pedidos</h2>
      </div>

      <div className="mb-4 rounded-lg border border-dashed border-ink-300 bg-ink-50/40 px-4 py-3 text-xs text-ink-500 flex items-start gap-2">
        <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
        <span>
          A API não expõe um histórico de pedidos para o cliente.
          Exibindo apenas os pedidos feitos nesta sessão de navegação.
        </span>
      </div>

      {orders.length === 0 ? (
        <AppEmptyState
          icon="ShoppingBag"
          title="Nenhum pedido nesta sessão"
          desc="Os pedidos realizados nesta sessão aparecerão aqui."
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const st = STATUS[order.paymentStatus] ?? { label: order.paymentStatus, tone: "neutral" as const };
            const shortId = order.id.replace(/-/g, "").slice(0, 8).toUpperCase();
            const itemCount = order.items.reduce((s, i) => s + i.qty, 0);
            const fmtDate = new Date(order.createdAt).toLocaleString("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
            });

            return (
              <AppCard key={order.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="font-mono font-semibold text-ink-900">#{shortId}</div>
                    <div className="text-xs text-ink-500 mt-0.5 flex items-center gap-1.5">
                      <Icon name={order.deliveryType === "delivery" ? "Truck" : "Store"} size={12} />
                      {DELIVERY[order.deliveryType] ?? order.deliveryType} · {fmtDate}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold text-ink-900 tabular-nums">
                      {storeBRL(order.total)}
                    </div>
                    <AppBadge tone={st.tone} size="sm" dot className="mt-1">
                      {st.label}
                    </AppBadge>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {order.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-[12.5px] text-ink-600">
                      <span className="h-5 w-5 rounded bg-brand-100 text-brand-700 grid place-items-center text-[10px] font-bold shrink-0">
                        {item.qty}×
                      </span>
                      <span className="truncate">{item.productName}</span>
                      {item.variantName && (
                        <span className="text-ink-400 shrink-0">· {item.variantName}</span>
                      )}
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="text-xs text-ink-400">
                      + {order.items.length - 3} {order.items.length - 3 === 1 ? "item" : "itens"}
                    </div>
                  )}
                </div>
              </AppCard>
            );
          })}
        </div>
      )}
    </>
  );
}
