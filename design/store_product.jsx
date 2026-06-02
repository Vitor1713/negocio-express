// ============================================================================
// LOJA — Detalhe do produto (GET /stores/{slug}/products/{productSlug})
//   variants[{name, additionalPrice, finalPrice, stock}], images, description,
//   averageRating, reviews[{rating, comment, createdAt}]
// ============================================================================

const storeBRL2 = (n) => "R$ " + Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ---------- Estrelas ---------------------------------------------------------
function StarRating({ value = 0, size = 14, showValue = false, count }) {
  const full = Math.round(value);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Icon key={i} name="Star" size={size} strokeWidth={2.5}
            className={i <= full ? "text-amber-500" : "text-ink-200"} />
        ))}
      </span>
      {showValue && value != null && <span className="text-ink-900 font-semibold text-sm tabular-nums">{value.toFixed(1)}</span>}
      {typeof count === "number" && <span className="text-ink-500 text-xs">({count})</span>}
    </span>
  );
}

// ---------- Modal de detalhe -------------------------------------------------
function ProductDetailModal({ product, onClose, onAdd, cartQtyForVariant }) {
  if (!product) return null;
  const { fmtDate } = window.DASH;
  const variants = product.variants.filter((v) => v.isActive);
  const [variantId, setVariantId] = React.useState((variants.find((v) => v.stock > 0) || variants[0]).id);
  const [qty, setQty] = React.useState(1);
  const [imgIdx, setImgIdx] = React.useState(0);

  const selected = variants.find((v) => v.id === variantId);
  const finalPrice = product.basePrice + selected.additionalPrice;
  const inCart = cartQtyForVariant ? cartQtyForVariant(variantId) : 0;
  const maxQty = Math.max(0, selected.stock - inCart);
  const canAdd = selected.stock > 0 && qty <= maxQty;

  React.useEffect(() => { setQty(1); }, [variantId]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-enter" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto scroll-thin modal-enter rounded-t-2xl">
        {/* fechar */}
        <button onClick={onClose} className="absolute top-3 right-3 z-10 h-9 w-9 grid place-items-center rounded-full bg-white/90 backdrop-blur text-ink-600 hover:text-ink-900 shadow-soft">
          <Icon name="X" size={18} />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Galeria */}
          <div className="p-5 sm:p-6">
            <div className={`relative aspect-square rounded-xl bg-gradient-to-br ${product.accent} grid place-items-center overflow-hidden`}>
              <div className="absolute inset-0 dot-grid opacity-40" />
              <span className="relative h-28 w-28 rounded-3xl bg-white/70 backdrop-blur-sm grid place-items-center shadow-soft">
                <Icon name={product.icon} size={52} className="text-brand-700" strokeWidth={1.4} />
              </span>
              {product.averageRating && (
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-full px-2.5 py-1 shadow-soft">
                  <StarRating value={product.averageRating} size={12} showValue />
                </div>
              )}
            </div>
            {/* thumbnails (placeholder) */}
            <div className="mt-3 grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`aspect-square rounded-lg bg-gradient-to-br ${product.accent} grid place-items-center border-2 transition-all ${imgIdx === i ? "border-brand-600" : "border-transparent opacity-60 hover:opacity-100"}`}>
                  <Icon name={product.icon} size={18} className="text-brand-700" strokeWidth={1.6} />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="p-5 sm:p-6 sm:pl-0 flex flex-col">
            <div className="text-xs text-brand-700 font-medium uppercase tracking-wide">{window.DASH.catName(product.categoryId)}</div>
            <h2 className="mt-1 font-display font-extrabold text-2xl text-ink-900 tracking-tight">{product.name}</h2>
            {product.averageRating != null && (
              <div className="mt-1.5"><StarRating value={product.averageRating} size={15} showValue count={product.reviewCount} /></div>
            )}
            <p className="mt-3 text-sm text-ink-600 leading-relaxed">{product.description}</p>

            {/* preço */}
            <div className="mt-4 font-display font-extrabold text-3xl text-brand-700 tabular-nums">{storeBRL2(finalPrice)}</div>

            {/* variações */}
            {variants.length > 1 && (
              <div className="mt-4">
                <div className="text-sm font-medium text-ink-700 mb-2">Escolha a opção</div>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const out = v.stock === 0;
                    const active = v.id === variantId;
                    return (
                      <button key={v.id} disabled={out} onClick={() => setVariantId(v.id)}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all
                          ${active ? "border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-100"
                            : out ? "border-ink-200 text-ink-300 line-through cursor-not-allowed"
                            : "border-ink-200 text-ink-700 hover:bg-ink-50"}`}>
                        {v.name}
                        <span className={`ml-1.5 text-xs ${active ? "text-brand-600" : "text-ink-400"}`}>{storeBRL2(product.basePrice + v.additionalPrice)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* estoque */}
            <div className="mt-3 text-xs">
              {selected.stock === 0 ? (
                <span className="text-red-600 font-medium inline-flex items-center gap-1"><Icon name="XCircle" size={13} /> Esgotado</span>
              ) : selected.stock <= 5 ? (
                <span className="text-amber-600 font-medium inline-flex items-center gap-1"><Icon name="AlertCircle" size={13} /> Últimas {selected.stock} unidades</span>
              ) : (
                <span className="text-brand-700 font-medium inline-flex items-center gap-1"><Icon name="Check" size={13} /> Em estoque</span>
              )}
            </div>

            {/* qty + add */}
            <div className="mt-auto pt-5 flex items-center gap-3">
              <div className="inline-flex items-center border border-ink-200 rounded-lg overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-11 w-11 grid place-items-center hover:bg-ink-100 text-ink-700"><Icon name="Minus" size={16} /></button>
                <span className="w-10 text-center font-semibold tabular-nums">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(maxQty || 1, q + 1))} className="h-11 w-11 grid place-items-center hover:bg-ink-100 text-ink-700"><Icon name="Plus" size={16} /></button>
              </div>
              <button onClick={() => { onAdd(variantId, qty); onClose(); }} disabled={!canAdd}
                className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition-all disabled:bg-ink-300 disabled:cursor-not-allowed">
                <Icon name="ShoppingCart" size={18} /> Adicionar · {storeBRL2(finalPrice * qty)}
              </button>
            </div>
          </div>
        </div>

        {/* Avaliações */}
        <div className="border-t border-ink-200 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-ink-900">Avaliações</h3>
            {product.averageRating != null && <StarRating value={product.averageRating} size={15} showValue count={product.reviewCount} />}
          </div>
          {product.reviews.length === 0 ? (
            <p className="text-sm text-ink-500">Este produto ainda não tem avaliações.</p>
          ) : (
            <div className="space-y-3">
              {product.reviews.map((r, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl border border-ink-200">
                  <Avatar name={r.author} size="sm" tone="brand" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13.5px] font-medium text-ink-900">{r.author}</span>
                      <span className="text-[11.5px] text-ink-400">{fmtDate(r.createdAt)}</span>
                    </div>
                    <div className="mt-0.5"><StarRating value={r.rating} size={12} /></div>
                    {r.comment && <p className="mt-1 text-[13px] text-ink-600 leading-snug">{r.comment}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { StarRating, ProductDetailModal, storeBRL2 });
