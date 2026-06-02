import type { Metadata } from "next";
import Link from "next/link";
import { Logo, Icon } from "@/components/ui";
import { listPlans } from "@/features/onboarding/service";
import type { Plan } from "@/features/onboarding/service";

// ─── Metadata ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Negócio Express — Crie sua loja online em minutos",
  description:
    "Monte sua loja virtual, receba pedidos e gerencie vendas em tempo real. Experimente grátis por 14 dias, sem cartão de crédito.",
  openGraph: {
    title: "Negócio Express — Sua loja online em minutos",
    description:
      "Monte sua loja virtual, receba pedidos e gerencie vendas em tempo real.",
    type: "website",
  },
};

// ─── Dados estáticos de fallback (baseados no plan.jsx do ./design) ───────────

const STATIC_FEATURES: Record<
  string,
  { icon: string; items: { text: string; on: boolean }[]; foot: string; highlight: boolean }
> = {
  free: {
    icon: "Sparkles",
    highlight: false,
    items: [
      { text: "Loja online com até 30 produtos", on: true },
      { text: "Pedidos via WhatsApp", on: true },
      { text: "1 usuário", on: true },
      { text: "Relatórios básicos", on: true },
      { text: "Pagamentos online (Pix e cartão)", on: false },
      { text: "Domínio próprio", on: false },
    ],
    foot: 'Selo "Powered by Negócio Express" na loja.',
  },
  pro: {
    icon: "Rocket",
    highlight: true,
    items: [
      { text: "Produtos ilimitados", on: true },
      { text: "Pagamentos online (Pix e cartão)", on: true },
      { text: "Cupons e promoções", on: true },
      { text: "Até 3 usuários", on: true },
      { text: "Relatórios avançados", on: true },
      { text: "Domínio próprio + sem marca", on: true },
    ],
    foot: "Tudo do Teste Grátis, sem limites.",
  },
  max: {
    icon: "Crown",
    highlight: false,
    items: [
      { text: "Tudo do plano Pro", on: true },
      { text: "Usuários ilimitados", on: true },
      { text: "Múltiplas lojas (multiloja)", on: true },
      { text: "Integrações e API", on: true },
      { text: "Gerente de conta dedicado", on: true },
      { text: "Suporte prioritário 24/7", on: true },
    ],
    foot: "Para quem precisa de escala e integrações.",
  },
};

const STATIC_PLANS: Plan[] = [
  { id: "free", name: "Teste Grátis", price: 0, productLimit: 30, trialDays: 0, isActive: true },
  { id: "pro", name: "Pro", price: 49, productLimit: undefined, trialDays: 14, isActive: true },
  { id: "max", name: "Max", price: 99, productLimit: undefined, trialDays: 14, isActive: true },
];

// Associa um plano da API à sua configuração estática de features pelo índice
function matchFeatures(plan: Plan, idx: number) {
  const key = ["free", "pro", "max"][idx] ?? "free";
  return STATIC_FEATURES[key] ?? STATIC_FEATURES.free;
}

// ─── Helper ──────────────────────────────────────────────────────────────────

const BRL = (n: number) =>
  n === 0
    ? "R$ 0"
    : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(n);

// ─── Componentes de seção ─────────────────────────────────────────────────────

function NavBar() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-ink-200">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        <Logo size="sm" />
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-ink-600">
          <a href="#funcionalidades" className="hover:text-ink-900 transition-colors">Funcionalidades</a>
          <a href="#como-funciona" className="hover:text-ink-900 transition-colors">Como funciona</a>
          <a href="#planos" className="hover:text-ink-900 transition-colors">Planos</a>
        </nav>
        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="hidden sm:inline-flex h-9 px-4 items-center text-sm font-medium text-ink-700 rounded-lg border border-ink-200 hover:bg-ink-50 transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="inline-flex h-9 px-4 items-center gap-1.5 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
          >
            Começar grátis
            <Icon name="ArrowRight" size={15} />
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white">
      <div className="absolute inset-0 dot-grid opacity-40" />
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-3.5 py-1 text-[13px] font-medium text-brand-100 mb-6">
          <Icon name="Zap" size={13} className="text-brand-300" />
          Novo: pagamentos integrados (Pix e cartão)
        </span>

        <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-[3.75rem] leading-tight tracking-tight text-balance">
          Crie sua loja online
          <br />
          <span className="text-brand-200">em minutos.</span>
        </h1>

        <p className="mt-5 text-lg sm:text-xl text-brand-100 max-w-2xl mx-auto leading-relaxed text-balance">
          Monte sua vitrine, receba pedidos via WhatsApp e cartão, e acompanhe
          suas vendas em tempo real — tudo num só lugar.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-white text-brand-700 font-semibold text-[15px] hover:bg-brand-50 transition-all shadow-soft"
          >
            <Icon name="Sparkles" size={18} />
            Começar grátis — sem cartão
          </Link>
          <Link
            href="/stores/loja-demo"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-white/15 border border-white/30 text-white font-semibold text-[15px] hover:bg-white/25 transition-all"
          >
            <Icon name="Store" size={18} />
            Ver vitrine de exemplo
          </Link>
        </div>

        <p className="mt-5 text-sm text-brand-200">
          14 dias grátis nos planos pagos · Cancele a qualquer momento
        </p>
      </div>

      {/* Stats */}
      <div className="relative border-t border-white/20 bg-white/10 backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-5 grid grid-cols-3 gap-4 text-center">
          {[
            { value: "+2.400", label: "Lojas ativas" },
            { value: "R$ 4,8M", label: "Vendido em 2025" },
            { value: "4,9★", label: "Avaliação média" },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-display font-extrabold text-xl sm:text-2xl text-white tabular-nums">
                {s.value}
              </div>
              <div className="text-[12px] sm:text-sm text-brand-200 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: "ShoppingBag", title: "Vitrine pública", desc: "Catálogo online bonito e responsivo para seus clientes acessarem de qualquer dispositivo." },
  { icon: "CreditCard", title: "Pagamentos integrados", desc: "Aceite Pix, cartão de crédito e dinheiro. Confirmação automática do pedido." },
  { icon: "Package", title: "Gestão de produtos", desc: "Cadastre produtos com variações, imagens e estoque. Tudo sincronizado em tempo real." },
  { icon: "Truck", title: "Entrega e retirada", desc: "Gerencie entregadores, atribua pedidos e acompanhe o status de cada entrega." },
  { icon: "Ticket", title: "Cupons e promoções", desc: "Crie cupons de desconto por valor ou percentual e impulsione suas vendas." },
  { icon: "ChartBar", title: "Relatórios de vendas", desc: "Acompanhe faturamento, ticket médio e produtos mais vendidos no seu painel." },
] as const;

function FeaturesSection() {
  return (
    <section id="funcionalidades" className="bg-white py-20 sm:py-24">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">
            Funcionalidades
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink-900 tracking-tight text-balance">
            Tudo que seu negócio precisa
          </h2>
          <p className="mt-3 text-ink-500 max-w-xl mx-auto">
            De padarias a petshops, o Negócio Express tem os recursos certos para cada tipo de negócio local.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-ink-200 bg-white p-6 shadow-soft hover:shadow-pop hover:border-ink-300 transition-all">
              <span className="h-11 w-11 rounded-xl bg-brand-100 text-brand-700 grid place-items-center mb-4">
                <Icon name={f.icon} size={20} />
              </span>
              <h3 className="font-display font-bold text-[16px] text-ink-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-ink-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const HOW_STEPS = [
  { step: "1", icon: "UserPlus", title: "Crie sua conta", desc: "Preencha seus dados e os dados da loja em 2 minutos. Sem burocracia, sem cartão." },
  { step: "2", icon: "Package", title: "Cadastre seus produtos", desc: "Adicione produtos com fotos, variações e preços. Sua vitrine fica online na hora." },
  { step: "3", icon: "ShoppingBag", title: "Receba pedidos", desc: "Clientes acessam sua vitrine, escolhem produtos e finalizam o pagamento online." },
] as const;

function HowItWorksSection() {
  return (
    <section id="como-funciona" className="bg-ink-50 py-20 sm:py-24">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">
            Como funciona
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink-900 tracking-tight">
            Pronto para vender em 3 passos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_STEPS.map((s, i) => (
            <div key={s.step} className="relative flex flex-col items-center text-center">
              {i < HOW_STEPS.length - 1 && (
                <div className="hidden md:block absolute top-7 left-[calc(50%+28px)] right-[-28px] h-px bg-ink-300 border-dashed border-t-2 border-ink-300" />
              )}
              <span className="h-14 w-14 rounded-2xl bg-brand-600 text-white grid place-items-center shadow-pop mb-5 relative z-10">
                <Icon name={s.icon} size={24} />
              </span>
              <div className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-1">
                Passo {s.step}
              </div>
              <h3 className="font-display font-bold text-[17px] text-ink-900 mb-2">{s.title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed max-w-[260px]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanCard({
  plan,
  idx,
}: {
  plan: Plan;
  idx: number;
}) {
  const meta = matchFeatures(plan, idx);
  const price = Number(plan.price ?? 0);
  const hasTrial = Number(plan.trialDays ?? 0) > 0;
  const isFree = price === 0;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-white p-7 shadow-soft transition-all ${
        meta.highlight
          ? "border-brand-600 shadow-pop md:-mt-3"
          : "border-ink-200 hover:border-ink-300 hover:shadow-pop"
      }`}
    >
      {meta.highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-600 text-white text-[11px] font-bold px-3 py-1 shadow-soft uppercase tracking-wide">
            <Icon name="Star" size={11} strokeWidth={3} /> Mais popular
          </span>
        </div>
      )}

      <div className="flex items-center gap-2.5 mb-3">
        <span className={`h-10 w-10 rounded-xl grid place-items-center ${meta.highlight ? "bg-brand-600 text-white" : "bg-brand-100 text-brand-700"}`}>
          <Icon name={meta.icon as Parameters<typeof Icon>[0]["name"]} size={20} />
        </span>
        <div className="font-display font-extrabold text-lg text-ink-900 leading-none">
          {plan.name}
        </div>
      </div>

      <div className="flex items-end gap-1.5 mb-1">
        <span className="font-display font-extrabold text-[38px] leading-none tracking-tight text-ink-900">
          {isFree ? "R$ 0" : BRL(price)}
        </span>
        {!isFree && <span className="text-ink-500 text-sm mb-1">/mês</span>}
      </div>
      <div className="text-[12.5px] text-ink-400 mb-5 h-4">
        {hasTrial
          ? `${plan.trialDays} dias grátis, depois ${BRL(price)}/mês`
          : isFree
            ? "Para sempre gratuito"
            : "Cobrado mensalmente"}
      </div>

      <Link
        href="/register"
        className={`inline-flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-[15px] transition-all mb-6 ${
          meta.highlight
            ? "bg-brand-600 text-white hover:bg-brand-700"
            : "bg-white text-brand-700 border border-brand-200 hover:bg-brand-50 hover:border-brand-600"
        }`}
      >
        {isFree ? "Começar grátis" : "Iniciar teste grátis"}
        <Icon name="ArrowRight" size={17} />
      </Link>

      <ul className="space-y-2.5 flex-1">
        {meta.items.map((f) => (
          <li key={f.text} className="flex items-start gap-2.5 text-sm">
            <span className={`mt-0.5 h-4 w-4 rounded-full grid place-items-center shrink-0 ${f.on ? "bg-brand-100 text-brand-700" : "bg-ink-100 text-ink-400"}`}>
              <Icon name={f.on ? "Check" : "X"} size={11} strokeWidth={3} />
            </span>
            <span className={f.on ? "text-ink-700" : "text-ink-400 line-through"}>{f.text}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 pt-4 border-t border-ink-100 text-[12.5px] text-ink-500 leading-snug">
        {meta.foot}
      </div>
    </div>
  );
}

function PlansSection({ plans }: { plans: Plan[] }) {
  return (
    <section id="planos" className="bg-white py-20 sm:py-24">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">
            Planos
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink-900 tracking-tight text-balance">
            Escolha o plano ideal para o seu negócio
          </h2>
          <p className="mt-3 text-ink-500">
            Comece grátis e faça upgrade quando quiser.{" "}
            <span className="font-medium text-brand-700">Economize 20% no plano anual.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {plans.map((plan, idx) => (
            <PlanCard key={plan.id ?? idx} plan={plan} idx={idx} />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-ink-500">
          {[
            { icon: "ShieldCheck", text: "Pagamento seguro" },
            { icon: "RefreshCw", text: "Cancele quando quiser" },
            { icon: "Headset", text: "Suporte em português" },
          ].map((g) => (
            <span key={g.text} className="inline-flex items-center gap-1.5">
              <Icon name={g.icon as Parameters<typeof Icon>[0]["name"]} size={16} className="text-brand-600" />
              {g.text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    { name: "Ana Paula S.", role: "Padaria Doce Lar", text: "Em 3 dias já estava recebendo pedidos pelo link da minha loja. Meus clientes adoraram!" },
    { name: "Carlos M.", role: "Petshop Amigo Fiel", text: "O painel é muito fácil de usar. Consigo cadastrar produto, ver pedido e pagar tudo pelo celular." },
    { name: "Fernanda R.", role: "Salgados da Fer", text: "Dobrei minhas vendas no primeiro mês. O sistema de entregadores faz toda diferença." },
  ];

  return (
    <section className="bg-ink-50 py-20 sm:py-24">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink-900 tracking-tight">
            Quem já usa o Negócio Express
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl border border-ink-200 p-6 shadow-soft">
              <div className="flex items-center gap-0.5 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Icon key={i} name="Star" size={16} strokeWidth={2.5} className="text-amber-500" />
                ))}
              </div>
              <p className="text-ink-700 text-[15px] leading-relaxed mb-5">"{t.text}"</p>
              <div className="flex items-center gap-2.5">
                <span className="h-9 w-9 rounded-full bg-brand-100 text-brand-700 grid place-items-center font-bold">
                  {t.name[0]}
                </span>
                <div>
                  <div className="text-sm font-semibold text-ink-900">{t.name}</div>
                  <div className="text-xs text-ink-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 to-brand-800 text-white py-20 sm:py-24">
      <div className="absolute inset-0 dot-grid opacity-30" />
      <div className="relative max-w-[700px] mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight text-balance">
          Comece a vender hoje mesmo. Grátis.
        </h2>
        <p className="mt-4 text-lg text-brand-100">
          Crie sua loja em minutos e experimente todos os recursos por 14 dias sem pagar nada.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-white text-brand-700 font-semibold text-[15px] hover:bg-brand-50 transition-all shadow-soft"
          >
            <Icon name="Sparkles" size={18} />
            Criar minha loja grátis
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-white/15 border border-white/30 text-white font-medium text-[15px] hover:bg-white/25 transition-all"
          >
            Já tenho conta
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-ink-900 text-ink-400">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <Logo variant="light" size="sm" />
            <p className="mt-3 text-sm text-ink-500 max-w-xs leading-relaxed">
              A plataforma de e-commerce para negócios locais. Simples, rápida e acessível.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold text-ink-300 mb-3">Produto</div>
            <ul className="space-y-2 text-sm">
              <li><a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a></li>
              <li><a href="#planos" className="hover:text-white transition-colors">Planos e preços</a></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Começar grátis</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold text-ink-300 mb-3">Conta</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-white transition-colors">Entrar no painel</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Criar conta</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-ink-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-600">
          <span>© {new Date().getFullYear()} Negócio Express. Todos os direitos reservados.</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-ink-400 transition-colors">Termos de uso</a>
            <a href="#" className="hover:text-ink-400 transition-colors">Privacidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LandingPage() {
  let plans = STATIC_PLANS;
  try {
    const apiPlans = await listPlans();
    if (apiPlans.length > 0) plans = apiPlans;
  } catch {
    // API indisponível → usa planos estáticos do design
  }

  return (
    <div className="bg-white">
      <NavBar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PlansSection plans={plans} />
      <TestimonialsSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
