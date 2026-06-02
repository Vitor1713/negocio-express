// ============================================================================
// SEÇÃO — PEDIDOS  (GET /orders, PUT /orders/{id}/status)
//   + Nova venda (POST /stores/{slug}/orders)
//   + Atribuir entregador (PUT /deliveries/{id}/assign)
// ============================================================================

function OrdersSection({ orders: ordersProp, setOrders: setOrdersProp, intent, setIntent }) {
  const { ORDER_STATUS, ORDER_FLOW, DELIVERY_TYPE, BRL, fmtTime, fmtDateTime } = window.DASH;
  // usa estado elevado quando disponível; senão estado local (fallback)
  const [localOrders, setLocalOrders] = React.useState(window.DASH.ORDERS);
  const orders = ordersProp || localOrders;
  const setOrders = setOrdersProp || setLocalOrders;

  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const [selected, setSelected] = React.useState(null);
  const [newOpen, setNewOpen] = React.useState(false);

  // Abre "Nova venda" quando solicitado pela Visão geral
  React.useEffect(() => {
    if (intent === "new-order") { setNewOpen(true); setIntent && setIntent(null); }
  }, [intent]);

  const counts = React.useMemo(() => {
    const c = { all: orders.length };
    orders.forEach((o) => { c[o.status] = (c[o.status] || 0) + 1; });
    return c;
  }, [orders]);

  const filtered = orders.filter((o) => {
    const matchF = filter === "all" || o.status === filter;
    const q = search.toLowerCase();
    const matchQ = !q || o.customerId.toLowerCase().includes(q) || o.id.includes(q);
    return matchF && matchQ;
  });

  const orderNo = (o) => "#" + String(o.seq != null ? o.seq : o.id.replace(/\D/g, "")).padStart(4, "0");

  const advanceStatus = (order) => {
    const idx = ORDER_FLOW.indexOf(order.status);
    if (idx < 0 || idx >= ORDER_FLOW.length - 1) return;
    const next = ORDER_FLOW[idx + 1];
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: next } : o)));
    setSelected((s) => (s && s.id === order.id ? { ...s, status: next } : s));
  };
  const cancelOrder = (order) => {
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: "cancelled" } : o)));
    setSelected((s) => (s && s.id === order.id ? { ...s, status: "cancelled" } : s));
  };
  const assignDeliverer = (orderId, deliverer) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, delivererId: deliverer.id, delivererName: deliverer.name } : o)));
    setSelected((s) => (s && s.id === orderId ? { ...s, delivererId: deliverer.id, delivererName: deliverer.name } : s));
  };
  const createOrder = (order) => {
    setOrders((prev) => [{ ...order, seq: 1248 + prev.length + 1 }, ...prev]);
    setNewOpen(false);
  };

  const filterOptions = [
    { value: "all", label: "Todos", count: counts.all },
    { value: "pending", label: "Pendentes", count: counts.pending || 0 },
    { value: "paid", label: "Pagos", count: counts.paid || 0 },
    { value: "preparing", label: "Em preparo", count: counts.preparing || 0 },
    { value: "out_for_delivery", label: "Em entrega", count: counts.out_for_delivery || 0 },
    { value: "delivered", label: "Entregues", count: counts.delivered || 0 },
    { value: "cancelled", label: "Cancelados", count: counts.cancelled || 0 },
  ];

  const nextLabel = (status) => {
    const idx = ORDER_FLOW.indexOf(status);
    if (idx < 0 || idx >= ORDER_FLOW.length - 1) return null;
    return ORDER_STATUS[ORDER_FLOW[idx + 1]].label;
  };

  return (
    <React.Fragment>
      <PageHead title="Pedidos" subtitle={`${orders.length} pedidos hoje`}>
        <Button icon="Plus" onClick={() => setNewOpen(true)}>Nova venda</Button>
      </PageHead>

      <Toolbar search={search} setSearch={setSearch} placeholder="Buscar por cliente ou nº do pedido..." />
      <div className="mb-4"><FilterChips value={filter} onChange={setFilter} options={filterOptions} /></div>

      {filtered.length === 0 ? (
        <EmptyState icon="ShoppingBag" title="Nenhum pedido encontrado" desc="Ajuste os filtros ou registre uma nova venda."
          action={<Button icon="Plus" onClick={() => setNewOpen(true)}>Nova venda</Button>} />
      ) : (
        <Card className="overflow-hidden">
          {/* Tabela (desktop) */}
          <div className="hidden md:block overflow-x-auto scroll-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink-500 border-b border-ink-200 bg-ink-50/60">
                  <th className="py-3 px-5 font-medium">Pedido</th>
                  <th className="py-3 px-5 font-medium">Cliente</th>
                  <th className="py-3 px-5 font-medium">Itens</th>
                  <th className="py-3 px-5 font-medium">Tipo</th>
                  <th className="py-3 px-5 font-medium">Total</th>
                  <th className="py-3 px-5 font-medium">Status</th>
                  <th className="py-3 px-5 font-medium">Hora</th>
                  <th className="py-3 px-5 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const st = ORDER_STATUS[o.status]; const dt = DELIVERY_TYPE[o.deliveryType];
                  const qtd = o.items.reduce((s, it) => s + it.quantity, 0);
                  return (
                    <tr key={o.id} onClick={() => setSelected(o)} className="border-b border-ink-100 last:border-0 hover:bg-brand-50/40 transition-colors cursor-pointer">
                      <td className="py-3.5 px-5 font-mono font-medium text-ink-900">{orderNo(o)}</td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={o.customerId} size="sm" tone="brand" />
                          <span className="font-medium text-ink-900">{o.customerId}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-ink-700 tabular-nums">{qtd} {qtd === 1 ? "item" : "itens"}</td>
                      <td className="py-3.5 px-5 text-ink-700"><span className="inline-flex items-center gap-1.5"><Icon name={dt.icon} size={14} className="text-ink-400" />{dt.label}</span></td>
                      <td className="py-3.5 px-5 font-display font-semibold text-ink-900 tabular-nums">{BRL(o.total)}</td>
                      <td className="py-3.5 px-5"><Badge tone={st.tone} dot>{st.label}</Badge></td>
                      <td className="py-3.5 px-5 text-ink-500 tabular-nums">{fmtTime(o.createdAt)}</td>
                      <td className="py-3.5 px-5 text-ink-400"><Icon name="ChevronRight" size={16} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards (mobile) */}
          <div className="md:hidden divide-y divide-ink-100">
            {filtered.map((o) => {
              const st = ORDER_STATUS[o.status]; const dt = DELIVERY_TYPE[o.deliveryType];
              const qtd = o.items.reduce((s, it) => s + it.quantity, 0);
              return (
                <button key={o.id} onClick={() => setSelected(o)} className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-ink-50 transition-colors">
                  <Avatar name={o.customerId} size="md" tone="brand" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-ink-900 truncate">{o.customerId}</span>
                    </div>
                    <div className="text-[11.5px] text-ink-500 flex items-center gap-1.5 mt-0.5">
                      {orderNo(o)} · <Icon name={dt.icon} size={12} /> {dt.label} · {qtd} itens
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display font-semibold text-sm text-ink-900 tabular-nums">{BRL(o.total)}</div>
                    <Badge tone={st.tone} size="sm" dot>{st.label}</Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Drawer de detalhe */}
      <DashDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        icon="ShoppingBag"
        title={selected ? `Pedido ${orderNo(selected)}` : ""}
        subtitle={selected ? fmtDateTime(selected.createdAt) : ""}
        width={440}
        footer={selected && selected.status !== "delivered" && selected.status !== "cancelled" ? (
          <div className="flex gap-2">
            <Button variant="danger" onClick={() => cancelOrder(selected)} icon="X">Cancelar</Button>
            {nextLabel(selected.status) && (
              <Button fullWidth onClick={() => advanceStatus(selected)} iconRight="ArrowRight">
                Marcar como {nextLabel(selected.status)}
              </Button>
            )}
          </div>
        ) : null}
      >
        {selected && <OrderDetail order={selected} onAssign={assignDeliverer} />}
      </DashDrawer>

      {/* Drawer de Nova venda */}
      <NewOrderDrawer open={newOpen} onClose={() => setNewOpen(false)} onCreate={createOrder} />
    </React.Fragment>
  );
}

// ---------- Detalhe do pedido -----------------------------------------------
function OrderDetail({ order, onAssign }) {
  const { ORDER_STATUS, ORDER_FLOW, DELIVERY_TYPE, VEHICLE_TYPE, BRL, DELIVERERS } = window.DASH;
  const st = ORDER_STATUS[order.status]; const dt = DELIVERY_TYPE[order.deliveryType];
  const stepIdx = ORDER_FLOW.indexOf(order.status);
  const [picking, setPicking] = React.useState(false);
  const activeDeliverers = DELIVERERS.filter((d) => d.isActive);
  const showDelivery = order.deliveryType === "delivery" && ["paid", "preparing", "out_for_delivery", "delivered"].includes(order.status);

  return (
    <div className="p-5 space-y-5">
      {/* status atual */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar name={order.customerId} size="md" tone="brand" />
          <div>
            <div className="text-sm font-semibold text-ink-900 leading-tight">{order.customerId}</div>
            <div className="text-xs text-ink-500 inline-flex items-center gap-1"><Icon name={dt.icon} size={12} /> {dt.label}</div>
          </div>
        </div>
        <Badge tone={st.tone} dot>{st.label}</Badge>
      </div>

      {/* timeline de status */}
      {order.status !== "cancelled" ? (
        <div className="flex items-center gap-1">
          {ORDER_FLOW.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`h-2 w-2 rounded-full shrink-0 ${i <= stepIdx ? "bg-brand-500" : "bg-ink-200"}`} />
              {i < ORDER_FLOW.length - 1 && <div className={`flex-1 h-0.5 ${i < stepIdx ? "bg-brand-500" : "bg-ink-200"}`} />}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 flex items-center gap-2">
          <Icon name="XCircle" size={15} /> Pedido cancelado
        </div>
      )}

      {/* entregador (PUT /deliveries/{id}/assign) */}
      {showDelivery && (
        <div className="rounded-xl border border-ink-200 p-3">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wide text-ink-500 font-semibold">Entregador</div>
            {order.delivererName && !picking && (
              <button onClick={() => setPicking(true)} className="text-xs font-medium text-brand-700 hover:underline">Trocar</button>
            )}
          </div>
          {order.delivererName && !picking ? (
            <div className="mt-2 flex items-center gap-2.5">
              <Avatar name={order.delivererName} size="sm" tone="blue" />
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-medium text-ink-900 truncate">{order.delivererName}</div>
                <div className="text-[11.5px] text-ink-500">A caminho</div>
              </div>
              <Icon name="CheckCircle2" size={16} className="text-brand-600" />
            </div>
          ) : picking ? (
            <div className="mt-2 space-y-1.5">
              {activeDeliverers.map((d) => {
                const vt = VEHICLE_TYPE[d.vehicleType];
                return (
                  <button key={d.id} onClick={() => { onAssign(order.id, d); setPicking(false); }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg border border-ink-200 hover:border-brand-400 hover:bg-brand-50/50 transition-all text-left">
                    <Avatar name={d.name} size="sm" tone="blue" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-ink-900 truncate">{d.name}</div>
                      <div className="text-[11px] text-ink-500 inline-flex items-center gap-1"><Icon name={vt.icon} size={11} /> {vt.label}</div>
                    </div>
                    <Icon name="Plus" size={15} className="text-brand-600" />
                  </button>
                );
              })}
            </div>
          ) : (
            <button onClick={() => setPicking(true)} className="mt-2 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-ink-300 text-sm font-medium text-ink-700 hover:border-brand-400 hover:bg-brand-50/50 transition-all">
              <Icon name="Bike" size={16} /> Atribuir entregador
            </button>
          )}
        </div>
      )}

      {/* itens */}
      <div>
        <div className="text-xs uppercase tracking-wide text-ink-500 font-semibold mb-2">Itens</div>
        <div className="space-y-2">
          {order.items.map((it) => (
            <div key={it.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-ink-200">
              <span className="h-8 w-8 rounded-md bg-brand-100 text-brand-700 grid place-items-center text-xs font-bold shrink-0 tabular-nums">{it.quantity}×</span>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-medium text-ink-900 truncate leading-tight">{it.productName}</div>
                <div className="text-[11.5px] text-ink-500 leading-tight">{it.variantName}</div>
              </div>
              <div className="text-sm font-medium text-ink-900 tabular-nums">{BRL(it.unitPrice * it.quantity)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* totais */}
      <div className="space-y-1.5 text-sm border-t border-ink-200 pt-4">
        <div className="flex justify-between text-ink-700"><span>Subtotal</span><span className="tabular-nums">{BRL(order.subtotal)}</span></div>
        <div className="flex justify-between text-ink-700"><span>Taxa de entrega</span><span className="tabular-nums">{BRL(order.deliveryFee)}</span></div>
        {order.discountAmount > 0 && <div className="flex justify-between text-brand-700"><span>Desconto</span><span className="tabular-nums">− {BRL(order.discountAmount)}</span></div>}
        <div className="flex justify-between items-center pt-2 border-t border-ink-100 mt-2">
          <span className="font-display font-bold text-ink-900">Total</span>
          <span className="font-display font-extrabold text-ink-900 text-lg tabular-nums">{BRL(order.total)}</span>
        </div>
      </div>
    </div>
  );
}

// ---------- Drawer: Nova venda (criar pedido) -------------------------------
function NewOrderDrawer({ open, onClose, onCreate }) {
  const { PRODUCTS, COUPONS, DELIVERY_TYPE, BRL } = window.DASH;
  const [deliveryType, setDeliveryType] = React.useState("delivery");
  const [cart, setCart] = React.useState({});          // { variantId: qty }
  const [couponCode, setCouponCode] = React.useState("");
  const [coupon, setCoupon] = React.useState(null);    // cupom validado | "invalid"
  const [search, setSearch] = React.useState("");

  // reseta ao abrir
  React.useEffect(() => {
    if (open) { setDeliveryType("delivery"); setCart({}); setCouponCode(""); setCoupon(null); setSearch(""); }
  }, [open]);

  // catálogo plano de variações vendáveis
  const rows = React.useMemo(() => {
    const out = [];
    PRODUCTS.filter((p) => p.isActive).forEach((p) => {
      p.variants.filter((v) => v.isActive && v.stock > 0).forEach((v) => {
        out.push({ key: v.id, productName: p.name, variantName: v.name, icon: p.icon, accent: p.accent, price: p.basePrice + v.additionalPrice, stock: v.stock });
      });
    });
    return out;
  }, [PRODUCTS]);

  const visibleRows = rows.filter((r) => {
    const q = search.toLowerCase();
    return !q || r.productName.toLowerCase().includes(q) || r.variantName.toLowerCase().includes(q);
  });

  const setQty = (key, qty) => setCart((c) => {
    const next = { ...c };
    if (qty <= 0) delete next[key]; else next[key] = qty;
    return next;
  });

  const items = Object.entries(cart).map(([key, qty]) => {
    const r = rows.find((x) => x.key === key);
    return { ...r, qty };
  });

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const deliveryFee = deliveryType === "delivery" && subtotal > 0 ? 6.90 : 0;
  const discount = coupon && coupon !== "invalid"
    ? (coupon.discountType === "percentage" ? subtotal * (coupon.discountValue / 100) : Math.min(coupon.discountValue, subtotal))
    : 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);
  const count = items.reduce((s, it) => s + it.qty, 0);

  // valida cupom espelhando POST /coupons/validate
  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    const found = COUPONS.find((c) => c.code === code && c.isActive && (!c.maxUses || c.usedCount < c.maxUses));
    if (found && (found.minOrderAmount == null || subtotal >= found.minOrderAmount)) setCoupon(found);
    else setCoupon("invalid");
  };

  const submit = () => {
    if (items.length === 0) return;
    const order = {
      id: "o-" + Date.now(),
      customerId: "Venda no balcão",
      status: "pending",
      deliveryType,
      subtotal, deliveryFee, discountAmount: discount, total,
      createdAt: new Date().toISOString(),
      couponCode: coupon && coupon !== "invalid" ? coupon.code : null,
      items: items.map((it, i) => ({
        id: "noi" + Date.now() + i,
        productVariantId: it.key,
        productName: it.productName,
        variantName: it.variantName,
        quantity: it.qty,
        unitPrice: it.price,
      })),
    };
    onCreate(order);
  };

  return (
    <DashDrawer
      open={open}
      onClose={onClose}
      icon="Plus"
      title="Nova venda"
      subtitle="Registrar um pedido manual"
      width={480}
      footer={
        <Button fullWidth size="lg" icon="Check" onClick={submit} className={items.length === 0 ? "opacity-50 pointer-events-none" : ""}>
          {items.length === 0 ? "Adicione itens" : `Criar pedido · ${BRL(total)}`}
        </Button>
      }
    >
      <div className="p-5 space-y-5">
        {/* tipo de entrega */}
        <Field label="Tipo">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(DELIVERY_TYPE).map(([key, t]) => (
              <button key={key} onClick={() => setDeliveryType(key)}
                className={`py-2.5 rounded-lg border text-sm font-medium transition-all inline-flex items-center justify-center gap-1.5 ${deliveryType === key ? "border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-100" : "border-ink-200 text-ink-700 hover:bg-ink-50"}`}>
                <Icon name={t.icon} size={15} /> {t.label}
              </button>
            ))}
          </div>
        </Field>

        {/* itens selecionados */}
        {items.length > 0 && (
          <div>
            <div className="text-xs uppercase tracking-wide text-ink-500 font-semibold mb-2">Itens do pedido ({count})</div>
            <div className="space-y-2">
              {items.map((it) => (
                <div key={it.key} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-ink-200 bg-ink-50/40">
                  <span className={`h-9 w-9 rounded-md bg-gradient-to-br ${it.accent} grid place-items-center shrink-0`}>
                    <Icon name={it.icon} size={16} className="text-brand-700" strokeWidth={1.6} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-ink-900 truncate leading-tight">{it.productName}</div>
                    <div className="text-[11.5px] text-ink-500 leading-tight">{it.variantName} · {BRL(it.price)}</div>
                  </div>
                  <div className="inline-flex items-center border border-ink-200 rounded-lg overflow-hidden bg-white">
                    <button onClick={() => setQty(it.key, it.qty - 1)} className="h-7 w-7 grid place-items-center hover:bg-ink-100 text-ink-700"><Icon name={it.qty === 1 ? "Trash2" : "Minus"} size={13} /></button>
                    <span className="text-xs font-semibold w-6 text-center tabular-nums">{it.qty}</span>
                    <button onClick={() => setQty(it.key, Math.min(it.stock, it.qty + 1))} className="h-7 w-7 grid place-items-center hover:bg-ink-100 text-ink-700"><Icon name="Plus" size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* catálogo p/ adicionar */}
        <div>
          <div className="text-xs uppercase tracking-wide text-ink-500 font-semibold mb-2">Adicionar do catálogo</div>
          <Toolbar search={search} setSearch={setSearch} placeholder="Buscar produto ou variação..." />
          <div className="space-y-1.5 max-h-[280px] overflow-y-auto scroll-thin -mr-1 pr-1">
            {visibleRows.map((r) => {
              const qty = cart[r.key] || 0;
              return (
                <div key={r.key} className="flex items-center gap-2.5 p-2 rounded-lg border border-ink-200 hover:border-ink-300 transition-colors">
                  <span className={`h-9 w-9 rounded-md bg-gradient-to-br ${r.accent} grid place-items-center shrink-0`}>
                    <Icon name={r.icon} size={16} className="text-brand-700" strokeWidth={1.6} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-ink-900 truncate leading-tight">{r.productName}</div>
                    <div className="text-[11.5px] text-ink-500 leading-tight">{r.variantName} · {BRL(r.price)} · {r.stock} un.</div>
                  </div>
                  {qty === 0 ? (
                    <button onClick={() => setQty(r.key, 1)} className="h-8 w-8 grid place-items-center rounded-lg border border-brand-200 text-brand-700 hover:bg-brand-600 hover:text-white transition-all shrink-0"><Icon name="Plus" size={16} /></button>
                  ) : (
                    <div className="inline-flex items-center border border-ink-200 rounded-lg overflow-hidden bg-white shrink-0">
                      <button onClick={() => setQty(r.key, qty - 1)} className="h-7 w-7 grid place-items-center hover:bg-ink-100 text-ink-700"><Icon name="Minus" size={13} /></button>
                      <span className="text-xs font-semibold w-6 text-center tabular-nums">{qty}</span>
                      <button onClick={() => setQty(r.key, Math.min(r.stock, qty + 1))} className="h-7 w-7 grid place-items-center hover:bg-ink-100 text-ink-700"><Icon name="Plus" size={13} /></button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* cupom */}
        <div>
          <Field label="Cupom de desconto">
            <div className="flex gap-2">
              <div className="flex-1"><TextInput value={couponCode} onChange={(v) => { setCouponCode(v.toUpperCase()); setCoupon(null); }} prefix="#" placeholder="BOMDIA10" /></div>
              <Button variant="secondary" onClick={applyCoupon}>Aplicar</Button>
            </div>
          </Field>
          {coupon && coupon !== "invalid" && (
            <p className="mt-1.5 text-xs text-brand-700 flex items-center gap-1"><Icon name="CheckCircle2" size={13} /> Cupom <strong>{coupon.code}</strong> aplicado.</p>
          )}
          {coupon === "invalid" && (
            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><Icon name="AlertCircle" size={13} /> Cupom inválido ou pedido abaixo do mínimo.</p>
          )}
        </div>

        {/* totais */}
        {items.length > 0 && (
          <div className="space-y-1.5 text-sm border-t border-ink-200 pt-4">
            <div className="flex justify-between text-ink-700"><span>Subtotal</span><span className="tabular-nums">{BRL(subtotal)}</span></div>
            <div className="flex justify-between text-ink-700"><span>Taxa de entrega</span><span className="tabular-nums">{BRL(deliveryFee)}</span></div>
            {discount > 0 && <div className="flex justify-between text-brand-700"><span>Desconto</span><span className="tabular-nums">− {BRL(discount)}</span></div>}
            <div className="flex justify-between items-center pt-2 border-t border-ink-100 mt-2">
              <span className="font-display font-bold text-ink-900">Total</span>
              <span className="font-display font-extrabold text-ink-900 text-lg tabular-nums">{BRL(total)}</span>
            </div>
          </div>
        )}
      </div>
    </DashDrawer>
  );
}

Object.assign(window, { OrdersSection, OrderDetail, NewOrderDrawer });
