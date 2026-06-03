import { api } from "@/lib/api";
import type { components } from "@/lib/api-types";

type Schemas = components["schemas"];

export type OrderShort = Schemas["ResponseOrderShort"];
export type OrderDetail = Schemas["ResponseOrderDetail"];
export type OrderItem = Schemas["ResponseOrderItem"];
export type OrderStatusNode = Schemas["ResponseOrderStatusNode"];
export type RequestUpdateOrderStatus = Schemas["RequestUpdateOrderStatus"];

export async function listOrders(): Promise<OrderShort[]> {
  const data = await api.get<Schemas["ResponseOrders"]>("/orders");
  return data.orders ?? [];
}

/** Detalhe do pedido com itens, cliente, endereço e totais (GET /orders/{id}). */
export async function getOrder(id: string): Promise<OrderDetail> {
  return api.get<OrderDetail>(`/orders/${id}`);
}

/** Transições de status válidas por estado (GET /orders/status-flow). */
export async function getStatusFlow(): Promise<OrderStatusNode[]> {
  const data = await api.get<Schemas["ResponseOrderStatusFlow"]>("/orders/status-flow");
  return data.statuses ?? [];
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  return api.put<void>(`/orders/${id}/status`, { status });
}
