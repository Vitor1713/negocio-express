/**
 * Service da visão geral do lojista (dashboard). Resolve a loja pelo token.
 * - GET /store/dashboard → métricas do dia (ResponseDashboard)
 */
import { api } from "@/lib/api";
import type { components } from "@/lib/api-types";

type Schemas = components["schemas"];

export type Dashboard = Schemas["ResponseDashboard"];

export async function getDashboard(): Promise<Dashboard> {
  return api.get<Dashboard>("/store/dashboard");
}
