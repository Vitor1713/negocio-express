/**
 * Fonte única dos tipos de empresa (natureza jurídica) exigidos pelo Asaas na
 * abertura da subconta. As `key` PRECISAM bater com a enum `CompanyType` do
 * backend (MEI/LIMITED/INDIVIDUAL/ASSOCIATION) — ver categorias em ./categories.ts.
 */
export const COMPANY_TYPES: { key: string; label: string }[] = [
  { key: "MEI", label: "MEI" },
  { key: "LIMITED", label: "Sociedade Limitada (LTDA)" },
  { key: "INDIVIDUAL", label: "Empresário Individual" },
  { key: "ASSOCIATION", label: "Associação" },
];

/** Rótulo PT-BR de um tipo de empresa; cai no próprio valor se desconhecido. */
export const companyTypeLabel = (key?: string | null) =>
  COMPANY_TYPES.find((c) => c.key === key)?.label ?? key ?? "—";
