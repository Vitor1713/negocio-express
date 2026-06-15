export const storeBRL = (n: number | string | undefined) =>
  "R$ " +
  Number(n ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Nome de exibição da loja derivado do slug (não há endpoint público de loja). */
export function storeNameFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const fmtReviewDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "";

/** Só os dígitos de uma string (remove máscara antes de enviar à API). */
export const onlyDigits = (v: string) => v.replace(/\D/g, "");

/** Máscara de CPF (11 díg.) ou CNPJ (14 díg.), aplicada conforme o usuário digita. */
export function maskCpfCnpj(raw: string) {
  const d = onlyDigits(raw).slice(0, 14);
  if (d.length <= 11) {
    return d
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

/** CPF (11) ou CNPJ (14) — valida só o tamanho, como o back. */
export const isValidCpfCnpj = (digits: string) => digits.length === 11 || digits.length === 14;
