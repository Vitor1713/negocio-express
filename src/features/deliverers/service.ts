import { api } from "@/lib/api";
import type { components } from "@/lib/api-types";

type Schemas = components["schemas"];

export type Deliverer = Schemas["ResponseDeliverer"];
export type RequestCreateDeliverer = Schemas["RequestCreateDeliverer"];
export type RequestUpdateDeliverer = Schemas["RequestUpdateDeliverer"];
export type Delivery = Schemas["ResponseDelivery"];

export async function listDeliverers(): Promise<Deliverer[]> {
  const data = await api.get<Schemas["ResponseDeliverers"]>("/deliverers");
  return data.deliverers ?? [];
}

export async function createDeliverer(body: RequestCreateDeliverer): Promise<Deliverer> {
  return api.post<Deliverer>("/deliverers", body);
}

export async function updateDeliverer(id: string, body: RequestUpdateDeliverer): Promise<void> {
  return api.put<void>(`/deliverers/${id}`, body);
}

/**
 * Remove um entregador (DELETE /deliverers/{id}).
 * ⚠️ É um **soft-delete**: a API responde 204 mas apenas marca `isActive=false`
 * — o entregador continua em `GET /deliverers` como inativo.
 */
export async function deleteDeliverer(id: string): Promise<void> {
  return api.delete<void>(`/deliverers/${id}`);
}

/**
 * Atribui um entregador a uma entrega (PUT /deliveries/{id}/assign).
 *
 * ⚠️ Bloqueio de contrato: o openapi.json não expõe NENHUMA fonte de
 * `deliveryId` — não há `GET /deliveries` e os pedidos (ResponseOrder /
 * ResponseOrderShort) não trazem o id da entrega. Por isso esta função existe
 * na camada de dados (tipada e pronta), mas ainda não pode ser ligada à UI.
 * Quando o backend expuser o id da entrega, basta consumir este service.
 */
export async function assignDeliverer(deliveryId: string, delivererId: string): Promise<Delivery> {
  return api.put<Delivery>(`/deliveries/${encodeURIComponent(deliveryId)}/assign`, { delivererId });
}
