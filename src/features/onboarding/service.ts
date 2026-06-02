import { api } from "@/lib/api";
import type { components } from "@/lib/api-types";

type Schemas = components["schemas"];

export type Plan = Schemas["ResponseShortPlan"];
export type RegisterInput = Schemas["RequestRegister"];
export type TokenResponse = Schemas["ResponseToken"];

export async function listPlans(): Promise<Plan[]> {
  const data = await api.get<Schemas["ResponsePlans"]>("/plans", { auth: false });
  return (data.plans ?? []).filter((p) => p.isActive);
}

export async function register(body: RegisterInput): Promise<TokenResponse> {
  return api.post<TokenResponse>("/auth/register", body, { auth: false });
}
