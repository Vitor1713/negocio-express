/**
 * Tipos de desconto de cupom (`discountType`, string livre no openapi).
 * Valores aceitos pelo backend (enum C#, validados empiricamente):
 * `Percentage` e `FixedAmount`. Entrada é case-insensitive, mas a API
 * devolve em PascalCase — usamos essas keys.
 */
import type { Coupon } from "./service";

export const BRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

export const num = (v: number | string | null | undefined) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

export type DiscountType = "Percentage" | "FixedAmount";

export const DISCOUNT_TYPES: { key: DiscountType; label: string }[] = [
  { key: "Percentage", label: "Percentual (%)" },
  { key: "FixedAmount", label: "Valor fixo (R$)" },
];

export const discountTypeLabel = (t?: string | null) =>
  t === "Percentage" ? "Percentual" : t === "FixedAmount" ? "Valor fixo" : t ?? "—";

/** Rótulo do valor do desconto (ex.: "10%" ou "R$ 15,00"). */
export const couponValueLabel = (c: Pick<Coupon, "discountType" | "discountValue">) => {
  const v = num(c.discountValue);
  return c.discountType === "Percentage" ? `${v % 1 === 0 ? v : v.toFixed(2)}%` : BRL(v);
};
