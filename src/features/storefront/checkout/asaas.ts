/**
 * Tokenização do cartão (regra crítica de segurança).
 *
 * O back-end NUNCA recebe o número do cartão — só o `creditCardToken`. A
 * tokenização é client-side, via Asaas. Este módulo isola esse ponto de
 * integração:
 *
 * - Produção: chamar o endpoint/SDK de tokenização do Asaas com os dados do
 *   cartão e devolver o token retornado. (Plugar aqui quando houver credenciais
 *   e `NEXT_PUBLIC_ASAAS_*` configurados.)
 * - Desenvolvimento: o back usa um gateway *fake* que aceita qualquer string
 *   não vazia — geramos um token de teste local para validar o fluxo sem Asaas.
 */
export type CardData = {
  number: string;
  holderName: string;
  expiry: string; // MM/AA
  cvv: string;
};

const ASAAS_ENABLED = !!process.env.NEXT_PUBLIC_ASAAS_TOKENIZE_URL;

export async function tokenizeCard(card: CardData): Promise<string> {
  if (ASAAS_ENABLED) {
    // TODO(produção): integrar a tokenização do Asaas. O cartão NÃO deve sair
    // daqui em claro para o nosso back — só o token retornado abaixo.
    throw new Error(
      "Tokenização do Asaas ainda não integrada. Configure o SDK em asaas.ts.",
    );
  }

  // Dev: gateway fake aceita qualquer string não vazia. Usamos os 4 últimos
  // dígitos só para o token ser reconhecível nos logs de teste.
  const last4 = card.number.replace(/\D/g, "").slice(-4) || "0000";
  return `dev_tok_${last4}_${Date.now()}`;
}
