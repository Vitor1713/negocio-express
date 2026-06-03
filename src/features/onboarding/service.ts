import { api } from "@/lib/api";
import type { components } from "@/lib/api-types";

type Schemas = components["schemas"];

/**
 * Campos que o design dos cards de plano exige mas que ainda NÃO existem no
 * `ResponseShortPlan` do openapi.json. O backend vai enriquecê-los; até lá são
 * opcionais e o card degrada (esconde o que faltar).
 *
 * TODO: remover este augment e usar só `Schemas["ResponseShortPlan"]` quando o
 * openapi.json incluir estes campos (regenerar via `npm run gen:api`).
 */
export type PlanExtras = {
  /** Frase curta sob o nome do plano (ex.: "Para negócios em crescimento."). */
  description?: string | null;
  /** Preço total do plano anual (habilita o toggle mensal/anual). */
  annualPrice?: number | string | null;
  /** Limite de usuários; `null` = ilimitado. */
  maxUsers?: number | null;
  /** Lista de recursos do plano (todos exibidos como incluídos no card). */
  features?: string[] | null;
};

export type Plan = Schemas["ResponseShortPlan"] & PlanExtras;
export type RegisterInput = Schemas["RequestRegister"];
export type TokenResponse = Schemas["ResponseToken"];

export async function listPlans(): Promise<Plan[]> {
  const data = await api.get<Schemas["ResponsePlans"]>("/plans", { auth: false });
  return (data.plans ?? []).filter((p) => p.isActive);
}

export async function register(body: RegisterInput): Promise<TokenResponse> {
  return api.post<TokenResponse>("/auth/register", body, { auth: false });
}
