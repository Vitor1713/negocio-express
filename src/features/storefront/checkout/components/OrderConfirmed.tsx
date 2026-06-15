import Link from "next/link";
import { AppBadge, Icon } from "@/components/ui";
import { storeBRL } from "../../format";
import { statusInfo } from "../../../orders/status";
import type { OrderResponse, PaymentResponse } from "../service";

type Props = {
  slug: string;
  order: OrderResponse;
  payment: PaymentResponse;
  deliveryType: string;
};

export function OrderConfirmed({ slug, order, payment, deliveryType }: Props) {
  const shortId = (order.id ?? "").replace(/-/g, "").slice(0, 8).toUpperCase();
  const orderStatus = statusInfo(order.status);
  const total = Number(order.total ?? payment.amount ?? 0);

  // Flags do back decidem a UX (não comparar strings de status).
  const paid = payment.isApproved;
  const installments = Number(payment.installments ?? 1);

  return (
    <div className="max-w-[560px] mx-auto px-4 sm:px-6 py-12 flex flex-col items-center text-center">
      <span className="h-20 w-20 rounded-full bg-brand-100 text-brand-700 grid place-items-center">
        <Icon name="CircleCheck" size={44} />
      </span>
      <h1 className="mt-5 font-display font-extrabold text-2xl sm:text-3xl text-ink-900 tracking-tight">
        {paid ? "Pagamento confirmado!" : "Pedido recebido!"}
      </h1>
      <p className="mt-2 text-ink-500">
        Seu pedido <strong className="text-ink-900">#{shortId}</strong>{" "}
        {paid ? "foi pago e já está sendo preparado." : "foi registrado."}
      </p>

      <div className="mt-8 w-full bg-white border border-ink-200 rounded-2xl shadow-soft p-6 text-left">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-ink-500">Status do pedido</span>
            <AppBadge tone={orderStatus.tone} dot>{orderStatus.label}</AppBadge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-ink-500">Pagamento</span>
            <AppBadge tone={paid ? "success" : "warning"} dot>
              {paid ? "Aprovado" : "Pendente"}
            </AppBadge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-ink-500">Forma de pagamento</span>
            <span className="text-ink-900 font-medium">
              {payment.method === "CreditCard"
                ? `Cartão${installments > 1 ? ` · ${installments}x` : ""}`
                : "Pix"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-ink-500">
              {deliveryType === "delivery" ? "Previsão de entrega" : "Retirada"}
            </span>
            <span className="text-ink-900 font-medium">
              {deliveryType === "delivery" ? "30–40 min" : "Pronto em 15 min"}
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-ink-100 pt-3 mt-1">
            <span className="font-display font-bold text-ink-900">Total</span>
            <span className="font-display font-extrabold text-ink-900 text-lg tabular-nums">
              {storeBRL(total)}
            </span>
          </div>
        </div>
        {payment.invoiceUrl && (
          <a
            href={payment.invoiceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 pt-4 border-t border-ink-100 flex items-center gap-2 text-sm text-brand-700 hover:text-brand-800 transition-colors"
          >
            <Icon name="FileText" size={15} /> Ver comprovante
          </a>
        )}
        <div className="mt-4 pt-4 border-t border-ink-100 flex items-center gap-2 text-xs text-ink-500">
          <Icon name="Bell" size={14} /> Você receberá atualizações do pedido.
        </div>
      </div>

      <Link
        href={`/stores/${slug}`}
        className="mt-6 w-full h-12 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition-all inline-flex items-center justify-center gap-2"
      >
        <Icon name="Store" size={18} /> Voltar à loja
      </Link>
    </div>
  );
}
