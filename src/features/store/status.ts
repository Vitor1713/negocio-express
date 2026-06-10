import type { AppBadgeProps } from "@/components/ui";

type Tone = NonNullable<AppBadgeProps["tone"]>;

/**
 * Status da loja (`ResponseStore.status`, string livre no openapi). Valores
 * observados no backend em PascalCase. Fallback neutro para desconhecidos.
 */
export const STORE_STATUS: Record<string, { label: string; tone: Tone }> = {
  Active: { label: "Ativa", tone: "success" },
  Pending: { label: "Pendente", tone: "warning" },
  Suspended: { label: "Suspensa", tone: "danger" },
  Blocked: { label: "Bloqueada", tone: "danger" },
  Inactive: { label: "Inativa", tone: "neutral" },
};

export const storeStatusInfo = (status?: string | null) =>
  (status && STORE_STATUS[status]) || { label: status ?? "—", tone: "neutral" as Tone };
