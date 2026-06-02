// ============================================================================
// SEÇÃO — PRODUTOS  (GET/POST/PUT/DELETE /products + variants + images)
//   Lista  ⇄  Página de cadastro/edição (full page no painel)
//   Produto: name, slug, description, basePrice, isActive, categoryId
//   Variação: name, sku, STOCK, additionalPrice, isActive   ← estoque aqui
// ============================================================================

function ProductsSection() {
  const D = window.DASH;
  const { CATEGORIES, catName, productStock, productPriceRange } = D;
  const [products, setProducts] = React.useState(D.PRODUCTS);
  const [search, setSearch] = React.useState("");
  const [cat, setCat] = React.useState("all");
  const [editing, setEditing] = React.useState(null); // produto sendo editado/criado → mostra a PÁGINA

  const filtered = products.filter((p) => {
    const matchC = cat === "all" || p.categoryId === cat;
    const q = search.toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.slug.includes(q);
    return matchC && matchQ;
  });

  const catOptions = [
    { value: "all", label: "Todas", count: products.length },
    ...CATEGORIES.map((c) => ({ value: c.id, label: c.name, count: products.filter((p) => p.categoryId === c.id).length })),
  ];

  const newProduct = () => setEditing({
    id: null, name: "", slug: "", description: "", basePrice: 0, isActive: true,
    categoryId: CATEGORIES[0].id, icon: "Package", accent: "from-brand-50 to-brand-100",
    images: [], variants: [{ id: "new-" + Date.now(), name: "Padrão", sku: "", stock: 0, additionalPrice: 0, isActive: true }],
  });

  const saveProduct = (prod) => {
    if (prod.id) setProducts((prev) => prev.map((p) => (p.id === prod.id ? prod : p)));
    else setProducts((prev) => [{ ...prod, id: "p" + (prev.length + 1) + "-" + Date.now() }, ...prev]);
    setEditing(null);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const deleteProduct = (id) => { setProducts((prev) => prev.filter((p) => p.id !== id)); setEditing(null); };
  const toggleActive = (id) => setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)));

  // ===== PÁGINA de cadastro/edição =====
  if (editing) {
    return (
      <ProductEditorPage
        product={editing}
        onCancel={() => { setEditing(null); window.scrollTo({ top: 0, behavior: "instant" }); }}
        onSave={saveProduct}
        onDelete={deleteProduct}
      />
    );
  }

  // ===== LISTA =====
  return (
    <React.Fragment>
      <PageHead title="Produtos" subtitle={`${products.length} produtos no catálogo`}>
        <Button icon="Plus" onClick={newProduct}>Novo produto</Button>
      </PageHead>

      <Toolbar search={search} setSearch={setSearch} placeholder="Buscar produto..." />
      <div className="mb-4"><FilterChips value={cat} onChange={setCat} options={catOptions} /></div>

      {filtered.length === 0 ? (
        <EmptyState icon="Package" title="Nenhum produto encontrado" desc="Crie seu primeiro produto ou ajuste a busca."
          action={<Button icon="Plus" onClick={newProduct}>Novo produto</Button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const stock = productStock(p);
            return (
              <Card key={p.id} className="overflow-hidden flex flex-col cursor-pointer" hoverable>
                <div className="flex gap-3 p-4" onClick={() => setEditing(p)}>
                  <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${p.accent} grid place-items-center shrink-0 relative`}>
                    <div className="absolute inset-0 dot-grid opacity-30 rounded-xl" />
                    <Icon name={p.icon} size={26} className="text-brand-700 relative" strokeWidth={1.6} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display font-semibold text-[15px] text-ink-900 leading-snug line-clamp-1">{p.name}</h4>
                      <KebabMenu items={[
                        { label: "Editar", icon: "Pencil", onClick: () => setEditing(p) },
                        { label: p.isActive ? "Desativar" : "Ativar", icon: p.isActive ? "EyeOff" : "Eye", onClick: () => toggleActive(p.id) },
                        { label: "Excluir", icon: "Trash2", danger: true, onClick: () => deleteProduct(p.id) },
                      ]} />
                    </div>
                    <div className="text-xs text-ink-500 mt-0.5">{catName(p.categoryId)}</div>
                    <div className="mt-1.5 font-display font-bold text-brand-700 tabular-nums">{productPriceRange(p)}</div>
                  </div>
                </div>
                <div className="px-4 py-3 border-t border-ink-100 flex items-center justify-between bg-ink-50/40" onClick={() => setEditing(p)}>
                  <div className="flex items-center gap-2 text-[12.5px] text-ink-500">
                    <Icon name="Layers" size={14} /> {p.variants.length} {p.variants.length === 1 ? "variação" : "variações"}
                    <span className="text-ink-300">·</span>
                    <span className={stock === 0 ? "text-red-600 font-medium" : stock <= 10 ? "text-amber-600 font-medium" : ""}>{stock} em estoque</span>
                  </div>
                  {p.isActive ? <Badge tone="success" size="sm">Ativo</Badge> : <Badge tone="neutral" size="sm">Inativo</Badge>}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </React.Fragment>
  );
}

// ============================================================================
// PÁGINA — Cadastro / edição de produto
// ============================================================================
function ProductEditorPage({ product, onCancel, onSave, onDelete }) {
  const { CATEGORIES, BRL, catName } = window.DASH;
  const [form, setForm] = React.useState(product);
  const isNew = !form.id;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
  const num = (v) => { const n = parseFloat(String(v).replace(",", ".")); return isNaN(n) ? 0 : n; };
  const int = (v) => { const n = parseInt(String(v).replace(/\D/g, ""), 10); return isNaN(n) ? 0 : n; };

  const setVariant = (id, k, v) => set("variants", form.variants.map((va) => (va.id === id ? { ...va, [k]: v } : va)));
  const addVariant = () => set("variants", [...form.variants, { id: "new-" + Date.now(), name: "", sku: "", stock: 0, additionalPrice: 0, isActive: true }]);
  const removeVariant = (id) => set("variants", form.variants.filter((va) => va.id !== id));

  const totalStock = form.variants.reduce((s, v) => s + num(v.stock), 0);
  const prices = form.variants.map((v) => num(form.basePrice) + num(v.additionalPrice));
  const priceRange = prices.length ? (Math.min(...prices) === Math.max(...prices) ? BRL(Math.min(...prices)) : `${BRL(Math.min(...prices))} – ${BRL(Math.max(...prices))}`) : "—";
  const canSave = form.name.trim() && form.variants.length > 0;

  return (
    <div className="screen-enter">
      {/* Cabeçalho / breadcrumb + ações */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onCancel} className="h-10 w-10 grid place-items-center rounded-lg border border-ink-200 text-ink-700 hover:bg-ink-50 transition-colors shrink-0">
            <Icon name="ArrowLeft" size={18} />
          </button>
          <div className="min-w-0">
            <div className="text-xs text-ink-500 flex items-center gap-1.5">
              <span>Produtos</span> <Icon name="ChevronRight" size={12} /> <span className="text-ink-700">{isNew ? "Novo" : "Editar"}</span>
            </div>
            <h1 className="font-display font-extrabold text-xl sm:text-2xl text-ink-900 tracking-tight truncate">
              {isNew ? "Novo produto" : (form.name || "Editar produto")}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && <Button variant="danger" icon="Trash2" onClick={() => onDelete(form.id)}>Excluir</Button>}
          <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button icon="Check" onClick={() => onSave(form)} className={canSave ? "" : "opacity-50 pointer-events-none"}>Salvar produto</Button>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* ===== Coluna principal ===== */}
        <div className="lg:col-span-2 space-y-5">
          {/* Informações */}
          <Card className="p-5 sm:p-6">
            <h2 className="font-display font-bold text-ink-900 mb-4">Informações</h2>
            <div className="space-y-4">
              <Field label="Nome do produto" required>
                <TextInput value={form.name} onChange={(v) => { set("name", v); if (isNew) set("slug", slugify(v)); }} placeholder="Ex: Pão Francês" />
              </Field>
              <Field label="Endereço (slug)" hint="Usado no link público do produto.">
                <TextInput value={form.slug} onChange={(v) => set("slug", slugify(v))} prefix="negocioexpress.com.br/p/" placeholder="pao-frances" />
              </Field>
              <Field label="Descrição">
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={4}
                  placeholder="Descreva o produto, ingredientes, diferenciais..."
                  className="w-full bg-white border border-ink-200 rounded-lg px-3 py-2.5 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 resize-none"
                />
              </Field>
              <Field label="Preço base (R$)" required hint="Preço da variação sem adicional.">
                <div className="max-w-[200px]"><TextInput value={form.basePrice} onChange={(v) => set("basePrice", num(v))} prefix="R$" placeholder="0,00" /></div>
              </Field>
            </div>
          </Card>

          {/* Imagens */}
          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-ink-900">Imagens</h2>
              <span className="text-xs text-ink-500">{form.images.length}/8</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => {
                const img = form.images[i];
                if (img) {
                  return (
                    <div key={i} className={`aspect-square rounded-xl border border-brand-300 bg-gradient-to-br ${form.accent} grid place-items-center relative group`}>
                      <Icon name={form.icon} size={26} className="text-brand-700" strokeWidth={1.6} />
                      {img.isCover && <span className="absolute top-1.5 left-1.5 text-[9px] font-bold bg-brand-600 text-white px-1.5 py-0.5 rounded">Capa</span>}
                      <button onClick={() => set("images", form.images.filter((_, j) => j !== i))} className="absolute top-1.5 right-1.5 h-6 w-6 grid place-items-center rounded-md bg-white/90 text-ink-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Icon name="X" size={13} />
                      </button>
                    </div>
                  );
                }
                if (i === form.images.length) {
                  return (
                    <button key={i} onClick={() => set("images", [...form.images, { id: "img" + Date.now(), url: "", displayOrder: form.images.length, isCover: form.images.length === 0 }])}
                      className="aspect-square rounded-xl border-2 border-dashed border-ink-300 bg-ink-50 grid place-items-center text-ink-400 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50/50 transition-all">
                      <div className="flex flex-col items-center gap-1">
                        <Icon name="ImagePlus" size={20} />
                        <span className="text-[10px] font-medium">Adicionar</span>
                      </div>
                    </button>
                  );
                }
                return <div key={i} className="aspect-square rounded-xl border border-dashed border-ink-200 bg-ink-50/50" />;
              })}
            </div>
            <p className="mt-3 text-xs text-ink-500 font-mono">arraste imagens ou clique em adicionar · JPG/PNG até 5MB · a primeira é a capa</p>
          </Card>

          {/* Variações — estoque vive AQUI */}
          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-display font-bold text-ink-900">Variações</h2>
              <button onClick={addVariant} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50 px-2.5 py-1.5 rounded-lg transition-colors">
                <Icon name="Plus" size={15} /> Adicionar variação
              </button>
            </div>
            <p className="text-xs text-ink-500 mb-4">O estoque e o SKU são controlados por variação (ex.: Unidade, Dúzia, Tamanho).</p>

            <div className="space-y-3">
              {form.variants.map((v, idx) => (
                <div key={v.id} className="rounded-xl border border-ink-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Variação {idx + 1}</span>
                    <div className="flex items-center gap-3">
                      <Toggle checked={v.isActive} onChange={(val) => setVariant(v.id, "isActive", val)} size="sm" label={v.isActive ? "Ativa" : "Inativa"} />
                      {form.variants.length > 1 && (
                        <button onClick={() => removeVariant(v.id)} className="h-7 w-7 grid place-items-center rounded-md text-ink-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Icon name="Trash2" size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <Field label="Nome"><TextInput value={v.name} onChange={(val) => setVariant(v.id, "name", val)} placeholder="Unidade" /></Field>
                    <Field label="SKU"><TextInput value={v.sku} onChange={(val) => setVariant(v.id, "sku", val)} placeholder="PF-UN" /></Field>
                    <Field label="Estoque"><TextInput value={v.stock} onChange={(val) => setVariant(v.id, "stock", int(val))} placeholder="0" /></Field>
                    <Field label="Preço adic."><TextInput value={v.additionalPrice} onChange={(val) => setVariant(v.id, "additionalPrice", num(val))} prefix="+R$" placeholder="0,00" /></Field>
                  </div>
                  <div className="text-[12px] text-ink-500 flex items-center justify-between pt-3 mt-3 border-t border-ink-100">
                    <span className="inline-flex items-center gap-1.5"><StockPill stock={num(v.stock)} /></span>
                    <span>Preço final: <span className="font-display font-semibold text-brand-700 tabular-nums">{BRL(num(form.basePrice) + num(v.additionalPrice))}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ===== Coluna lateral ===== */}
        <div className="space-y-5 lg:sticky lg:top-24">
          {/* Visibilidade */}
          <Card className="p-5 sm:p-6">
            <h2 className="font-display font-bold text-ink-900 mb-4">Organização</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-ink-200 bg-ink-50/40">
                <div>
                  <div className="text-sm font-medium text-ink-900">Produto ativo</div>
                  <div className="text-xs text-ink-500">{form.isActive ? "Visível na loja" : "Oculto da loja"}</div>
                </div>
                <Toggle checked={form.isActive} onChange={(val) => set("isActive", val)} />
              </div>
              <Field label="Categoria">
                <select
                  value={form.categoryId || ""}
                  onChange={(e) => set("categoryId", e.target.value)}
                  className="w-full bg-white border border-ink-200 rounded-lg px-3 py-2.5 text-sm text-ink-900 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                >
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
            </div>
          </Card>

          {/* Resumo */}
          <Card className="p-5 sm:p-6">
            <h2 className="font-display font-bold text-ink-900 mb-4">Resumo</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-ink-500">Variações</dt>
                <dd className="font-medium text-ink-900 tabular-nums">{form.variants.length}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-500">Estoque total</dt>
                <dd className={`font-medium tabular-nums ${totalStock === 0 ? "text-red-600" : "text-ink-900"}`}>{totalStock} un.</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-500">Faixa de preço</dt>
                <dd className="font-display font-semibold text-brand-700 tabular-nums">{priceRange}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-500">Categoria</dt>
                <dd className="font-medium text-ink-900">{catName(form.categoryId)}</dd>
              </div>
            </dl>
          </Card>

          {/* Ação (mobile, fora da sticky desktop) */}
          <Button fullWidth size="lg" icon="Check" onClick={() => onSave(form)} className={`lg:hidden ${canSave ? "" : "opacity-50 pointer-events-none"}`}>
            Salvar produto
          </Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ProductsSection, ProductEditorPage });
