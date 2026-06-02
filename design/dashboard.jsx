// ============================================================================
// TELA 3 — DASHBOARD DO LOJISTA  (shell mobile-first + roteador de seções)
//   Navegação interna mapeada 1:1 aos recursos da API:
//   Início · Pedidos · Produtos · Categorias · Cupons · Entregadores ·
//   Equipe · Configurações da loja
// ============================================================================

const DASH_NAV = [
  { key: "inicio",        label: "Início",        icon: "LayoutDashboard" },
  { key: "pedidos",       label: "Pedidos",       icon: "ShoppingBag" },
  { key: "produtos",      label: "Produtos",      icon: "Package" },
  { key: "categorias",    label: "Categorias",    icon: "Tags" },
  { key: "cupons",        label: "Cupons",        icon: "Ticket" },
  { key: "entregadores",  label: "Entregadores",  icon: "Bike" },
  { key: "equipe",        label: "Equipe",        icon: "Users" },
  { key: "configuracoes", label: "Configurações", icon: "Settings" },
];

const DASH_SECTIONS = {
  inicio:        "OverviewSection",
  pedidos:       "OrdersSection",
  produtos:      "ProductsSection",
  categorias:    "CategoriesSection",
  cupons:        "CouponsSection",
  entregadores:  "DeliverersSection",
  equipe:        "TeamSection",
  configuracoes: "SettingsSection",
};

function DashboardScreen({ onNavigate }) {
  const [section, setSection] = React.useState("inicio");
  const [mobileNav, setMobileNav] = React.useState(false);
  const { STORE } = window.DASH;
  // Estado de pedidos elevado aqui: criar uma "Nova venda" reflete no Início e em Pedidos.
  const [orders, setOrders] = React.useState(window.DASH.ORDERS);
  const [intent, setIntent] = React.useState(null); // ex.: "new-order"

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const go = (key) => { setSection(key); setMobileNav(false); window.scrollTo({ top: 0, behavior: "instant" }); };
  const startNewSale = () => { setSection("pedidos"); setMobileNav(false); setIntent("new-order"); window.scrollTo({ top: 0, behavior: "instant" }); };

  const ActiveSection = window[DASH_SECTIONS[section]] || OverviewSection;
  const sectionProps = { go, onNavigate, orders, setOrders, intent, setIntent, startNewSale };
  const activeLabel = (DASH_NAV.find((n) => n.key === section) || {}).label;

  const SidebarInner = (
    <React.Fragment>
      <div className="px-5 pt-6 pb-5 flex items-center justify-between">
        <Logo size="sm" />
        <button onClick={() => setMobileNav(false)} className="lg:hidden h-8 w-8 grid place-items-center rounded-lg text-ink-500 hover:bg-ink-100">
          <Icon name="X" size={18} />
        </button>
      </div>

      <div className="mx-3 mb-4 px-3 py-3 rounded-xl bg-white border border-ink-200 shadow-soft">
        <div className="flex items-center gap-2.5">
          <Avatar name="João Almeida" size="md" tone="brand" />
          <div className="min-w-0">
            <div className="text-[13px] text-ink-500 leading-tight">Olá, João 👋</div>
            <div className="text-[13px] font-display font-semibold text-ink-900 truncate leading-tight mt-0.5">{STORE.name}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto scroll-thin">
        {DASH_NAV.map((item) => {
          const isActive = item.key === section;
          return (
            <button
              key={item.key}
              onClick={() => go(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors text-left
                ${isActive ? "bg-brand-100 text-brand-800 font-semibold" : "text-ink-700 hover:bg-ink-100 hover:text-ink-900"}`}
            >
              <Icon name={item.icon} size={18} className={isActive ? "text-brand-700" : "text-ink-500"} />
              <span className="flex-1">{item.label}</span>
              {item.key === "pedidos" && pendingCount > 0 && (
                <span className="text-[10.5px] font-bold px-1.5 py-0.5 rounded-md bg-brand-600 text-white">{pendingCount}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-3">
        <button
          onClick={() => onNavigate("STORE")}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] text-brand-700 hover:bg-brand-100 transition-colors"
        >
          <Icon name="ExternalLink" size={16} />
          <span className="font-medium">Ver minha loja</span>
        </button>
      </div>

      <div className="border-t border-ink-200 px-3 py-3 flex items-center gap-2.5">
        <Avatar name="João Almeida" size="sm" tone="brand" />
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-ink-900 truncate leading-tight">João Almeida</div>
          <div className="text-[11.5px] text-ink-500 truncate">Plano Pro</div>
        </div>
        <button onClick={() => onNavigate("LOGIN")} className="p-1.5 rounded-md text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors" aria-label="Sair">
          <Icon name="LogOut" size={16} />
        </button>
      </div>
    </React.Fragment>
  );

  return (
    <div className="min-h-screen w-full flex bg-white screen-enter">
      {/* ===== Sidebar desktop ===== */}
      <aside className="hidden lg:flex w-[240px] shrink-0 bg-ink-50 border-r border-ink-200 flex-col sticky top-0 h-screen">
        {SidebarInner}
      </aside>

      {/* ===== Sidebar mobile (overlay) ===== */}
      {mobileNav && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-enter" onClick={() => setMobileNav(false)} />
          <aside className="absolute left-0 top-0 h-full w-[260px] bg-ink-50 border-r border-ink-200 flex flex-col drawer-enter" style={{ animationName: "slideInRight", animationDirection: "reverse" }}>
            {SidebarInner}
          </aside>
        </div>
      )}

      {/* ===== Conteúdo ===== */}
      <main className="flex-1 min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-ink-200">
          <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <button onClick={() => setMobileNav(true)} className="lg:hidden h-9 w-9 grid place-items-center rounded-lg border border-ink-200 text-ink-700">
                <Icon name="Menu" size={18} />
              </button>
              <div className="lg:hidden"><Logo size="sm" showText={false} /></div>
              <span className="hidden sm:block text-sm text-ink-500 truncate">
                <span className="text-ink-900 font-medium">{STORE.name}</span>
                <span className="mx-2 text-ink-300">/</span>
                {activeLabel}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => onNavigate("STORE")} className="hidden sm:inline-flex h-9 px-3 items-center gap-1.5 text-[13px] text-ink-700 rounded-lg border border-ink-200 hover:bg-ink-50 transition-colors">
                <Icon name="ExternalLink" size={15} /> Ver loja
              </button>
              <button className="h-9 w-9 grid place-items-center rounded-lg border border-ink-200 text-ink-700 hover:bg-ink-50 transition-colors relative">
                <Icon name="Bell" size={17} />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-600 ring-2 ring-white" />
              </button>
              <Avatar name="João Almeida" size="sm" tone="brand" />
            </div>
          </div>
        </header>

        {/* Seção ativa */}
        <div className="p-4 sm:p-6 lg:p-8">
          <ActiveSection {...sectionProps} />
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// SEÇÃO — INÍCIO (visão geral)
// ============================================================================
function OverviewSection({ go, orders, startNewSale }) {
  const { PRODUCTS, BRL, ORDER_STATUS, DELIVERY_TYPE, fmtTime, LOW_STOCK, REVENUE_7D } = window.DASH;
  const ORDERS = orders || window.DASH.ORDERS;

  const metrics = React.useMemo(() => {
    const valid = ORDERS.filter((o) => o.status !== "cancelled");
    const faturamento = valid.reduce((s, o) => s + o.total, 0);
    const ticket = valid.length ? faturamento / valid.length : 0;
    const ativos = PRODUCTS.filter((p) => p.isActive).length;
    return {
      faturamento, pedidos: valid.length, ticket, ativos, totalProd: PRODUCTS.length,
    };
  }, [ORDERS, PRODUCTS]);

  const cards = [
    { label: "Faturamento hoje", value: BRL(metrics.faturamento), delta: "+12%", up: true, icon: "TrendingUp", bg: "bg-brand-100", fg: "text-brand-700" },
    { label: "Pedidos hoje", value: String(metrics.pedidos), delta: "+5", up: true, icon: "ShoppingBag", bg: "bg-blue-100", fg: "text-blue-700" },
    { label: "Ticket médio", value: BRL(metrics.ticket), delta: "-3%", up: false, icon: "CreditCard", bg: "bg-amber-100", fg: "text-amber-700" },
    { label: "Produtos ativos", value: `${metrics.ativos}/${metrics.totalProd}`, delta: "OK", up: true, icon: "Package", bg: "bg-purple-100", fg: "text-purple-700" },
  ];

  const recent = ORDERS.slice(0, 5);
  const orderNo = (o) => "#" + String(o.seq != null ? o.seq : o.id.replace(/\D/g, "")).padStart(4, "0");

  return (
    <React.Fragment>
      <PageHead title="Visão geral" subtitle="Segunda-feira, 1 de junho de 2026">
        <Button icon="Plus" onClick={startNewSale}>Nova venda</Button>
      </PageHead>

      {/* Métricas */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((m) => (
          <Card key={m.label} className="p-4 sm:p-5" hoverable>
            <div className="flex items-start justify-between">
              <div className={`h-10 w-10 rounded-lg ${m.bg} grid place-items-center`}>
                <Icon name={m.icon} size={18} className={m.fg} />
              </div>
              <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${m.up ? "text-brand-700" : "text-red-600"}`}>
                <Icon name={m.up ? "ArrowUpRight" : "ArrowDownRight"} size={13} /> {m.delta}
              </span>
            </div>
            <div className="mt-3 sm:mt-4">
              <div className="text-[13px] text-ink-500">{m.label}</div>
              <div className="mt-0.5 font-display font-extrabold text-xl sm:text-[26px] text-ink-900 tracking-tight leading-none">{m.value}</div>
            </div>
          </Card>
        ))}
      </section>

      {/* Chart + estoque baixo */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        <Card className="p-5 sm:p-6 xl:col-span-2">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-ink-900">Faturamento — 7 dias</h2>
              <p className="text-sm text-ink-500 mt-0.5">R$ 10.360,00 no período · <span className="text-brand-700 font-semibold">+18%</span></p>
            </div>
          </div>
          <div className="mt-4 h-[220px] sm:h-[260px] -ml-3">
            <RevenueChart data={REVENUE_7D} />
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-ink-900">Estoque baixo</h2>
              <p className="text-sm text-ink-500 mt-0.5">Variações com ≤ 5 unidades</p>
            </div>
            <button onClick={() => go("produtos")} className="text-xs font-medium text-brand-700 hover:underline shrink-0">Gerenciar</button>
          </div>
          <div className="mt-4 space-y-2.5">
            {LOW_STOCK.length === 0 ? (
              <p className="text-sm text-ink-500 py-4 text-center">Tudo abastecido 🎉</p>
            ) : LOW_STOCK.slice(0, 5).map((v) => (
              <div key={v.sku} className="flex items-center gap-3">
                <span className={`h-9 w-9 rounded-lg bg-gradient-to-br ${v.accent} grid place-items-center shrink-0`}>
                  <Icon name={v.icon} size={16} className="text-brand-700" strokeWidth={1.6} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-ink-900 truncate leading-tight">{v.product}</div>
                  <div className="text-[11.5px] text-ink-500 leading-tight">{v.variant} · {v.sku}</div>
                </div>
                <StockPill stock={v.stock} />
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Pedidos recentes */}
      <section className="mt-4">
        <Card className="overflow-hidden">
          <div className="p-5 sm:p-6 pb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-ink-900">Pedidos recentes</h2>
              <p className="text-sm text-ink-500 mt-0.5">Atualizado agora</p>
            </div>
            <button onClick={() => go("pedidos")} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 px-3 py-2 rounded-lg hover:bg-brand-50 transition-colors">
              Ver todos <Icon name="ArrowRight" size={14} />
            </button>
          </div>

          {/* Tabela (desktop) */}
          <div className="hidden md:block overflow-x-auto scroll-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink-500 border-y border-ink-200 bg-ink-50/60">
                  <th className="py-3 px-6 font-medium">Pedido</th>
                  <th className="py-3 px-6 font-medium">Cliente</th>
                  <th className="py-3 px-6 font-medium">Tipo</th>
                  <th className="py-3 px-6 font-medium">Total</th>
                  <th className="py-3 px-6 font-medium">Status</th>
                  <th className="py-3 px-6 font-medium">Hora</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => {
                  const st = ORDER_STATUS[o.status]; const dt = DELIVERY_TYPE[o.deliveryType];
                  return (
                    <tr key={o.id} className="border-b border-ink-100 last:border-0 hover:bg-brand-50/40 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-medium text-ink-900">{orderNo(o)}</td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={o.customerId} size="sm" tone="brand" />
                          <span className="font-medium text-ink-900">{o.customerId}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-ink-700"><span className="inline-flex items-center gap-1.5"><Icon name={dt.icon} size={14} className="text-ink-400" />{dt.label}</span></td>
                      <td className="py-3.5 px-6 font-display font-semibold text-ink-900 tabular-nums">{BRL(o.total)}</td>
                      <td className="py-3.5 px-6"><Badge tone={st.tone} dot>{st.label}</Badge></td>
                      <td className="py-3.5 px-6 text-ink-500 tabular-nums">{fmtTime(o.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards (mobile) */}
          <div className="md:hidden divide-y divide-ink-100">
            {recent.map((o) => {
              const st = ORDER_STATUS[o.status];
              return (
                <div key={o.id} className="px-4 py-3 flex items-center gap-3">
                  <Avatar name={o.customerId} size="sm" tone="brand" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-ink-900 truncate">{o.customerId}</div>
                    <div className="text-[11.5px] text-ink-500">{orderNo(o)} · {fmtTime(o.createdAt)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-semibold text-sm text-ink-900 tabular-nums">{BRL(o.total)}</div>
                    <Badge tone={st.tone} size="sm" dot>{st.label}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>
    </React.Fragment>
  );
}

// ---------- Chart ------------------------------------------------------------
function RevenueChart({ data }) {
  const { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } = window.Recharts;
  const { BRL } = window.DASH;
  const renderTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-white border border-ink-200 rounded-lg shadow-pop px-3 py-2 text-xs">
        <div className="text-ink-500">{label}</div>
        <div className="font-display font-bold text-ink-900 text-base mt-0.5 tabular-nums">{BRL(payload[0].value)}</div>
      </div>
    );
  };
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 10 }}>
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16A34A" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#16A34A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#F3F4F6" vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} stroke="#9CA3AF" tick={{ fontSize: 12, fontFamily: "DM Sans" }} dy={6} />
        <YAxis tickLine={false} axisLine={false} stroke="#9CA3AF" tick={{ fontSize: 12, fontFamily: "DM Sans" }} tickFormatter={(v) => "R$ " + (v / 1000).toFixed(1) + "k"} width={50} />
        <Tooltip content={renderTooltip} cursor={{ stroke: "#16A34A", strokeDasharray: "3 3", strokeOpacity: 0.5 }} />
        <Area type="monotone" dataKey="value" stroke="#16A34A" strokeWidth={2.5} fill="url(#revFill)" activeDot={{ r: 5, fill: "#16A34A", stroke: "#fff", strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

Object.assign(window, { DashboardScreen, OverviewSection, RevenueChart });
