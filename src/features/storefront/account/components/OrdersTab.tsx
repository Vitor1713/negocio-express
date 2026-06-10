"use client";

import { AppBadge, AppCard, AppEmptyState, AppErrorState, AppSpinner, Icon } from "@/components/ui";
import { deliveryInfo, statusInfo } from "@/features/orders/status";
import { useCustomerOrders } from "../hooks";
import { storeBRL } from "../../format";

type Props = { slug: string };

const orderNo = (number?: number | string, id?: string) =>
  number != null && number !== ""
    ? `#${number}`
    : "#" + (id ?? "").replace(/-/g, "").slice(0, 8).toUpperCase();

export function OrdersTab({ slug }: Props) {
  const { data: orders, isLoading, isError, error, refetch } = useCustomerOrders(slug);

  return (
    <>
      <div className="mb-5">
        <h2 className="font-display font-bold text-lg text-ink-900">Meus pedidos</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <AppSpinner className="h-9 w-9" />
        </div>
      ) : isError ? (
        <AppErrorState title="Erro ao carregar seus pedidos" error={error} onRetry={() => refetch()} />
      ) : (orders ?? []).length === 0 ? (
        <AppEmptyState
          icon="ShoppingBag"
          title="Você ainda não fez pedidos"
          desc="Quando você comprar nesta loja, seus pedidos aparecerão aqui."
        />
      ) : (
        <div className="space-y-3">
          {(orders ?? []).map((order) => {
            const st = statusInfo(order.status);
            const dt = deliveryInfo(order.deliveryType);
            const items = order.items ?? [];
            const fmtDate = new Date(order.createdAt ?? "").toLocaleString("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
            });

            return (
              <AppCard key={order.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="font-mono font-semibold text-ink-900">
                      {orderNo(order.number, order.id)}
                    </div>
                    <div className="text-xs text-ink-500 mt-0.5 flex items-center gap-1.5">
                      <Icon name={dt.icon} size={12} />
                      {dt.label} · {fmtDate}
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
                  {items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-[12.5px] text-ink-600">
                      <span className="h-5 w-5 rounded bg-brand-100 text-brand-700 grid place-items-center text-[10px] font-bold shrink-0">
                        {item.quantity}×
                      </span>
                      <span className="truncate">{item.productName}</span>
                      {item.variantName && (
                        <span className="text-ink-400 shrink-0">· {item.variantName}</span>
                      )}
                    </div>
                  ))}
                  {items.length > 3 && (
                    <div className="text-xs text-ink-400">
                      + {items.length - 3} {items.length - 3 === 1 ? "item" : "itens"}
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
