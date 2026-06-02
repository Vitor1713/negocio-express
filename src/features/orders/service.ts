import { api } from "@/lib/api";
import type { components } from "@/lib/api-types";

type Schemas = components["schemas"];

export type OrderShort = Schemas["ResponseOrderShort"];
export type RequestUpdateOrderStatus = Schemas["RequestUpdateOrderStatus"];

export async function listOrders(): Promise<OrderShort[]> {
  const data = await api.get<Schemas["ResponseOrders"]>("/orders");
  return data.orders ?? [];
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  return api.put<void>(`/orders/${id}/status`, { status });
}
