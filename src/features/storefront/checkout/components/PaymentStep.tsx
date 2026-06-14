"use client";

import { useState } from "react";
import { AppButton, AppField, AppInput, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { IconName } from "@/components/ui";
import { isValidCpfCnpj, maskCpfCnpj, onlyDigits, storeBRL } from "../../format";
import { tokenizeCard } from "../asaas";
import type { PaymentInput, PaymentMethod } from "../service";

const METHODS: { key: PaymentMethod; label: string; icon: IconName; hint: string }[] = [
  { key: "Pix", label: "Pix", icon: "QrCode", hint: "Aprovação na hora" },
  { key: "CreditCard", label: "Cartão de crédito", icon: "CreditCard", hint: "Em até 12x" },
];

const INSTALLMENTS = Array.from({ length: 12 }, (_, i) => i + 1);

function maskExpiry(raw: string) {
  const d = onlyDigits(raw).slice(0, 4);
  return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
}

function maskCardNumber(raw: string) {
  return onlyDigits(raw)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

type Props = {
  total: number;
  submitting: boolean;
  onConfirm: (input: PaymentInput) => void;
  onBack: () => void;
};

export function PaymentStep({ total, submitting, onConfirm, onBack }: Props) {
  const [method, setMethod] = useState<PaymentMethod>("Pix");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [installments, setInstallments] = useState(1);
  const [card, setCard] = useState({ number: "", holderName: "", expiry: "", cvv: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tokenizing, setTokenizing] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    const digits = onlyDigits(cpfCnpj);
    if (!isValidCpfCnpj(digits)) e.cpfCnpj = "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.";
    if (method === "CreditCard") {
      if (onlyDigits(card.number).length < 13) e.number = "Número do cartão incompleto.";
      if (!card.holderName.trim()) e.holderName = "Informe o nome impresso no cartão.";
      if (onlyDigits(card.expiry).length !== 4) e.expiry = "Validade no formato MM/AA.";
      if (onlyDigits(card.cvv).length < 3) e.cvv = "CVV inválido.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    const customerCpfCnpj = onlyDigits(cpfCnpj);

    if (method === "Pix") {
      onConfirm({ method: "Pix", customerCpfCnpj });
      return;
    }

    // Cartão: tokeniza client-side e envia SÓ o token (o número nunca vai ao back).
    setTokenizing(true);
    try {
      const creditCardToken = await tokenizeCard(card);
      onConfirm({ method: "CreditCard", customerCpfCnpj, creditCardToken, installments });
    } catch {
      setErrors({ number: "Não foi possível validar o cartão. Confira os dados e tente novamente." });
    } finally {
      setTokenizing(false);
    }
  }

  const busy = submitting || tokenizing;

  return (
    <div className="space-y-5">
      <section className="bg-white border border-ink-200 rounded-2xl shadow-soft p-5 sm:p-6">
        <h2 className="font-display font-bold text-ink-900 mb-3">Forma de pagamento</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {METHODS.map((m) => {
            const active = method === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setMethod(m.key)}
                className={cn(
                  "text-left p-3.5 rounded-xl border transition-all flex items-center gap-3",
                  active ? "border-brand-600 bg-brand-50/60 ring-2 ring-brand-100" : "border-ink-200 hover:bg-ink-50",
                )}
              >
                <span className={cn("h-10 w-10 rounded-lg grid place-items-center shrink-0", active ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-500")}>
                  <Icon name={m.icon} size={18} />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-ink-900">{m.label}</div>
                  <div className="text-[12px] text-ink-500">{m.hint}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 space-y-4">
          <AppInput
            label="CPF/CNPJ do pagador"
            inputMode="numeric"
            placeholder="000.000.000-00"
            required
            value={cpfCnpj}
            error={errors.cpfCnpj}
            onChange={(e) => setCpfCnpj(maskCpfCnpj(e.target.value))}
          />

          {method === "CreditCard" && (
            <div className="space-y-4 rounded-xl border border-ink-200 p-4 bg-ink-50/40">
              <AppInput
                label="Número do cartão"
                inputMode="numeric"
                placeholder="0000 0000 0000 0000"
                required
                value={card.number}
                error={errors.number}
                onChange={(e) => setCard((c) => ({ ...c, number: maskCardNumber(e.target.value) }))}
              />
              <AppInput
                label="Nome impresso no cartão"
                placeholder="Como está no cartão"
                required
                value={card.holderName}
                error={errors.holderName}
                onChange={(e) => setCard((c) => ({ ...c, holderName: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-4">
                <AppInput
                  label="Validade"
                  inputMode="numeric"
                  placeholder="MM/AA"
                  required
                  value={card.expiry}
                  error={errors.expiry}
                  onChange={(e) => setCard((c) => ({ ...c, expiry: maskExpiry(e.target.value) }))}
                />
                <AppInput
                  label="CVV"
                  inputMode="numeric"
                  placeholder="000"
                  required
                  value={card.cvv}
                  error={errors.cvv}
                  onChange={(e) => setCard((c) => ({ ...c, cvv: onlyDigits(e.target.value).slice(0, 4) }))}
                />
              </div>
              <AppField label="Parcelas" htmlFor="installments">
                <select
                  id="installments"
                  value={installments}
                  onChange={(e) => setInstallments(Number(e.target.value))}
                  className="w-full bg-white border border-ink-200 rounded-lg px-3 py-2.5 text-sm text-ink-900 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                >
                  {INSTALLMENTS.map((n) => (
                    <option key={n} value={n}>
                      {n}x de {storeBRL(total / n)}
                      {n === 1 ? " à vista" : " sem juros"}
                    </option>
                  ))}
                </select>
              </AppField>
              <p className="text-[12px] text-ink-500 flex items-center gap-1.5">
                <Icon name="Lock" size={13} className="text-brand-600 shrink-0" />
                Os dados do cartão são protegidos e não são armazenados pela loja.
              </p>
            </div>
          )}

          {method === "Pix" && (
            <div className="p-4 rounded-xl bg-ink-50 border border-ink-200 flex items-start gap-3">
              <span className="h-10 w-10 rounded-lg bg-brand-600 text-white grid place-items-center shrink-0">
                <Icon name="QrCode" size={18} />
              </span>
              <p className="text-sm text-ink-600">
                Ao confirmar, geramos o QR Code e o código copia-e-cola. O pedido é confirmado
                assim que o pagamento cair.
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="flex gap-3">
        <AppButton variant="outline" icon="ArrowLeft" onClick={onBack} disabled={busy}>
          Voltar
        </AppButton>
        <AppButton fullWidth size="lg" icon="Check" onClick={handleSubmit} loading={busy}>
          {method === "Pix" ? "Gerar Pix" : "Pagar"} · {storeBRL(total)}
        </AppButton>
      </div>
    </div>
  );
}
