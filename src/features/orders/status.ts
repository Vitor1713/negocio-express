/**
 * Fluxo e rótulos de status de pedido. O contrato trata `status` como string
 * livre; aqui centralizamos os valores usados no design (ORDER_FLOW + cancelled).
 */
import type { AppBadgeProps } from "@/components/ui";

type Tone = NonNullable<AppBadgeProps["tone"]>;

export const ORDER_FLOW = ["pending", "paid", "preparing", "out_for_delivery", "delivered"] as const;

export const ORDER_STATUS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: "Pendente", tone: "warning" },
  paid: { label: "Pago", tone: "brand" },
  preparing: { label: "Em preparo", tone: "brand" },
  out_for_delivery: { label: "Em entrega", tone: "brand" },
  delivered: { label: "Entregue", tone: "success" },
  cancelled: { label: "Cancelado", tone: "danger" },
};

export const DELIVERY_TYPE: Record<string, { label: string; icon: "Truck" | "Store" }> = {
  delivery: { label: "Entrega", icon: "Truck" },
  pickup: { label: "Retirada", icon: "Store" },
};

export function statusInfo(status?: string) {
  return (status && ORDER_STATUS[status]) || { label: status ?? "—", tone: "neutral" as Tone };
}

export function deliveryInfo(type?: string) {
  return (type && DELIVERY_TYPE[type]) || { label: type ?? "—", icon: "Truck" as const };
}

/** Próximo status no fluxo, ou null se não há avanço possível. */
export function nextStatus(status?: string): string | null {
  const idx = ORDER_FLOW.indexOf(status as (typeof ORDER_FLOW)[number]);
  if (idx < 0 || idx >= ORDER_FLOW.length - 1) return null;
  return ORDER_FLOW[idx + 1];
}

export function isFinal(status?: string) {
  return status === "delivered" || status === "cancelled";
}
