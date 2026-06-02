// ============================================================================
// TELA — ESCOLHER PLANO  (Etapa 3 do cadastro)
//   Planos: Teste Grátis · Pro · Max  ·  cobrança mensal/anual
// ============================================================================

const PLANS = [
  {
    key: "free",
    name: "Teste Grátis",
    tagline: "Para começar a vender hoje mesmo.",
    icon: "Sparkles",
    priceMonthly: 0,
    priceAnnual: 0,
    trial: false,
    maxProducts: 30,
    maxUsers: 1,
    cta: "Começar grátis",
    highlight: false,
    features: [
      { text: "Loja online com até 30 produtos", on: true },
      { text: "Pedidos via WhatsApp", on: true },
      { text: "1 usuário", on: true },
      { text: "Relatórios básicos", on: true },
      { text: "Pagamentos online (Pix e cartão)", on: false },
      { text: "Domínio próprio", on: false },
    ],
    foot: "Selo “Powered by Negócio Express” na loja.",
  },
  {
    key: "pro",
    name: "Pro",
    tagline: "Para negócios em crescimento.",
    icon: "Rocket",
    priceMonthly: 49,
    priceAnnual: 39,
    trial: true,
    maxProducts: null,
    maxUsers: 3,
    cta: "Iniciar teste grátis",
    highlight: true,
    features: [
      { text: "Produtos ilimitados", on: true },
      { text: "Pagamentos online (Pix e cartão)", on: true },
      { text: "Cupons e promoções", on: true },
      { text: "Até 3 usuários", on: true },
      { text: "Relatórios avançados", on: true },
      { text: "Domínio próprio + sem marca", on: true },
    ],
    foot: "Tudo do Teste Grátis, sem limites.",
  },
  {
    key: "max",
    name: "Max",
    tagline: "Para operações e múltiplas lojas.",
    icon: "Crown",
    priceMonthly: 99,
    priceAnnual: 79,
    trial: true,
    maxProducts: null,
    maxUsers: null,
    cta: "Iniciar teste grátis",
    highlight: false,
    features: [
      { text: "Tudo do plano Pro", on: true },
      { text: "Usuários ilimitados", on: true },
      { text: "Múltiplas lojas (multiloja)", on: true },
      { text: "Integrações e API", on: true },
      { text: "Gerente de conta dedicado", on: true },
      { text: "Suporte prioritário 24/7", on: true },
    ],
    foot: "Para quem precisa de escala e integrações.",
  },
];

const limitLabel = (n, singular, plural) => (n == null ? `${plural} ilimitados` : `${n} ${n === 1 ? singular : plural}`);

function PlanScreen({ onNavigate }) {
  const [annual, setAnnual] = React.useState(true);
  const [selected, setSelected] = React.useState("pro");
  const [confirming, setConfirming] = React.useState(null); // plano em confirmação

  const fmt = (n) => (n === 0 ? "R$ 0" : "R$ " + n.toLocaleString("pt-BR"));

  return (
    <div className="min-h-screen w-full bg-white screen-enter">
      {/* Header */}
      <header className="w-full px-6 py-6 flex items-center justify-between">
        <a onClick={() => onNavigate("LOGIN")} className="cursor-pointer">
          <Logo size="md" />
        </a>
        <button
          onClick={() => onNavigate("REGISTER")}
          className="text-sm text-ink-500 hover:text-ink-900 transition-colors inline-flex items-center gap-1.5"
        >
          <Icon name="ArrowLeft" size={15} /> Voltar
        </button>
      </header>

      <main className="w-full px-6 pb-20">
        <div className="mx-auto max-w-[1040px] pt-4">
          {/* Step indicator */}
          <div className="max-w-[560px] mx-auto">
            <StepIndicator steps={["Dados pessoais", "Dados da loja", "Plano"]} current={3} />
          </div>

          {/* Título */}
          <div className="text-center mt-12">
            <h1 className="font-display font-extrabold text-[36px] leading-tight tracking-tight text-ink-900 text-balance">
              Escolha o plano ideal para o seu negócio
            </h1>
            <p className="mt-3 text-ink-500 text-[16px]">
              Comece grátis e faça upgrade quando quiser. Cancele a qualquer momento.
            </p>
          </div>

          {/* Toggle de cobrança */}
          <div className="mt-7 flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!annual ? "text-ink-900" : "text-ink-400"}`}>Mensal</span>
            <button
              onClick={() => setAnnual((a) => !a)}
              className={`relative h-7 w-12 rounded-full transition-colors ${annual ? "bg-brand-600" : "bg-ink-300"}`}
              aria-label="Alternar cobrança anual"
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${annual ? "left-6" : "left-1"}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? "text-ink-900" : "text-ink-400"}`}>
              Anual
            </span>
            <Badge tone="success" size="sm">Economize 20%</Badge>
          </div>

          {/* Cards de planos */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {PLANS.map((p) => {
              const price = annual ? p.priceAnnual : p.priceMonthly;
              const isSel = selected === p.key;
              return (
                <div
                  key={p.key}
                  onClick={() => setSelected(p.key)}
                  className={`relative flex flex-col rounded-2xl border bg-white p-7 cursor-pointer transition-all duration-200
                    ${p.highlight
                      ? "border-brand-600 shadow-pop md:-mt-3 md:mb-0"
                      : isSel ? "border-brand-400 shadow-soft" : "border-ink-200 shadow-soft hover:border-ink-300 hover:shadow-pop"}`}
                >
                  {p.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-600 text-white text-[11px] font-bold px-3 py-1 shadow-soft uppercase tracking-wide">
                        <Icon name="Star" size={11} strokeWidth={3} /> Mais popular
                      </span>
                    </div>
                  )}

                  {/* header do card */}
                  <div className="flex items-center gap-2.5">
                    <span className={`h-10 w-10 rounded-xl grid place-items-center ${
                      p.highlight ? "bg-brand-600 text-white" : "bg-brand-100 text-brand-700"
                    }`}>
                      <Icon name={p.icon} size={20} />
                    </span>
                    <div>
                      <div className="font-display font-extrabold text-lg text-ink-900 leading-none">{p.name}</div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-ink-500 leading-snug">{p.tagline}</p>

                  {/* preço */}
                  <div className="mt-5 flex items-end gap-1.5">
                    <span className="font-display font-extrabold text-[40px] leading-none tracking-tight text-ink-900">
                      {fmt(price)}
                    </span>
                    {price > 0 && <span className="text-ink-500 text-sm mb-1">/mês</span>}
                  </div>
                  <div className="mt-1 h-4 text-[12.5px] text-ink-400">
                    {price > 0 && annual ? `Cobrado anualmente (R$ ${price * 12}/ano)` : price > 0 ? "Cobrado mensalmente" : "Para sempre"}
                  </div>

                  {/* limites estruturados (Plan DTO) */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-ink-50 border border-ink-100 px-3 py-2">
                      <div className="text-[11px] text-ink-500">Produtos</div>
                      <div className="text-[13px] font-display font-semibold text-ink-900 flex items-center gap-1">
                        <Icon name="Package" size={13} className="text-brand-600" /> {p.maxProducts == null ? "Ilimitado" : `Até ${p.maxProducts}`}
                      </div>
                    </div>
                    <div className="rounded-lg bg-ink-50 border border-ink-100 px-3 py-2">
                      <div className="text-[11px] text-ink-500">Usuários</div>
                      <div className="text-[13px] font-display font-semibold text-ink-900 flex items-center gap-1">
                        <Icon name="Users" size={13} className="text-brand-600" /> {limitLabel(p.maxUsers, "usuário", "usuários")}
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelected(p.key); setConfirming(p); }}
                    className={`mt-4 w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-[15px] transition-all
                      ${p.highlight
                        ? "bg-brand-600 text-white hover:bg-brand-700 hover:-translate-y-px hover:shadow-pop"
                        : "bg-white text-brand-700 border border-brand-200 hover:bg-brand-50 hover:border-brand-600"}`}
                  >
                    {p.cta}
                    <Icon name="ArrowRight" size={17} />
                  </button>
                  {p.trial && (
                    <p className="mt-2 text-center text-[11.5px] text-ink-500">14 dias grátis · depois {fmt(annual ? p.priceAnnual : p.priceMonthly)}/mês</p>
                  )}

                  {/* features */}
                  <ul className="mt-6 space-y-2.5 flex-1">
                    {p.features.map((f) => (
                      <li key={f.text} className="flex items-start gap-2.5 text-sm">
                        <span className={`mt-0.5 h-4 w-4 rounded-full grid place-items-center shrink-0 ${
                          f.on ? "bg-brand-100 text-brand-700" : "bg-ink-100 text-ink-400"
                        }`}>
                          <Icon name={f.on ? "Check" : "X"} size={11} strokeWidth={3} />
                        </span>
                        <span className={f.on ? "text-ink-700" : "text-ink-400 line-through"}>{f.text}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 pt-4 border-t border-ink-100 text-[12.5px] text-ink-500 leading-snug">
                    {p.foot}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rodapé garantias */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-ink-500">
            <span className="inline-flex items-center gap-1.5"><Icon name="ShieldCheck" size={16} className="text-brand-600" /> Pagamento seguro</span>
            <span className="inline-flex items-center gap-1.5"><Icon name="RefreshCw" size={16} className="text-brand-600" /> Cancele quando quiser</span>
            <span className="inline-flex items-center gap-1.5"><Icon name="Headset" size={16} className="text-brand-600" /> Suporte em português</span>
          </div>

          <p className="mt-8 text-center text-sm text-ink-500">
            Tem dúvidas?{" "}
            <a className="font-semibold text-brand-700 hover:text-brand-800 hover:underline cursor-pointer">Compare todos os recursos</a>
          </p>
        </div>
      </main>

      {/* Modal de confirmação do plano */}
      {confirming && (
        <PlanConfirmModal
          plan={confirming}
          annual={annual}
          fmt={fmt}
          onClose={() => setConfirming(null)}
          onConfirm={() => { setConfirming(null); onNavigate("DASHBOARD"); }}
        />
      )}
    </div>
  );
}

// ---------- Modal de confirmação ---------------------------------------------
function PlanConfirmModal({ plan, annual, fmt, onClose, onConfirm }) {
  const price = annual ? plan.priceAnnual : plan.priceMonthly;
  const isFree = plan.key === "free";
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-enter" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-[440px] sm:rounded-2xl rounded-t-2xl shadow-2xl modal-enter p-6">
        <button onClick={onClose} className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full text-ink-500 hover:bg-ink-100 transition-colors">
          <Icon name="X" size={18} />
        </button>

        <div className="flex items-center gap-3">
          <span className={`h-12 w-12 rounded-xl grid place-items-center ${plan.highlight ? "bg-brand-600 text-white" : "bg-brand-100 text-brand-700"}`}>
            <Icon name={plan.icon} size={24} />
          </span>
          <div>
            <div className="text-xs text-ink-500">Plano selecionado</div>
            <div className="font-display font-extrabold text-xl text-ink-900">{plan.name}</div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-ink-200 divide-y divide-ink-100">
          {plan.trial ? (
            <React.Fragment>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-ink-500">Hoje você paga</span>
                <span className="font-display font-bold text-brand-700">R$ 0,00</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-ink-500">Após 14 dias de teste</span>
                <span className="font-medium text-ink-900 tabular-nums">{fmt(price)}/mês{annual ? " (anual)" : ""}</span>
              </div>
            </React.Fragment>
          ) : (
            <div className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-ink-500">Plano gratuito</span>
              <span className="font-display font-bold text-brand-700">R$ 0,00 para sempre</span>
            </div>
          )}
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-ink-500">Produtos</span>
            <span className="font-medium text-ink-900">{plan.maxProducts == null ? "Ilimitado" : `Até ${plan.maxProducts}`}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-ink-500">Usuários</span>
            <span className="font-medium text-ink-900">{limitLabel(plan.maxUsers, "usuário", "usuários")}</span>
          </div>
        </div>

        {plan.trial && (
          <p className="mt-3 text-xs text-ink-500 flex items-start gap-1.5">
            <Icon name="Info" size={14} className="mt-0.5 shrink-0" /> Você pode cancelar a qualquer momento antes do fim do teste e não será cobrado.
          </p>
        )}

        <button onClick={onConfirm} className="mt-5 w-full inline-flex items-center justify-center gap-2 h-12 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition-all">
          {isFree ? "Começar a usar" : "Confirmar e iniciar teste"} <Icon name="ArrowRight" size={18} />
        </button>
        <button onClick={onClose} className="mt-2 w-full h-10 rounded-lg text-sm text-ink-500 hover:text-ink-900 transition-colors">
          Voltar aos planos
        </button>
      </div>
    </div>
  );
}

window.PlanScreen = PlanScreen;
