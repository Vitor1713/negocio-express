"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppButton, Icon } from "@/components/ui";
import { storeBRL } from "../../format";
import { useOrderStatusPolling } from "../hooks";
import { OrderConfirmed } from "./OrderConfirmed";
import type { OrderResponse, PaymentResponse } from "../service";

const EXPIRY_SECONDS = 15 * 60;

type Props = {
  slug: string;
  order: OrderResponse;
  payment: PaymentResponse;
  deliveryType: string;
};

function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) return;
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [left]);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return { left, label: `${mm}:${ss}` };
}

export function PixPayment({ slug, order, payment, deliveryType }: Props) {
  const poll = useOrderStatusPolling(slug, order.id ?? null, true);
  const { left, label } = useCountdown(EXPIRY_SECONDS);
  const [copied, setCopied] = useState(false);

  const status = poll.data?.status ?? order.status;
  const confirmed = status === "Confirmed";
  const cancelled = status === "Cancelled";
  const expired = left <= 0 && !confirmed;

  async function copy() {
    if (!payment.pixCopyPaste) return;
    try {
      await navigator.clipboard.writeText(payment.pixCopyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponível — o usuário pode copiar manualmente */
    }
  }

  // Pago/confirmado → tela de sucesso.
  if (confirmed) {
    return <OrderConfirmed slug={slug} order={poll.data ?? order} payment={payment} deliveryType={deliveryType} />;
  }

  if (cancelled) {
    return (
      <div className="max-w-[560px] mx-auto px-4 sm:px-6 py-12 flex flex-col items-center text-center">
        <span className="h-20 w-20 rounded-full bg-red-100 text-red-600 grid place-items-center">
          <Icon name="CircleX" size={44} />
        </span>
        <h1 className="mt-5 font-display font-extrabold text-2xl text-ink-900">Pagamento não concluído</h1>
        <p className="mt-2 text-ink-500">O pedido foi cancelado ou o Pix expirou. Você pode tentar novamente.</p>
        <Link
          href={`/stores/${slug}`}
          className="mt-6 w-full h-12 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition-all inline-flex items-center justify-center gap-2"
        >
          <Icon name="Store" size={18} /> Voltar à loja
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[560px] mx-auto px-4 sm:px-6 py-10 flex flex-col items-center text-center">
      <span className="h-16 w-16 rounded-full bg-brand-100 text-brand-700 grid place-items-center">
        <Icon name="QrCode" size={36} />
      </span>
      <h1 className="mt-5 font-display font-extrabold text-2xl text-ink-900 tracking-tight">
        Pague com Pix para confirmar
      </h1>
      <p className="mt-2 text-ink-500">
        Escaneie o QR Code ou copie o código no app do seu banco. A confirmação é automática.
      </p>

      <div className="mt-7 w-full bg-white border border-ink-200 rounded-2xl shadow-soft p-6">
        {payment.pixQrCodeBase64 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`data:image/png;base64,${payment.pixQrCodeBase64}`}
            alt="QR Code do Pix"
            className="mx-auto h-56 w-56 rounded-xl border border-ink-100"
          />
        ) : (
          <div className="mx-auto h-56 w-56 rounded-xl bg-ink-100 grid place-items-center text-ink-400">
            <Icon name="QrCode" size={64} />
          </div>
        )}

        <div className="mt-5 text-sm">
          <div className="font-display font-extrabold text-ink-900 text-xl tabular-nums">
            {storeBRL(Number(payment.amount ?? order.total ?? 0))}
          </div>
          {!expired ? (
            <div className="mt-1 inline-flex items-center gap-1.5 text-ink-500">
              <Icon name="Clock" size={14} /> Expira em <span className="tabular-nums font-medium text-ink-700">{label}</span>
            </div>
          ) : (
            <div className="mt-1 text-red-600 inline-flex items-center gap-1.5">
              <Icon name="TriangleAlert" size={14} /> Código expirado
            </div>
          )}
        </div>

        {payment.pixCopyPaste && (
          <div className="mt-5">
            <div className="rounded-lg border border-ink-200 bg-ink-50 px-3 py-2.5 text-xs text-ink-600 break-all text-left font-mono">
              {payment.pixCopyPaste}
            </div>
            <AppButton
              fullWidth
              variant="outline"
              className="mt-2.5"
              icon={copied ? "Check" : "Copy"}
              onClick={copy}
            >
              {copied ? "Código copiado" : "Copiar código Pix"}
            </AppButton>
          </div>
        )}
      </div>

      <div className="mt-5 w-full rounded-xl border border-ink-200 bg-white px-4 py-3.5 flex items-center gap-3 text-left">
        <Icon name="LoaderCircle" size={18} className="text-brand-600 animate-spin shrink-0" />
        <div className="flex-1 text-sm text-ink-600">Aguardando confirmação do pagamento…</div>
        <AppButton variant="ghost" size="sm" icon="RefreshCw" loading={poll.isFetching} onClick={() => poll.refetch()}>
          Já paguei
        </AppButton>
      </div>

      <Link href={`/stores/${slug}`} className="mt-5 text-sm text-ink-500 hover:text-ink-700 transition-colors">
        Voltar à loja
      </Link>
    </div>
  );
}
