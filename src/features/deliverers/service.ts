import { api } from "@/lib/api";
import type { components } from "@/lib/api-types";

type Schemas = components["schemas"];

export type Deliverer = Schemas["ResponseDeliverer"];
export type RequestCreateDeliverer = Schemas["RequestCreateDeliverer"];

export async function listDeliverers(): Promise<Deliverer[]> {
  const data = await api.get<Schemas["ResponseDeliverers"]>("/deliverers");
  return data.deliverers ?? [];
}

export async function createDeliverer(body: RequestCreateDeliverer): Promise<Deliverer> {
  return api.post<Deliverer>("/deliverers", body);
}
