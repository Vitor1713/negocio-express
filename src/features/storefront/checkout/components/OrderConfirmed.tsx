import Link from "next/link";
import { AppBadge, AppButton, Icon } from "@/components/ui";
import { storeBRL } from "../../format";

type Props = {
  slug: string;
  orderId: string;
  total: number;
  deliveryType: string;
  paymentStatus: string;
  paymentMethod: string;
};

const PAYMENT_STATUS: Record<string, { label: string; tone: "success" | "warning" | "danger" }> = {
  approved: { label: "Aprovado", tone: "success" },
  pending: { label: "Pendente", tone: "warning" },
  failed: { label: "Recusado", tone: "danger" },
};

export function OrderConfirmed({ slug, orderId, total, deliveryType, paymentStatus, paymentMethod }: Props) {
  const ps = PAYMENT_STATUS[paymentStatus] ?? { label: paymentStatus, tone: "neutral" as const };
  const shortId = orderId.replace(/-/g, "").slice(0, 8).toUpperCase();
  const isCash = paymentMethod === "cash";

  return (
    <div className="max-w-[560px] mx-auto px-4 sm:px-6 py-12 flex flex-col items-center text-center">
      <span className="h-20 w-20 rounded-full bg-brand-100 text-brand-700 grid place-items-center">
        <Icon name="CircleCheck" size={44} />
      </span>
      <h1 className="mt-5 font-display font-extrabold text-2xl sm:text-3xl text-ink-900 tracking-tight">
        Pedido confirmado!
      </h1>
      <p className="mt-2 text-ink-500">
        Seu pedido <strong className="text-ink-900">#{shortId}</strong> foi recebido e já está sendo preparado.
      </p>

      <div className="mt-8 w-full bg-white border border-ink-200 rounded-2xl shadow-soft p-6 text-left">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-ink-500">Status do pedido</span>
            <AppBadge tone="warning" dot>Pendente</AppBadge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-ink-500">Pagamento</span>
            <AppBadge tone={ps.tone} dot>{ps.label}</AppBadge>
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
            <span className="font-display font-bold text-ink-900">Total pago</span>
            <span className="font-display font-extrabold text-ink-900 text-lg tabular-nums">
              {isCash ? "Pagar na entrega" : storeBRL(total)}
            </span>
          </div>
        </div>
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
