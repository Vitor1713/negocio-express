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

/**
 * Status da subconta de pagamento Asaas (`StorePaymentAccountStatus`):
 * Pending, Approved, Rejected. Rótulo amigável + tom para o badge.
 */
export const PAYMENT_ACCOUNT_STATUS: Record<string, { label: string; tone: Tone }> = {
  Pending: { label: "Em análise", tone: "warning" },
  Approved: { label: "Aprovada", tone: "success" },
  Rejected: { label: "Recusada", tone: "danger" },
};

export const paymentAccountStatusInfo = (status?: string | null) =>
  (status && PAYMENT_ACCOUNT_STATUS[status]) || { label: status ?? "—", tone: "neutral" as Tone };
