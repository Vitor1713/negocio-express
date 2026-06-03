import { storeBRL } from "../../format";
import { Icon } from "@/components/ui";
import type { CartItem } from "../../cart-context";
import type { OrderPreview, ValidatedCoupon } from "../service";

type Props = {
  items: CartItem[];
  coupon: ValidatedCoupon | null;
  deliveryFee: number;
  showDelivery: boolean;
  /** Totais autoritativos do backend; quando presentes, têm prioridade. */
  preview?: OrderPreview | null;
  previewLoading?: boolean;
};

export function OrderSummary({ items, coupon, deliveryFee, showDelivery, preview, previewLoading }: Props) {
  const clientSubtotal = items.reduce((s, i) => s + i.finalPrice * i.qty, 0);
  const clientDiscount = coupon ? Number(coupon.discountAmount ?? 0) : 0;

  const subtotal = preview ? Number(preview.subtotal ?? 0) : clientSubtotal;
  const fee = preview ? Number(preview.deliveryFee ?? 0) : deliveryFee;
  const discount = preview ? Number(preview.discountAmount ?? 0) : clientDiscount;
  const total = preview
    ? Number(preview.total ?? 0)
    : Math.max(0, clientSubtotal + (showDelivery ? deliveryFee : 0) - clientDiscount);

  return (
    <div className="bg-white border border-ink-200 rounded-2xl shadow-soft p-5 sm:p-6">
      <h2 className="font-display font-bold text-ink-900 mb-4 flex items-center gap-2">
        Resumo do pedido
        {previewLoading && <Icon name="LoaderCircle" size={14} className="animate-spin text-ink-400" />}
      </h2>

      <div className="space-y-2 mb-4 max-h-[160px] overflow-y-auto scroll-thin">
        {items.map((item) => (
          <div key={item.variantId} className="flex items-center gap-2 text-[13px]">
            <span className="h-6 w-6 rounded-md bg-brand-100 text-brand-700 grid place-items-center text-[11px] font-bold shrink-0 tabular-nums">
              {item.qty}×
            </span>
            <span className="flex-1 min-w-0 truncate text-ink-700">
              {item.productName}{" "}
              <span className="text-ink-400">· {item.variantName}</span>
            </span>
            <span className="text-ink-900 font-medium tabular-nums">
              {storeBRL(item.finalPrice * item.qty)}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-1.5 text-sm border-t border-ink-100 pt-4">
        <div className="flex justify-between text-ink-700">
          <span>Subtotal</span>
          <span className="tabular-nums">{storeBRL(subtotal)}</span>
        </div>
        {showDelivery && (
          <div className="flex justify-between text-ink-700">
            <span>Taxa de entrega</span>
            <span className="tabular-nums">{fee === 0 ? "Grátis" : storeBRL(fee)}</span>
          </div>
        )}
        {discount > 0 && (
          <div className="flex justify-between text-brand-700">
            <span>Desconto</span>
            <span className="tabular-nums">− {storeBRL(discount)}</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-2 border-t border-ink-100">
          <span className="font-display font-bold text-ink-900">Total</span>
          <span className="font-display font-extrabold text-ink-900 text-lg tabular-nums">
            {storeBRL(total)}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Calcula totais reutilizável fora do componente. */
export function calcTotals(
  items: CartItem[],
  coupon: ValidatedCoupon | null,
  deliveryFee: number,
  showDelivery: boolean,
) {
  const subtotal = items.reduce((s, i) => s + i.finalPrice * i.qty, 0);
  const discount = coupon ? Number(coupon.discountAmount ?? 0) : 0;
  const total = Math.max(0, subtotal + (showDelivery ? deliveryFee : 0) - discount);
  return { subtotal, discount, total };
}
