"use client";

import Image from "next/image";
import { useState } from "react";
import { AppButton, Icon } from "@/components/ui";
import { ApiError } from "@/lib/api";
import { useCart } from "../../cart-context";
import { storeBRL } from "../../format";
import { useValidateCoupon } from "../hooks";
import type { ValidatedCoupon } from "../service";

type Props = {
  slug: string;
  coupon: ValidatedCoupon | null;
  onCouponApplied: (c: ValidatedCoupon | null) => void;
  onNext: () => void;
};

export function CartStep({ slug, coupon, onCouponApplied, onNext }: Props) {
  const { items, setQty, clear } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const validateCoupon = useValidateCoupon(slug);

  const subtotal = items.reduce((s, i) => s + i.finalPrice * i.qty, 0);

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponError(null);
    onCouponApplied(null);
    try {
      const result = await validateCoupon.mutateAsync({ code: couponCode.trim().toUpperCase(), subtotal });
      onCouponApplied(result);
    } catch (err) {
      setCouponError(err instanceof ApiError ? err.messages[0] : "Cupom inválido ou abaixo do mínimo.");
    }
  }

  return (
    <div className="space-y-4">
      {/* Lista de itens */}
      <section className="bg-white border border-ink-200 rounded-2xl shadow-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
          <h2 className="font-display font-bold text-ink-900">
            Itens do carrinho{" "}
            <span className="text-ink-400 font-sans font-normal">
              ({items.reduce((s, i) => s + i.qty, 0)})
            </span>
          </h2>
          <button
            onClick={clear}
            className="text-xs font-medium text-ink-500 hover:text-red-600 transition-colors inline-flex items-center gap-1"
          >
            <Icon name="Trash2" size={13} /> Limpar
          </button>
        </div>
        <div className="divide-y divide-ink-100">
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-3 sm:gap-4 p-4 sm:px-6">
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 grid place-items-center overflow-hidden">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <Icon name="Package" size={28} className="text-brand-700" strokeWidth={1.6} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[14px] sm:text-[15px] font-display font-semibold text-ink-900 leading-snug line-clamp-1">
                      {item.productName}
                    </div>
                    <div className="text-[12.5px] text-ink-500">
                      {item.variantName} · {storeBRL(item.finalPrice)}
                    </div>
                  </div>
                  <button
                    onClick={() => setQty(item.variantId, 0)}
                    className="text-ink-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    <Icon name="Trash2" size={16} />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="inline-flex items-center border border-ink-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQty(item.variantId, item.qty - 1)}
                      className="h-9 w-9 grid place-items-center hover:bg-ink-100 text-ink-700"
                    >
                      <Icon name={item.qty === 1 ? "Trash2" : "Minus"} size={15} />
                    </button>
                    <span className="w-9 text-center font-semibold text-sm tabular-nums">{item.qty}</span>
                    <button
                      onClick={() => setQty(item.variantId, item.qty + 1)}
                      disabled={item.qty >= item.stock}
                      className="h-9 w-9 grid place-items-center hover:bg-ink-100 text-ink-700 disabled:text-ink-300"
                    >
                      <Icon name="Plus" size={15} />
                    </button>
                  </div>
                  <div className="font-display font-bold text-ink-900 tabular-nums">
                    {storeBRL(item.finalPrice * item.qty)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cupom */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
            <Icon name="Tag" size={15} />
          </span>
          <input
            type="text"
            value={couponCode}
            onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(null); onCouponApplied(null); }}
            placeholder="Cupom de desconto"
            className="w-full bg-white border border-ink-200 rounded-lg pl-9 pr-3 py-2.5 text-sm placeholder-ink-400 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <AppButton variant="secondary" onClick={handleApplyCoupon} loading={validateCoupon.isPending}>
          Aplicar
        </AppButton>
      </div>
      {coupon && !couponError && (
        <p className="text-xs text-brand-700 flex items-center gap-1">
          <Icon name="CircleCheck" size={13} /> Cupom <strong>{coupon.code}</strong> aplicado — desconto de {storeBRL(Number(coupon.discountAmount))}.
        </p>
      )}
      {couponError && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <Icon name="CircleAlert" size={13} /> {couponError}
        </p>
      )}

      <AppButton fullWidth size="lg" iconRight="ArrowRight" onClick={onNext}>
        Continuar para entrega
      </AppButton>
    </div>
  );
}
