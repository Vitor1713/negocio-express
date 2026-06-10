/**
 * Status de pedido. O contrato trata `status` como string livre, mas o backend
 * usa uma enum PascalCase, confirmada via `GET /orders/status-flow`:
 *   Pending → Confirmed → Preparing → Ready → Shipped → Delivered  (+ Cancelled)
 *
 * O fluxo de transições VÁLIDAS vem da API (status-flow); aqui ficam só os
 * rótulos/tons e um fallback estático para a timeline.
 */
import type { AppBadgeProps } from "@/components/ui";

type Tone = NonNullable<AppBadgeProps["tone"]>;

/** Caminho "feliz" para a timeline (Cancelled fica fora). */
export const ORDER_FLOW = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready",
  "Shipped",
  "Delivered",
] as const;

export const ORDER_STATUS: Record<string, { label: string; tone: Tone }> = {
  Pending: { label: "Pendente", tone: "warning" },
  Confirmed: { label: "Confirmado", tone: "brand" },
  Preparing: { label: "Em preparo", tone: "brand" },
  Ready: { label: "Pronto", tone: "brand" },
  Shipped: { label: "Enviado", tone: "brand" },
  Delivered: { label: "Entregue", tone: "success" },
  Cancelled: { label: "Cancelado", tone: "danger" },
};

export const CANCELLED = "Cancelled";

export const DELIVERY_TYPE: Record<string, { label: string; icon: "Truck" | "Store" }> = {
  delivery: { label: "Entrega", icon: "Truck" },
  pickup: { label: "Retirada", icon: "Store" },
};

export function statusInfo(status?: string) {
  return (status && ORDER_STATUS[status]) || { label: status ?? "—", tone: "neutral" as Tone };
}

/** Tolerante a maiúsculas/minúsculas (backend pode devolver Delivery/Pickup). */
export function deliveryInfo(type?: string) {
  const key = type?.toLowerCase();
  return (key && DELIVERY_TYPE[key]) || { label: type ?? "—", icon: "Truck" as const };
}

/** Fallback estático do próximo status (use o status-flow da API quando possível). */
export function nextStatus(status?: string): string | null {
  const idx = ORDER_FLOW.indexOf(status as (typeof ORDER_FLOW)[number]);
  if (idx < 0 || idx >= ORDER_FLOW.length - 1) return null;
  return ORDER_FLOW[idx + 1];
}

export function isFinal(status?: string) {
  return status === "Delivered" || status === "Cancelled";
}
