// ============================================================================
// TELA 4 — LOJA VIRTUAL (VITRINE PÚBLICA)
//   Consome o catálogo real (DASH): produtos com variações (preço/estoque),
//   avaliações e categorias. Carrinho é baseado em productVariantId.
// ============================================================================

function StoreScreen({ onNavigate }) {
  const { PRODUCTS, CATEGORIES, COUPONS, findVariant } = window.DASH;
  const BRL = window.storeBRL2;

  const cats = [{ id: "all", name: "Todos" }, ...CATEGORIES.filter((c) => c.isActive)];
  const [cat, setCat] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [cart, setCart] = React.useState({ v1: 4, v6: 1 }); // { variantId: qty }
  const [view, setView] = React.useState("catalog"); // catalog | cart
  const openCart = () => { setView("cart"); window.scrollTo({ top: 0, behavior: "instant" }); };
  const closeCart = () => { setView("catalog"); window.scrollTo({ top: 0, behavior: "instant" }); };
  const [detail, setDetail] = React.useState(null);
  const [couponCode, setCouponCode] = React.useState("");
  const [appliedCoupon, setAppliedCoupon] = React.useState(null);
  const [flash, setFlash] = React.useState(null);

  const products = PRODUCTS.filter((p) => p.isActive);
  const filtered = products.filter((p) => {
    const matchCat = cat === "all" || p.categoryId === cat;
    const q = search.toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const cartItems = React.useMemo(() => {
    return Object.entries(cart).filter(([, q]) => q > 0).map(([variantId, qty]) => {
      const fv = findVariant(variantId);
      if (!fv) return null;
      return {
        variantId, qty, finalPrice: fv.finalPrice, stock: fv.variant.stock,
        productName: fv.product.name, variantName: fv.variant.name, icon: fv.product.icon, accent: fv.product.accent,
      };
    }).filter(Boolean);
  }, [cart]);

  const cartCount = cartItems.reduce((s, it) => s + it.qty, 0);
  const cartSubtotal = cartItems.reduce((s, it) => s + it.finalPrice * it.qty, 0);

  const qtyForVariant = (variantId) => cart[variantId] || 0;

  const addVariant = (variantId, qty = 1) => {
    const fv = findVariant(variantId);
    if (!fv) return;
    setCart((c) => {
      const next = Math.min(fv.variant.stock, (c[variantId] || 0) + qty);
      return { ...c, [variantId]: next };
    });
    setFlash(fv.product.name);
    setTimeout(() => setFlash(null), 1400);
  };
  const setQty = (variantId, qty) => setCart((c) => {
    const next = { ...c };
    if (qty <= 0) delete next[variantId]; else next[variantId] = qty;
    return next;
  });
  const clearCart = () => { setCart({}); setAppliedCoupon(null); setCouponCode(""); };

  // Adicionar rápido: 1 variação → direto; várias → abre detalhe
  const quickAdd = (product) => {
    const sellable = product.variants.filter((v) => v.isActive && v.stock > 0);
    if (sellable.length === 1) addVariant(sellable[0].id, 1);
    else setDetail(product);
  };

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    const found = COUPONS.find((c) => c.code === code && c.isActive && (!c.maxUses || c.usedCount < c.maxUses));
    if (found && (found.minOrderAmount == null || cartSubtotal >= found.minOrderAmount)) setAppliedCoupon(found);
    else setAppliedCoupon("invalid");
  };

  // ===== Página de checkout (rota separada dentro da loja) =====
  if (view === "cart") {
    return (
      <CartPage
        items={cartItems}
        onSetQty={setQty}
        onClear={clearCart}
        onClose={closeCart}
        couponCode={couponCode}
        setCouponCode={setCouponCode}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={applyCoupon}
        onOrderPlaced={() => {}}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-ink-50/60 screen-enter">
      {/* ---------- Header ---------- */}
      <header className="sticky top-0 z-30 bg-white border-b border-ink-200">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-3.5 flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center shadow-soft"><Icon name="Wheat" size={20} /></span>
            <div className="hidden sm:block">
              <div className="font-display font-extrabold text-[15px] text-ink-900 leading-tight">Padaria do João</div>
              <div className="text-[11.5px] text-ink-500 flex items-center gap-1 leading-tight"><span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Aberta · Entrega 30–40 min</div>
            </div>
          </div>

          <div className="flex-1 max-w-xl mx-auto">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"><Icon name="Search" size={18} /></span>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar produtos..."
                className="w-full bg-ink-50 border border-ink-200 rounded-full pl-11 pr-4 py-2.5 text-[14px] placeholder-ink-400 focus:outline-none focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-all" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => onNavigate("DASHBOARD")} className="hidden md:inline-flex h-10 px-3 items-center gap-1.5 text-[13px] text-ink-700 rounded-lg hover:bg-ink-100 transition-colors" title="Voltar ao painel">
              <Icon name="LayoutDashboard" size={16} /> Painel
            </button>
            <button onClick={openCart} className="h-10 px-3 inline-flex items-center gap-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors relative">
              <Icon name="ShoppingCart" size={18} />
              <span className="hidden sm:inline text-sm font-medium tabular-nums">{cartCount > 0 ? BRL(cartSubtotal) : "Carrinho"}</span>
              {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 grid place-items-center rounded-full bg-white text-brand-700 text-[11px] font-bold border-2 border-brand-600">{cartCount}</span>}
            </button>
          </div>
        </div>

        {/* categorias */}
        <div className="border-t border-ink-100 bg-white">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-1.5 overflow-x-auto scroll-thin py-2.5">
              {cats.map((c) => (
                <button key={c.id} onClick={() => setCat(c.id)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all ${cat === c.id ? "bg-brand-600 text-white shadow-soft" : "bg-ink-100 text-ink-700 hover:bg-ink-200"}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ---------- Conteúdo ---------- */}
      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 py-6 space-y-7">
        {/* hero */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-600 to-brand-800 text-white p-7 sm:p-10">
          <div className="absolute inset-0 dot-grid opacity-60" />
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-xl" />
          <div className="relative max-w-xl">
            <Badge tone="success" size="sm"><Icon name="Zap" size={12} /> Oferta do dia</Badge>
            <h2 className="mt-3 font-display font-extrabold text-2xl sm:text-4xl leading-tight tracking-tight text-balance">Bolo + Café por <span className="underline decoration-white/40 decoration-4 underline-offset-4">R$ 24,90</span></h2>
            <p className="mt-2 text-brand-100 text-[15px]">A combinação perfeita pra começar o dia. Entrega em até 40 minutos.</p>
            <div className="mt-5 flex items-center gap-3 flex-wrap">
              <button onClick={() => { setCat("c2"); window.scrollTo({ top: 320, behavior: "smooth" }); }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-brand-700 font-semibold text-sm hover:bg-brand-50 transition-colors shadow-soft">Ver oferta <Icon name="ArrowRight" size={16} /></button>
              <div className="text-sm text-brand-100 inline-flex items-center gap-1.5"><Icon name="Clock" size={15} /> Entrega 30–40 min</div>
            </div>
          </div>
        </section>

        {/* grid */}
        <section>
          <div className="flex items-end justify-between mb-4">
            <div>
              <h3 className="font-display font-extrabold text-xl sm:text-2xl text-ink-900 tracking-tight">{cat === "all" ? "Todos os produtos" : (cats.find((c) => c.id === cat) || {}).name}</h3>
              <p className="text-sm text-ink-500 mt-0.5">{filtered.length} itens encontrados</p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white border border-ink-200 rounded-2xl p-12 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-ink-100 grid place-items-center text-ink-400 mb-3"><Icon name="SearchX" size={22} /></div>
              <p className="text-ink-700 font-medium">Nada encontrado para esta busca.</p>
              <p className="text-sm text-ink-500 mt-1">Tente outra categoria ou palavra-chave.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filtered.map((p) => (
                <StoreProductCard key={p.id} product={p} onOpen={() => setDetail(p)} onQuickAdd={() => quickAdd(p)} qtyInCart={p.variants.reduce((s, v) => s + (cart[v.id] || 0), 0)} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-ink-200 bg-white mt-10">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-3">
            <span className="h-11 w-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center shadow-soft"><Icon name="Wheat" size={20} /></span>
            <div>
              <div className="font-display font-extrabold text-ink-900">Padaria do João</div>
              <div className="text-[13px] text-ink-500 mt-0.5 flex items-center gap-1.5"><Icon name="MapPin" size={13} /> Rua das Flores, 245 — Vila Mariana, SP</div>
              <div className="text-[13px] text-ink-500 mt-0.5 flex items-center gap-1.5"><Icon name="Clock" size={13} /> Seg–Sáb · 06h às 20h</div>
            </div>
          </div>
          <div className="text-xs text-ink-400 inline-flex items-center gap-1.5">Powered by <span className="text-ink-700 font-display font-semibold">Negócio Express</span></div>
        </div>
      </footer>

      {/* toast */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${flash ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}`}>
        <div className="bg-ink-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-pop inline-flex items-center gap-2">
          <span className="h-5 w-5 rounded-full bg-brand-500 grid place-items-center"><Icon name="Check" size={13} strokeWidth={3} /></span>
          {flash} adicionado
        </div>
      </div>

      {/* detalhe do produto */}
      <ProductDetailModal product={detail} onClose={() => setDetail(null)} onAdd={addVariant} cartQtyForVariant={qtyForVariant} />
    </div>
  );
}

// ---------- Card de produto --------------------------------------------------
function StoreProductCard({ product, onOpen, onQuickAdd, qtyInCart }) {
  const BRL = window.storeBRL2;
  const prices = product.variants.filter((v) => v.isActive).map((v) => product.basePrice + v.additionalPrice);
  const minPrice = Math.min(...prices);
  const multi = product.variants.filter((v) => v.isActive).length > 1;
  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
  const out = totalStock === 0;
  const popular = product.reviewCount >= 3 && product.averageRating >= 4.8;

  return (
    <div className="bg-white border border-ink-200 rounded-xl shadow-soft overflow-hidden flex flex-col group transition-all hover:border-ink-300 hover:shadow-pop">
      <button onClick={onOpen} className="relative aspect-[5/4] bg-gradient-to-br block w-full overflow-hidden" style={{ backgroundImage: undefined }}>
        <div className={`absolute inset-0 bg-gradient-to-br ${product.accent}`} />
        <div className="absolute inset-0 dot-grid opacity-40" />
        <span className="relative h-16 w-16 sm:h-20 sm:w-20 mx-auto my-auto rounded-2xl bg-white/70 backdrop-blur-sm grid place-items-center shadow-soft transition-transform duration-300 group-hover:scale-105 top-1/2 -translate-y-1/2">
          <Icon name={product.icon} size={32} className="text-brand-700" strokeWidth={1.6} />
        </span>
        {popular && <div className="absolute top-3 left-3"><Badge tone="warning"><Icon name="Flame" size={11} /> Popular</Badge></div>}
        {out && <div className="absolute inset-0 bg-white/60 grid place-items-center"><Badge tone="danger">Esgotado</Badge></div>}
      </button>

      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <button onClick={onOpen} className="text-left">
          <h4 className="font-display font-semibold text-[14px] sm:text-[15px] text-ink-900 leading-snug line-clamp-2">{product.name}</h4>
        </button>
        {product.averageRating != null && (
          <div className="mt-1.5"><StarRating value={product.averageRating} size={13} count={product.reviewCount} /></div>
        )}
        <div className="mt-2 flex items-baseline gap-1.5">
          {multi && <span className="text-[11px] text-ink-500">a partir de</span>}
          <span className="font-display font-extrabold text-brand-700 text-lg sm:text-xl tabular-nums">{BRL(minPrice)}</span>
        </div>

        <div className="mt-3 sm:mt-4 pt-1">
          <button onClick={onQuickAdd} disabled={out}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg border border-brand-600 text-brand-700 font-semibold text-sm transition-all hover:bg-brand-600 hover:text-white hover:shadow-pop disabled:border-ink-200 disabled:text-ink-300 disabled:cursor-not-allowed disabled:hover:bg-white">
            <Icon name={multi ? "Settings2" : "Plus"} size={16} /> {multi ? "Escolher opção" : "Adicionar"}
            {qtyInCart > 0 && <span className="ml-1 h-5 min-w-[20px] px-1 grid place-items-center rounded-full bg-brand-100 text-brand-700 text-[11px] font-bold">{qtyInCart}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

window.StoreScreen = StoreScreen;
window.StoreProductCard = StoreProductCard;
