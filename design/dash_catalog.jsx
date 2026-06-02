// ============================================================================
// SEÇÕES — CATEGORIAS e CUPONS
//   Category: name, slug, displayOrder, isActive
//   Coupon: code, discountType, discountValue, minOrderAmount, maxUses,
//           usedCount, validFrom, validUntil, isActive
// ============================================================================

// ----------------------------------------------------------------------------
// CATEGORIAS
// ----------------------------------------------------------------------------
function CategoriesSection() {
  const D = window.DASH;
  const [cats, setCats] = React.useState(D.CATEGORIES);
  const [editing, setEditing] = React.useState(null);
  const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");

  const newCat = () => setEditing({ id: null, name: "", slug: "", displayOrder: cats.length + 1, isActive: true });
  const save = (c) => {
    if (c.id) setCats((p) => p.map((x) => (x.id === c.id ? c : x)));
    else setCats((p) => [...p, { ...c, id: "c" + Date.now() }]);
    setEditing(null);
  };
  const del = (id) => { setCats((p) => p.filter((x) => x.id !== id)); setEditing(null); };
  const toggle = (id) => setCats((p) => p.map((x) => (x.id === id ? { ...x, isActive: !x.isActive } : x)));

  return (
    <React.Fragment>
      <PageHead title="Categorias" subtitle={`${cats.length} categorias`}>
        <Button icon="Plus" onClick={newCat}>Nova categoria</Button>
      </PageHead>

      <Card className="overflow-hidden">
        <div className="divide-y divide-ink-100">
          {cats.sort((a, b) => a.displayOrder - b.displayOrder).map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-ink-50 transition-colors">
              <span className="h-8 w-8 rounded-lg bg-ink-100 text-ink-500 grid place-items-center text-xs font-bold tabular-nums shrink-0">{c.displayOrder}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium text-ink-900 truncate">{c.name}</div>
                <div className="text-xs text-ink-500 font-mono">/{c.slug}</div>
              </div>
              {c.isActive ? <Badge tone="success" size="sm">Ativa</Badge> : <Badge tone="neutral" size="sm">Inativa</Badge>}
              <KebabMenu items={[
                { label: "Editar", icon: "Pencil", onClick: () => setEditing(c) },
                { label: c.isActive ? "Desativar" : "Ativar", icon: c.isActive ? "EyeOff" : "Eye", onClick: () => toggle(c.id) },
                { label: "Excluir", icon: "Trash2", danger: true, onClick: () => del(c.id) },
              ]} />
            </div>
          ))}
        </div>
      </Card>

      <DashDrawer
        open={!!editing} onClose={() => setEditing(null)} icon="Tags"
        title={editing && editing.id ? "Editar categoria" : "Nova categoria"}
        footer={editing && (
          <div className="flex gap-2">
            {editing.id && <Button variant="danger" icon="Trash2" onClick={() => del(editing.id)}>Excluir</Button>}
            <Button fullWidth icon="Check" onClick={() => save(editing)}>Salvar</Button>
          </div>
        )}
      >
        {editing && (
          <div className="p-5 space-y-4">
            <Field label="Nome" required><TextInput value={editing.name} onChange={(v) => setEditing((e) => ({ ...e, name: v, slug: e.id ? e.slug : slugify(v) }))} placeholder="Ex: Pães" /></Field>
            <Field label="Slug"><TextInput value={editing.slug} onChange={(v) => setEditing((e) => ({ ...e, slug: slugify(v) }))} prefix="/" placeholder="paes" /></Field>
            <Field label="Ordem de exibição"><TextInput value={editing.displayOrder} onChange={(v) => setEditing((e) => ({ ...e, displayOrder: parseInt(v.replace(/\D/g, ""), 10) || 0 }))} placeholder="1" /></Field>
            <div className="flex items-center justify-between p-3 rounded-lg border border-ink-200 bg-ink-50/40">
              <div className="text-sm font-medium text-ink-900">Categoria ativa</div>
              <Toggle checked={editing.isActive} onChange={(v) => setEditing((e) => ({ ...e, isActive: v }))} />
            </div>
          </div>
        )}
      </DashDrawer>
    </React.Fragment>
  );
}

// ----------------------------------------------------------------------------
// CUPONS
// ----------------------------------------------------------------------------
function CouponsSection() {
  const D = window.DASH;
  const { BRL, fmtDate, DISCOUNT_TYPE, couponValueLabel } = D;
  const [coupons, setCoupons] = React.useState(D.COUPONS);
  const [editing, setEditing] = React.useState(null);

  const newCoupon = () => setEditing({ id: null, code: "", discountType: "percentage", discountValue: 10, minOrderAmount: null, maxUses: null, usedCount: 0, validFrom: null, validUntil: null, isActive: true });
  const save = (c) => {
    if (c.id) setCoupons((p) => p.map((x) => (x.id === c.id ? c : x)));
    else setCoupons((p) => [{ ...c, id: "cp" + Date.now() }, ...p]);
    setEditing(null);
  };
  const del = (id) => { setCoupons((p) => p.filter((x) => x.id !== id)); setEditing(null); };
  const toggle = (id) => setCoupons((p) => p.map((x) => (x.id === id ? { ...x, isActive: !x.isActive } : x)));

  const usagePct = (c) => (c.maxUses ? Math.min(100, Math.round((c.usedCount / c.maxUses) * 100)) : null);

  return (
    <React.Fragment>
      <PageHead title="Cupons" subtitle={`${coupons.filter((c) => c.isActive).length} ativos de ${coupons.length}`}>
        <Button icon="Plus" onClick={newCoupon}>Novo cupom</Button>
      </PageHead>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {coupons.map((c) => {
          const pct = usagePct(c);
          const exhausted = c.maxUses && c.usedCount >= c.maxUses;
          return (
            <Card key={c.id} className="p-5 flex flex-col" hoverable>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`h-10 w-10 rounded-xl grid place-items-center shrink-0 ${c.isActive && !exhausted ? "bg-brand-100 text-brand-700" : "bg-ink-100 text-ink-400"}`}>
                    <Icon name="Ticket" size={20} />
                  </span>
                  <div className="min-w-0">
                    <div className="font-mono font-bold text-ink-900 truncate">{c.code}</div>
                    <div className="text-xs text-ink-500">{DISCOUNT_TYPE[c.discountType].label}</div>
                  </div>
                </div>
                <KebabMenu items={[
                  { label: "Editar", icon: "Pencil", onClick: () => setEditing(c) },
                  { label: c.isActive ? "Desativar" : "Ativar", icon: c.isActive ? "EyeOff" : "Eye", onClick: () => toggle(c.id) },
                  { label: "Excluir", icon: "Trash2", danger: true, onClick: () => del(c.id) },
                ]} />
              </div>

              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="font-display font-extrabold text-2xl text-brand-700 tabular-nums">{couponValueLabel(c)}</span>
                <span className="text-sm text-ink-500">de desconto</span>
              </div>

              <div className="mt-3 space-y-1 text-[12.5px] text-ink-500">
                {c.minOrderAmount != null && <div className="flex items-center gap-1.5"><Icon name="ShoppingCart" size={13} /> Pedido mín. {BRL(c.minOrderAmount)}</div>}
                <div className="flex items-center gap-1.5"><Icon name="Calendar" size={13} /> {c.validUntil ? `Válido até ${fmtDate(c.validUntil)}` : "Sem prazo de validade"}</div>
              </div>

              {/* uso */}
              <div className="mt-4 pt-3 border-t border-ink-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-ink-500">Usos</span>
                  <span className="font-medium text-ink-900 tabular-nums">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : " · ilimitado"}</span>
                </div>
                {pct != null && (
                  <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${exhausted ? "bg-red-400" : "bg-brand-500"}`} style={{ width: pct + "%" }} />
                  </div>
                )}
                <div className="mt-2">
                  {exhausted ? <Badge tone="danger" size="sm">Esgotado</Badge> : c.isActive ? <Badge tone="success" size="sm" dot>Ativo</Badge> : <Badge tone="neutral" size="sm">Inativo</Badge>}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <DashDrawer
        open={!!editing} onClose={() => setEditing(null)} icon="Ticket"
        title={editing && editing.id ? "Editar cupom" : "Novo cupom"}
        width={460}
        footer={editing && (
          <div className="flex gap-2">
            {editing.id && <Button variant="danger" icon="Trash2" onClick={() => del(editing.id)}>Excluir</Button>}
            <Button fullWidth icon="Check" onClick={() => save(editing)}>Salvar cupom</Button>
          </div>
        )}
      >
        {editing && <CouponForm coupon={editing} setCoupon={setEditing} />}
      </DashDrawer>
    </React.Fragment>
  );
}

function CouponForm({ coupon, setCoupon }) {
  const { DISCOUNT_TYPE } = window.DASH;
  const set = (k, v) => setCoupon((c) => ({ ...c, [k]: v }));
  const num = (v) => { const n = parseFloat(String(v).replace(",", ".")); return isNaN(n) ? 0 : n; };
  const intOrNull = (v) => { const s = String(v).replace(/\D/g, ""); return s === "" ? null : parseInt(s, 10); };

  return (
    <div className="p-5 space-y-4">
      <Field label="Código" required>
        <TextInput value={coupon.code} onChange={(v) => set("code", v.toUpperCase().replace(/\s/g, ""))} placeholder="BOMDIA10" />
      </Field>

      <Field label="Tipo de desconto">
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(DISCOUNT_TYPE).map(([key, t]) => (
            <button key={key} onClick={() => set("discountType", key)}
              className={`py-2.5 rounded-lg border text-sm font-medium transition-all ${coupon.discountType === key ? "border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-100" : "border-ink-200 text-ink-700 hover:bg-ink-50"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label={coupon.discountType === "percentage" ? "Desconto (%)" : "Desconto (R$)"} required>
          <TextInput value={coupon.discountValue} onChange={(v) => set("discountValue", num(v))} prefix={coupon.discountType === "percentage" ? "%" : "R$"} placeholder="10" />
        </Field>
        <Field label="Pedido mínimo (R$)">
          <TextInput value={coupon.minOrderAmount ?? ""} onChange={(v) => set("minOrderAmount", v === "" ? null : num(v))} prefix="R$" placeholder="Opcional" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Limite de usos" hint="Vazio = ilimitado">
          <TextInput value={coupon.maxUses ?? ""} onChange={(v) => set("maxUses", intOrNull(v))} placeholder="Ilimitado" />
        </Field>
        <Field label="Válido até">
          <input type="date" value={coupon.validUntil ? coupon.validUntil.slice(0, 10) : ""} onChange={(e) => set("validUntil", e.target.value ? e.target.value + "T23:59:00" : null)}
            className="w-full bg-white border border-ink-200 rounded-lg px-3 py-2.5 text-sm text-ink-900 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" />
        </Field>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg border border-ink-200 bg-ink-50/40">
        <div className="text-sm font-medium text-ink-900">Cupom ativo</div>
        <Toggle checked={coupon.isActive} onChange={(v) => set("isActive", v)} />
      </div>
    </div>
  );
}

Object.assign(window, { CategoriesSection, CouponsSection, CouponForm });
