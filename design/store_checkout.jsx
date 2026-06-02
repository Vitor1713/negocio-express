// ============================================================================
// LOJA — Carrinho + Checkout (PÁGINA SEPARADA, não modal)
//   POST /stores/{slug}/orders         { deliveryType, couponCode, items[] }
//   POST /stores/{slug}/orders/{id}/payment  { method }
//   GET  /stores/{slug}/addresses
// ============================================================================

// Endereços do cliente (GET /stores/{slug}/addresses)
const STORE_ADDRESSES = [
  { id: "a1", street: "Rua das Acácias", number: "120", complement: "Apto 42", neighborhood: "Vila Mariana", city: "São Paulo", state: "SP", zipCode: "04101-000" },
  { id: "a2", street: "Av. Paulista", number: "1500", complement: "Sala 8", neighborhood: "Bela Vista", city: "São Paulo", state: "SP", zipCode: "01310-100" },
];

const PAYMENT_METHODS = [
  { key: "pix",         label: "Pix",                icon: "QrCode",     hint: "Aprovação imediata" },
  { key: "credit_card", label: "Cartão de crédito",  icon: "CreditCard", hint: "Em até 12x" },
  { key: "cash",        label: "Dinheiro",           icon: "Banknote",   hint: "Pague na entrega" },
];

const CHECKOUT_STEPS = ["Carrinho", "Entrega", "Pagamento"];

// ============================================================================
// PÁGINA DE CHECKOUT
// ============================================================================
function CartPage({ items, onSetQty, onClear, onClose, couponCode, setCouponCode, appliedCoupon, onApplyCoupon, onOrderPlaced }) {
  const BRL = window.storeBRL2;
  const [step, setStep] = React.useState("cart"); // cart | delivery | payment | done
  const [deliveryType, setDeliveryType] = React.useState("delivery");
  const [addressId, setAddressId] = React.useState("a1");
  const [method, setMethod] = React.useState("pix");
  const [placedOrder, setPlacedOrder] = React.useState(null);

  const subtotal = items.reduce((s, it) => s + it.finalPrice * it.qty, 0);
  const count = items.reduce((s, it) => s + it.qty, 0);
  const deliveryFee = deliveryType === "delivery" && subtotal > 0 ? 6.90 : 0;
  const discount = appliedCoupon && appliedCoupon !== "invalid"
    ? (appliedCoupon.discountType === "percentage" ? subtotal * (appliedCoupon.discountValue / 100) : Math.min(appliedCoupon.discountValue, subtotal))
    : 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);
  const stepNum = { cart: 1, delivery: 2, payment: 3 }[step] || 1;

  const placeOrder = () => {
    const order = {
      id: "#" + Math.floor(1000 + Math.random() * 9000),
      deliveryType, method, total, subtotal, deliveryFee, discount,
      eta: deliveryType === "delivery" ? "30–40 min" : "Pronto em 15 min",
      paymentStatus: method === "cash" ? "pending" : "paid",
    };
    setPlacedOrder(order);
    setStep("done");
    window.scrollTo({ top: 0, behavior: "instant" });
    onOrderPlaced && onOrderPlaced(order);
  };

  const goStep = (s) => { setStep(s); window.scrollTo({ top: 0, behavior: "instant" }); };

  // ===== Cabeçalho da página =====
  const Header = (
    <header className="sticky top-0 z-30 bg-white border-b border-ink-200">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
        <button onClick={onClose} className="inline-flex items-center gap-1.5 text-sm text-ink-700 hover:text-ink-900 transition-colors">
          <Icon name="ArrowLeft" size={17} /> <span className="hidden sm:inline">Continuar comprando</span><span className="sm:hidden">Voltar</span>
        </button>
        <div className="flex items-center gap-2.5">
          <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center shadow-soft"><Icon name="Wheat" size={18} /></span>
          <span className="font-display font-extrabold text-[15px] text-ink-900 hidden sm:block">Padaria do João</span>
        </div>
        <div className="text-xs text-ink-500 inline-flex items-center gap-1.5"><Icon name="ShieldCheck" size={14} className="text-brand-600" /> <span className="hidden sm:inline">Compra segura</span></div>
      </div>
    </header>
  );

  // ===== Estado: pedido confirmado =====
  if (step === "done" && placedOrder) {
    return (
      <div className="min-h-screen w-full bg-ink-50/60 screen-enter">
        {Header}
        <main className="max-w-[560px] mx-auto px-4 sm:px-6 py-12 flex flex-col items-center text-center">
          <span className="h-20 w-20 rounded-full bg-brand-100 text-brand-700 grid place-items-center"><Icon name="CheckCircle2" size={44} /></span>
          <h1 className="mt-5 font-display font-extrabold text-2xl sm:text-3xl text-ink-900 tracking-tight">Pedido confirmado!</h1>
          <p className="mt-2 text-ink-500">Seu pedido <strong className="text-ink-900">{placedOrder.id}</strong> foi recebido e já está sendo preparado.</p>

          <div className="mt-8 w-full bg-white border border-ink-200 rounded-2xl shadow-soft p-6 text-left">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center"><span className="text-ink-500">Status do pedido</span><Badge tone="warning" dot>Pendente</Badge></div>
              <div className="flex justify-between items-center"><span className="text-ink-500">Pagamento</span>
                {placedOrder.paymentStatus === "paid" ? <Badge tone="success" dot>Aprovado</Badge> : <Badge tone="warning" dot>Na entrega</Badge>}
              </div>
              <div className="flex justify-between items-center"><span className="text-ink-500">{placedOrder.deliveryType === "delivery" ? "Previsão de entrega" : "Retirada"}</span><span className="text-ink-900 font-medium">{placedOrder.eta}</span></div>
              <div className="flex justify-between items-center border-t border-ink-100 pt-3 mt-1"><span className="font-display font-bold text-ink-900">Total pago</span><span className="font-display font-extrabold text-ink-900 text-lg tabular-nums">{BRL(placedOrder.total)}</span></div>
            </div>
            <div className="mt-4 pt-4 border-t border-ink-100 flex items-center gap-2 text-xs text-ink-500">
              <Icon name="Bell" size={14} /> Você receberá atualizações do pedido por WhatsApp.
            </div>
          </div>

          <button onClick={() => { onClear(); onClose(); }} className="mt-6 w-full h-12 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition-all inline-flex items-center justify-center gap-2">
            <Icon name="Store" size={18} /> Voltar à loja
          </button>
        </main>
      </div>
    );
  }

  // ===== Estado: carrinho vazio =====
  if (items.length === 0) {
    return (
      <div className="min-h-screen w-full bg-ink-50/60 screen-enter">
        {Header}
        <main className="max-w-[560px] mx-auto px-4 sm:px-6 py-16 flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-full bg-ink-100 text-ink-400 grid place-items-center mb-4"><Icon name="ShoppingBag" size={28} /></div>
          <h1 className="font-display font-extrabold text-2xl text-ink-900">Seu carrinho está vazio</h1>
          <p className="mt-2 text-ink-500">Explore o catálogo e adicione produtos para finalizar seu pedido.</p>
          <button onClick={onClose} className="mt-6 h-12 px-6 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition-all inline-flex items-center justify-center gap-2">
            <Icon name="ArrowLeft" size={18} /> Voltar à loja
          </button>
        </main>
      </div>
    );
  }

  // ===== Conteúdo por etapa (coluna principal) =====
  let mainContent = null;
  if (step === "cart") {
    mainContent = (
      <section className="bg-white border border-ink-200 rounded-2xl shadow-soft overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-ink-100 flex items-center justify-between">
          <h2 className="font-display font-bold text-ink-900">Itens do carrinho <span className="text-ink-400 font-sans font-normal">({count})</span></h2>
          <button onClick={onClear} className="text-xs font-medium text-ink-500 hover:text-red-600 transition-colors inline-flex items-center gap-1"><Icon name="Trash2" size={13} /> Limpar</button>
        </div>
        <div className="divide-y divide-ink-100">
          {items.map((it) => (
            <div key={it.variantId} className="flex gap-3 sm:gap-4 p-4 sm:px-6">
              <div className={`h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-xl bg-gradient-to-br ${it.accent} grid place-items-center`}>
                <Icon name={it.icon} size={28} className="text-brand-700" strokeWidth={1.6} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[14px] sm:text-[15px] font-display font-semibold text-ink-900 leading-snug line-clamp-1">{it.productName}</div>
                    <div className="text-[12.5px] text-ink-500">{it.variantName} · {BRL(it.finalPrice)}</div>
                  </div>
                  <button onClick={() => onSetQty(it.variantId, 0)} className="text-ink-400 hover:text-red-500 transition-colors shrink-0"><Icon name="Trash2" size={16} /></button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="inline-flex items-center border border-ink-200 rounded-lg overflow-hidden">
                    <button onClick={() => onSetQty(it.variantId, it.qty - 1)} className="h-9 w-9 grid place-items-center hover:bg-ink-100 text-ink-700"><Icon name={it.qty === 1 ? "Trash2" : "Minus"} size={15} /></button>
                    <span className="w-9 text-center font-semibold text-sm tabular-nums">{it.qty}</span>
                    <button onClick={() => onSetQty(it.variantId, Math.min(it.stock, it.qty + 1))} disabled={it.qty >= it.stock} className="h-9 w-9 grid place-items-center hover:bg-ink-100 text-ink-700 disabled:text-ink-300"><Icon name="Plus" size={15} /></button>
                  </div>
                  <div className="font-display font-bold text-ink-900 tabular-nums">{BRL(it.finalPrice * it.qty)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  } else if (step === "delivery") {
    mainContent = (
      <section className="space-y-5">
        <div className="bg-white border border-ink-200 rounded-2xl shadow-soft p-5 sm:p-6">
          <h2 className="font-display font-bold text-ink-900 mb-3">Como deseja receber?</h2>
          <div className="grid grid-cols-2 gap-3">
            {[{ k: "delivery", l: "Entrega", i: "Bike", d: "30–40 min" }, { k: "pickup", l: "Retirada na loja", i: "Store", d: "Pronto em 15 min" }].map((o) => (
              <button key={o.k} onClick={() => setDeliveryType(o.k)}
                className={`p-4 rounded-xl border text-left transition-all ${deliveryType === o.k ? "border-brand-600 bg-brand-50 ring-2 ring-brand-100" : "border-ink-200 hover:bg-ink-50"}`}>
                <Icon name={o.i} size={22} className={deliveryType === o.k ? "text-brand-700" : "text-ink-500"} />
                <div className="mt-2 text-sm font-semibold text-ink-900">{o.l}</div>
                <div className="text-[12px] text-ink-500">{o.d}</div>
              </button>
            ))}
          </div>
        </div>

        {deliveryType === "delivery" ? (
          <div className="bg-white border border-ink-200 rounded-2xl shadow-soft p-5 sm:p-6">
            <h2 className="font-display font-bold text-ink-900 mb-3">Endereço de entrega</h2>
            <div className="space-y-2.5">
              {STORE_ADDRESSES.map((a) => (
                <button key={a.id} onClick={() => setAddressId(a.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${addressId === a.id ? "border-brand-600 bg-brand-50/60 ring-2 ring-brand-100" : "border-ink-200 hover:bg-ink-50"}`}>
                  <Icon name="MapPin" size={18} className={`mt-0.5 ${addressId === a.id ? "text-brand-700" : "text-ink-400"}`} />
                  <div className="flex-1 min-w-0 text-[13.5px]">
                    <div className="font-medium text-ink-900">{a.street}, {a.number}{a.complement ? ` · ${a.complement}` : ""}</div>
                    <div className="text-ink-500">{a.neighborhood} · {a.city}/{a.state} · {a.zipCode}</div>
                  </div>
                  {addressId === a.id && <Icon name="CheckCircle2" size={18} className="text-brand-600" />}
                </button>
              ))}
              <button className="w-full p-3.5 rounded-xl border border-dashed border-ink-300 text-sm font-medium text-ink-600 hover:border-brand-400 hover:text-brand-700 transition-all inline-flex items-center justify-center gap-1.5">
                <Icon name="Plus" size={15} /> Adicionar novo endereço
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-ink-200 rounded-2xl shadow-soft p-5 sm:p-6 flex items-start gap-3">
            <span className="h-11 w-11 rounded-lg bg-brand-100 text-brand-700 grid place-items-center shrink-0"><Icon name="Store" size={20} /></span>
            <div className="text-[13.5px]">
              <div className="font-medium text-ink-900">Retirar na loja</div>
              <div className="text-ink-500 mt-0.5">Rua das Flores, 245 — Vila Mariana, SP · Seg–Sáb 06h–20h</div>
            </div>
          </div>
        )}
      </section>
    );
  } else if (step === "payment") {
    mainContent = (
      <section className="space-y-5">
        <div className="bg-white border border-ink-200 rounded-2xl shadow-soft p-5 sm:p-6">
          <h2 className="font-display font-bold text-ink-900 mb-3">Forma de pagamento</h2>
          <div className="space-y-2.5">
            {PAYMENT_METHODS.map((m) => (
              <button key={m.key} onClick={() => setMethod(m.key)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 ${method === m.key ? "border-brand-600 bg-brand-50/60 ring-2 ring-brand-100" : "border-ink-200 hover:bg-ink-50"}`}>
                <span className={`h-10 w-10 rounded-lg grid place-items-center shrink-0 ${method === m.key ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-500"}`}><Icon name={m.icon} size={18} /></span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-ink-900">{m.label}</div>
                  <div className="text-[12px] text-ink-500">{m.hint}</div>
                </div>
                {method === m.key && <Icon name="CheckCircle2" size={18} className="text-brand-600" />}
              </button>
            ))}
          </div>
        </div>

        {method === "pix" && (
          <div className="bg-white border border-ink-200 rounded-2xl shadow-soft p-5 sm:p-6 text-center">
            <div className="mx-auto h-32 w-32 rounded-xl bg-ink-900 grid place-items-center"><Icon name="QrCode" size={72} className="text-white" /></div>
            <p className="mt-3 text-sm text-ink-500">Escaneie o QR Code ou copie a chave Pix ao confirmar o pedido.</p>
          </div>
        )}
      </section>
    );
  }

  // ===== Ação primária da etapa (no resumo) =====
  const primaryAction = step === "cart"
    ? { label: "Continuar para entrega", icon: "ArrowRight", onClick: () => goStep("delivery") }
    : step === "delivery"
    ? { label: "Ir para pagamento", icon: "ArrowRight", onClick: () => goStep("payment") }
    : { label: `Finalizar pedido · ${BRL(total)}`, icon: "Check", onClick: placeOrder };

  const prevStep = step === "delivery" ? "cart" : step === "payment" ? "delivery" : null;

  return (
    <div className="min-h-screen w-full bg-ink-50/60 screen-enter">
      {Header}
      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6">
        {/* Steps */}
        <div className="max-w-[520px] mx-auto mb-6">
          <StepIndicator steps={CHECKOUT_STEPS} current={stepNum} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-4">
            {prevStep && (
              <button onClick={() => goStep(prevStep)} className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 transition-colors">
                <Icon name="ArrowLeft" size={15} /> Voltar para {prevStep === "cart" ? "o carrinho" : "entrega"}
              </button>
            )}
            {mainContent}
          </div>

          {/* Resumo (sticky) */}
          <aside className="lg:sticky lg:top-24">
            <div className="bg-white border border-ink-200 rounded-2xl shadow-soft p-5 sm:p-6">
              <h2 className="font-display font-bold text-ink-900 mb-4">Resumo do pedido</h2>

              {/* mini-lista */}
              <div className="space-y-2 mb-4 max-h-[160px] overflow-y-auto scroll-thin">
                {items.map((it) => (
                  <div key={it.variantId} className="flex items-center gap-2 text-[13px]">
                    <span className="h-6 w-6 rounded-md bg-brand-100 text-brand-700 grid place-items-center text-[11px] font-bold shrink-0 tabular-nums">{it.qty}×</span>
                    <span className="flex-1 min-w-0 truncate text-ink-700">{it.productName} <span className="text-ink-400">· {it.variantName}</span></span>
                    <span className="text-ink-900 font-medium tabular-nums">{BRL(it.finalPrice * it.qty)}</span>
                  </div>
                ))}
              </div>

              {/* cupom */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"><Icon name="Tag" size={15} /></span>
                    <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Cupom de desconto"
                      className="w-full bg-white border border-ink-200 rounded-lg pl-9 pr-3 py-2 text-sm placeholder-ink-400 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" />
                  </div>
                  <button onClick={onApplyCoupon} className="px-3 py-2 rounded-lg bg-ink-100 text-ink-700 text-sm font-medium hover:bg-ink-200 transition-colors">Aplicar</button>
                </div>
                {appliedCoupon && appliedCoupon !== "invalid" && <p className="mt-1.5 text-xs text-brand-700 flex items-center gap-1"><Icon name="CheckCircle2" size={13} /> Cupom <strong>{appliedCoupon.code}</strong> aplicado.</p>}
                {appliedCoupon === "invalid" && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><Icon name="AlertCircle" size={13} /> Cupom inválido ou abaixo do mínimo.</p>}
              </div>

              <CartTotals BRL={BRL} subtotal={subtotal} deliveryFee={deliveryFee} discount={discount} total={total} showDelivery={step !== "cart"} />

              <button onClick={primaryAction.onClick} className="mt-4 w-full inline-flex items-center justify-center gap-2 h-12 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition-all">
                {primaryAction.label} <Icon name={primaryAction.icon} size={18} />
              </button>

              {step === "cart" && (
                <p className="mt-3 text-[11.5px] text-ink-500 text-center">Frete e descontos calculados nas próximas etapas.</p>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function CartTotals({ BRL, subtotal, deliveryFee, discount, total, showDelivery }) {
  return (
    <div className="space-y-1.5 text-sm border-t border-ink-100 pt-4">
      <div className="flex justify-between text-ink-700"><span>Subtotal</span><span className="tabular-nums">{BRL(subtotal)}</span></div>
      {showDelivery && <div className="flex justify-between text-ink-700"><span>Taxa de entrega</span><span className="tabular-nums">{BRL(deliveryFee)}</span></div>}
      {discount > 0 && <div className="flex justify-between text-brand-700"><span>Desconto</span><span className="tabular-nums">− {BRL(discount)}</span></div>}
      <div className="flex justify-between items-center pt-2 border-t border-ink-100">
        <span className="font-display font-bold text-ink-900">Total</span>
        <span className="font-display font-extrabold text-ink-900 text-lg tabular-nums">{BRL(total)}</span>
      </div>
    </div>
  );
}

Object.assign(window, { CartPage, CartTotals });
