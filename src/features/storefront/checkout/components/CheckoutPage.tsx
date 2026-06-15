"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppButton, Icon } from "@/components/ui";
import { useCart } from "../../cart-context";
import { useOrders } from "../../orders-context";
import { StepIndicator } from "../../../onboarding/components/StepIndicator";
import { CartStep } from "./CartStep";
import { DeliveryStep } from "./DeliveryStep";
import { PaymentStep } from "./PaymentStep";
import { PixPayment } from "./PixPayment";
import { OrderConfirmed } from "./OrderConfirmed";
import { OrderSummary, calcTotals } from "./OrderSummary";
import { useCreateOrder, useCreatePayment, usePreviewOrder } from "../hooks";
import { checkoutErrorMessage } from "../service";
import type { ValidatedCoupon, OrderResponse, PaymentResponse, PaymentInput } from "../service";

const STEPS = ["Carrinho", "Entrega", "Pagamento"];
const DELIVERY_FEE = 6.9;

type Step = "cart" | "delivery" | "payment" | "pix" | "done";

type DoneData = {
  order: OrderResponse;
  payment: PaymentResponse;
  deliveryType: string;
};

type Props = { slug: string };

export function CheckoutPage({ slug }: Props) {
  const { items, clear } = useCart();
  const { saveOrder } = useOrders();
  const [step, setStep] = useState<Step>("cart");
  const [coupon, setCoupon] = useState<ValidatedCoupon | null>(null);
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [addressId, setAddressId] = useState<string | null>(null);
  const [doneData, setDoneData] = useState<DoneData | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createOrder = useCreateOrder(slug);
  const createPayment = useCreatePayment(slug);

  const stepNum = { cart: 1, delivery: 2, payment: 3, pix: 3, done: 3 }[step];
  const showDelivery = step !== "cart";

  // Body do preview (mesmo shape do pedido). Memo evita refetch a cada render.
  const previewBody = useMemo(
    () => ({
      deliveryType,
      addressId: deliveryType === "delivery" ? addressId : null,
      couponCode: coupon?.code ?? null,
      items: items.map((i) => ({ productVariantId: i.variantId, quantity: i.qty })),
    }),
    [deliveryType, addressId, coupon?.code, items],
  );

  const preview = usePreviewOrder(slug, previewBody, showDelivery);

  // Total autoritativo do backend; fallback no cálculo client-side enquanto carrega.
  const fallback = calcTotals(items, coupon, deliveryType === "delivery" ? DELIVERY_FEE : 0, showDelivery);
  const total = preview.data ? Number(preview.data.total ?? 0) : fallback.total;

  const submitting = createOrder.isPending || createPayment.isPending;

  async function handleConfirm(input: PaymentInput) {
    setSubmitError(null);
    try {
      const order = await createOrder.mutateAsync({
        deliveryType,
        addressId: deliveryType === "delivery" ? addressId : null,
        couponCode: coupon?.code ?? null,
        items: items.map((i) => ({ productVariantId: i.variantId, quantity: i.qty })),
      });

      const payment = await createPayment.mutateAsync({ orderId: order.id!, input });

      if (payment.isFinal && !payment.isApproved) {
        setSubmitError("Pagamento recusado. Tente novamente ou use outra forma de pagamento.");
        return;
      }

      setDoneData({ order, payment, deliveryType });

      // Persiste o pedido na sessão para a área do cliente
      saveOrder({
        id: order.id!,
        total: Number(order.total ?? 0),
        deliveryType,
        paymentStatus: payment.status ?? "Created",
        paymentMethod: input.method,
        createdAt: order.createdAt ?? new Date().toISOString(),
        items: (order.items ?? []).map((item) => ({
          variantId: item.productVariantId ?? "",
          productName: item.productName ?? "",
          variantName: item.variantName ?? "",
          qty: Number(item.quantity ?? 1),
          unitPrice: Number(item.unitPrice ?? 0),
        })),
      });

      clear();
      // Cartão: aprovado na hora → sucesso. PIX: aguarda confirmação por webhook → tela com QR + polling.
      setStep(input.method === "Pix" && !payment.isApproved ? "pix" : "done");
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch (err) {
      setSubmitError(checkoutErrorMessage(err));
    }
  }

  // Header comum
  const header = (
    <header className="sticky top-0 z-30 bg-white border-b border-ink-200">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
        <Link
          href={`/stores/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-ink-700 hover:text-ink-900 transition-colors"
        >
          <Icon name="ArrowLeft" size={17} />
          <span className="hidden sm:inline">Continuar comprando</span>
          <span className="sm:hidden">Voltar</span>
        </Link>
        <div className="text-xs text-ink-500 inline-flex items-center gap-1.5">
          <Icon name="ShieldCheck" size={14} className="text-brand-600" />
          <span className="hidden sm:inline">Compra segura</span>
        </div>
      </div>
    </header>
  );

  // Carrinho vazio
  if (items.length === 0 && step !== "done") {
    return (
      <div className="min-h-screen w-full bg-ink-50/60">
        {header}
        <main className="max-w-[560px] mx-auto px-4 sm:px-6 py-16 flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-full bg-ink-100 text-ink-400 grid place-items-center mb-4">
            <Icon name="ShoppingBag" size={28} />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-ink-900">Seu carrinho está vazio</h1>
          <p className="mt-2 text-ink-500">Explore o catálogo e adicione produtos para finalizar seu pedido.</p>
          <Link
            href={`/stores/${slug}`}
            className="mt-6 h-12 px-6 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition-all inline-flex items-center justify-center gap-2"
          >
            <Icon name="ArrowLeft" size={18} /> Voltar à loja
          </Link>
        </main>
      </div>
    );
  }

  // PIX: aguardando pagamento (QR + polling do status do pedido)
  if (step === "pix" && doneData) {
    return (
      <div className="min-h-screen w-full bg-ink-50/60">
        {header}
        <PixPayment
          slug={slug}
          order={doneData.order}
          payment={doneData.payment}
          deliveryType={doneData.deliveryType}
        />
      </div>
    );
  }

  // Pedido confirmado
  if (step === "done" && doneData) {
    return (
      <div className="min-h-screen w-full bg-ink-50/60">
        {header}
        <OrderConfirmed
          slug={slug}
          order={doneData.order}
          payment={doneData.payment}
          deliveryType={doneData.deliveryType}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-ink-50/60">
      {header}
      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6">
        <div className="max-w-[520px] mx-auto mb-6">
          <StepIndicator steps={STEPS} current={stepNum} />
        </div>

        {submitError && (
          <div className="mb-4 max-w-2xl mx-auto rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <Icon name="CircleAlert" size={15} className="shrink-0" />
            {submitError}
            {step === "payment" && (
              <AppButton variant="outline" size="sm" className="ml-auto" onClick={() => setSubmitError(null)}>
                Tentar novamente
              </AppButton>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* Coluna principal */}
          <div className="lg:col-span-2">
            {step === "cart" && (
              <CartStep
                slug={slug}
                coupon={coupon}
                onCouponApplied={setCoupon}
                onNext={() => { setStep("delivery"); window.scrollTo({ top: 0, behavior: "instant" }); }}
              />
            )}
            {step === "delivery" && (
              <DeliveryStep
                slug={slug}
                deliveryType={deliveryType}
                addressId={addressId}
                onDeliveryType={setDeliveryType}
                onAddress={setAddressId}
                onNext={() => { setStep("payment"); window.scrollTo({ top: 0, behavior: "instant" }); }}
                onBack={() => { setStep("cart"); window.scrollTo({ top: 0, behavior: "instant" }); }}
              />
            )}
            {step === "payment" && (
              <PaymentStep
                total={total}
                submitting={submitting}
                onConfirm={handleConfirm}
                onBack={() => { setStep("delivery"); window.scrollTo({ top: 0, behavior: "instant" }); }}
              />
            )}
          </div>

          {/* Resumo (sticky) */}
          <aside className="lg:sticky lg:top-24">
            <OrderSummary
              items={items}
              coupon={coupon}
              deliveryFee={deliveryType === "delivery" ? DELIVERY_FEE : 0}
              showDelivery={showDelivery}
              preview={showDelivery ? preview.data ?? null : null}
              previewLoading={preview.isFetching}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}
