/**
 * Destino pós-login por role (claim do token, nunca de input do usuário).
 * - Customer  → vitrine da loja (precisa do slug da rota onde logou).
 * - Lojista/Owner/demais → painel do lojista.
 */
import type { Role } from "./jwt";

export function resolveHome(role: Role | null, slug?: string): string {
  if (role === "Customer") return slug ? `/stores/${slug}` : "/";
  return "/dashboard";
}
