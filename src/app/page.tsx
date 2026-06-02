import type { Metadata } from "next";
import Link from "next/link";
import "./landing.css";
import { PhoneMockup, MiniQR } from "@/features/landing/PhoneMockup";
import { PainSection } from "@/features/landing/PainSection";
import { Accordion, FAQAccordion } from "@/features/landing/Accordion";

// ─── Metadata ───────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Negócio Express — Sua loja online pronta. Sem complicação.",
  description:
    "O Negócio Express digitaliza sua loja em minutos — domínio, design e SEO já vêm prontos. Você só foca em vender. Teste grátis por 30 dias.",
  openGraph: {
    title: "Negócio Express — Sua loja online pronta. Sem complicação.",
    description: "Monte sua loja virtual em minutos. Domínio incluído, SEO automático, pagamentos integrados.",
    type: "website",
  },
};

// ─── Icons ───────────────────────────────────────────────────────────────────

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7h8M7 3l4 4-4 4" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8.5l3 3 7-7" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 2L3 5v6c0 4.5 3.5 8 8 9 4.5-1 8-4.5 8-9V5l-8-3z" />
    <path d="M7.5 11l2.5 2.5L15 9" />
  </svg>
);

// ─── Nav ─────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav className="l-nav">
      <div className="l-logo">
        <span className="l-logo-mark">NE</span>
        <span>Negócio Express</span>
      </div>
      <div className="l-nav-links">
        <a href="#produto">Como funciona</a>
        <a href="#beneficios">Benefícios</a>
        <a href="#preco">Preço</a>
        <a href="#faq">FAQ</a>
      </div>
      <div className="l-nav-cta">
        <Link href="/login" className="l-btn l-btn-ghost l-btn-sm">Entrar</Link>
        <Link href="/register" className="l-btn l-btn-primary l-btn-sm">
          Testar grátis <ArrowIcon />
        </Link>
      </div>
    </nav>
  );
}

// ─── 1. Hero ─────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="l-section" style={{ paddingTop: 80, paddingBottom: 96 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 64, alignItems: "center" }}>
        {/* Copy */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div className="l-kicker-row">
            <span className="l-kicker-dot" />
            <span>Sua loja online pronta</span>
          </div>

          <h1 className="l-display" style={{ fontSize: "var(--t-h1)" }}>
            Sua loja online{" "}
            <em style={{ fontStyle: "normal", color: "var(--accent)" }}>pronta.</em>
            {" "}Sem complicação.
          </h1>

          <p style={{ fontSize: 21, color: "var(--fg-secondary)", maxWidth: 540, lineHeight: 1.45, letterSpacing: "-0.01em" }}>
            O Negócio Express digitaliza sua loja em minutos —{" "}
            <span style={{ color: "var(--fg)" }}>domínio, design e SEO já vêm prontos</span>.
            Você só foca em vender.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <Link href="/register" className="l-btn l-btn-primary l-btn-lg">
              Testar grátis por 1 mês <ArrowIcon />
            </Link>
            <Link href="/stores/loja-demo" className="l-btn l-btn-ghost l-btn-lg">
              Ver demo
            </Link>
          </div>

          <div className="l-cta-fine">
            <span>Sem cartão de crédito</span>
            <span className="l-dot" />
            <span>Sem compromisso</span>
            <span className="l-dot" />
            <span>Cancela quando quiser</span>
          </div>
        </div>

        {/* Mockup */}
        <div style={{ display: "flex", justifyContent: "flex-end", position: "relative" }}>
          <div style={{ position: "relative" }}>
            <PhoneMockup width={300} />

            {/* Chip — novo pedido */}
            <div style={{ position: "absolute", top: 28, left: -70,
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "12px 14px", fontSize: 12,
              boxShadow: "0 12px 28px -10px rgba(15,15,12,.22)",
              display: "flex", alignItems: "center", gap: 10, minWidth: 180 }}>
              <div style={{ width: 28, height: 28, borderRadius: 14,
                background: "var(--accent-soft)", color: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckIcon />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: "var(--fg)", letterSpacing: "-0.01em" }}>Novo pedido</div>
                <div style={{ color: "var(--fg-tertiary)", fontSize: 11, marginTop: 1 }}>Brigadeiro 12un · R$ 28</div>
              </div>
            </div>

            {/* Chip — SEO */}
            <div style={{ position: "absolute", bottom: 80, right: -40,
              background: "var(--bg-deep)", color: "var(--fg-on-deep)",
              borderRadius: 12, padding: "12px 14px", fontSize: 12,
              boxShadow: "0 12px 28px -10px rgba(15,15,12,.30)", minWidth: 170 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "monospace",
                fontSize: 10, opacity: 0.7, letterSpacing: "0.06em" }}>
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <circle cx="7" cy="7" r="5.5"/>
                  <path d="M1.5 7h11M7 1.5c1.5 2 2.3 3.5 2.3 5.5S8.5 10.5 7 12.5C5.5 10.5 4.7 9 4.7 7S5.5 3.5 7 1.5z"/>
                </svg>
                GOOGLE.COM/SEARCH
              </div>
              <div style={{ fontWeight: 600, marginTop: 6, fontSize: 13 }}>"bolo cenoura salvador"</div>
              <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>Você está no top 3 ↑</div>
            </div>
          </div>
        </div>
      </div>

      {/* Narrativa de abertura */}
      <div style={{ marginTop: 120, paddingTop: 48, borderTop: "1px solid var(--border)",
        display: "grid", gridTemplateColumns: "260px 1fr", gap: 64 }}>
        <div className="l-eyebrow">001 · O ponto</div>
        <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.25, maxWidth: 780 }}>
          Você tem um negócio bom.{" "}
          <span style={{ color: "var(--fg-secondary)" }}>Mas se o cliente não te acha no Google, você não existe pra ele.</span>
          <br/><br/>
          Criar loja online sempre pareceu coisa cara, difícil e demorada.{" "}
          <span style={{ color: "var(--fg-secondary)" }}>Programador, designer, hospedagem, domínio... uma bagunça.</span>
          <br/><br/>
          O Negócio Express{" "}
          <span style={{ color: "var(--accent)" }}>resolve tudo isso de uma vez.</span>
          {" "}Você abre sua loja, cadastra seus produtos e já começa a receber pedidos.
        </div>
      </div>
    </section>
  );
}

// ─── 3. Solution ─────────────────────────────────────────────────────────────

const STEPS = [
  { n: "01", title: "Você entra e cadastra produto", body: "Foto, preço, descrição. Pronto.", time: "± 5 min" },
  { n: "02", title: "Design e domínio já configurados", body: "Sua loja já vem com cara profissional. Domínio próprio incluído.", time: "0 min — já vem pronto" },
  { n: "03", title: "Cliente compra. Você recebe.", body: "Pedido cai no painel. Retirada local ou entrega. Pix, cartão, boleto.", time: "Hoje mesmo" },
];

function SolutionSection() {
  return (
    <section className="l-section">
      <div style={{ maxWidth: 820, marginBottom: 60 }}>
        <div className="l-eyebrow" style={{ marginBottom: 18 }}>003 · A solução</div>
        <h2 className="l-display-md" style={{ fontSize: "var(--t-h2)" }}>
          Uma plataforma{" "}
          <em style={{ color: "var(--accent)", fontStyle: "normal" }}>pra quem precisa vender</em>
          {" "}— não pra quem quer virar técnico.
        </h2>
        <p className="l-muted" style={{ fontSize: 18, marginTop: 18, lineHeight: 1.5 }}>
          Você entra, cadastra seus produtos e pronto. Design já configurado. Domínio já incluído. SEO já trabalha por você em segundo plano.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", borderTop: "1px solid var(--border)" }}>
        {STEPS.map((s, i) => (
          <div key={s.n} style={{
            padding: "40px 36px 40px 0",
            borderRight: i < 2 ? "1px solid var(--border)" : "none",
            display: "flex", flexDirection: "column", gap: 10, minHeight: 260,
          }}>
            <div className="l-step-num">{s.n}</div>
            <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1.1, maxWidth: 280 }}>
              {s.title}
            </div>
            <div className="l-muted" style={{ fontSize: 15, marginTop: 6 }}>{s.body}</div>
            <div className="l-mono" style={{ fontSize: 12, color: "var(--fg-tertiary)", marginTop: "auto",
              paddingTop: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.time}</div>
          </div>
        ))}
      </div>

      {/* QR callout */}
      <div style={{ marginTop: 72, padding: 40, background: "var(--bg-deep)", color: "var(--fg-on-deep)",
        borderRadius: "var(--r-xl)", display: "grid", gridTemplateColumns: "auto 1fr auto",
        gap: 40, alignItems: "center" }}>
        <div style={{ background: "var(--fg-on-deep)", padding: 12, borderRadius: 12,
          width: 120, height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <MiniQR fg="#0E0E0C" size={96} />
        </div>
        <div>
          <div className="l-mono" style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.6, marginBottom: 8 }}>
            Bônus pra quem tem balcão
          </div>
          <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.15, maxWidth: 560 }}>
            QR code pra colar no balcão. Cliente escaneia, vê seu catálogo e pede com retirada no local.
          </div>
        </div>
        <div className="l-mono" style={{ fontSize: 12, letterSpacing: "0.05em", opacity: 0.7, textAlign: "right" }}>
          ZERO<br/>CONFIGURAÇÃO<br/>EXTRA
        </div>
      </div>
    </section>
  );
}

// ─── 4. Benefits ─────────────────────────────────────────────────────────────

const BENEFITS = [
  { num: "01", title: "Sua loja no ar sem depender de ninguém", body: "Chega de esperar programador ou pagar agência. Você publica sozinho — em minutos." },
  { num: "02", title: "Clientes te acham no Google", body: "O SEO já vem ativado desde o primeiro dia. Sem configurar nada, sem plugin, sem manual." },
  { num: "03", title: "Vende mesmo fora do horário", body: "Sua loja trabalha enquanto você descansa, almoça, dorme. 24/7, sem extras." },
  { num: "04", title: "QR code no balcão", body: "Cliente escaneia, vê o catálogo e já faz o pedido — pra retirar na hora ou agendar." },
  { num: "05", title: "Aceita retirada local", body: "Une o online com seu ponto físico. Cliente pede pelo celular e busca quando passa." },
  { num: "06", title: "Cabe no caixa", body: "Por menos de R$ 2 por dia, você tem presença profissional no digital. Sem taxa de venda." },
  { num: "07", title: "Zero enrolação técnica", body: "Domínio e design já prontos. Você cuida do produto. A gente cuida da plataforma." },
];

function BenefitsSection() {
  return (
    <section className="l-section l-section-tight" id="beneficios">
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        flexWrap: "wrap", gap: 16, marginBottom: 56 }}>
        <div>
          <div className="l-eyebrow" style={{ marginBottom: 14 }}>004 · O que você ganha</div>
          <h2 className="l-display-md" style={{ fontSize: "var(--t-h2)", maxWidth: 720 }}>
            Sete coisas que você{" "}
            <em style={{ color: "var(--accent)", fontStyle: "normal" }}>não precisa fazer</em> mais.
          </h2>
        </div>
        <div className="l-mono l-muted" style={{ fontSize: 13 }}>07 / 07</div>
      </div>

      <div className="l-benefit-grid">
        {BENEFITS.map((b, i) => (
          <div key={b.num} className="l-benefit-cell"
            style={{ gridColumn: i === 6 ? "span 3" : undefined,
              background: i === 6 ? "var(--bg-tinted)" : "var(--bg)" }}>
            <div className="l-benefit-num">{b.num}</div>
            <div className="l-benefit-title">{b.title}</div>
            <div className="l-benefit-body">{b.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── 5. Social proof ──────────────────────────────────────────────────────────

const TESTIMONIALS = [
  { quote: "Abri minha loja em uma tarde e já recebi meu primeiro pedido em 3 dias. Coisa que eu adiava fazia 2 anos.", initials: "C1", angle: "resultado" },
  { quote: "Nunca mexi com tecnologia. Achei que ia precisar contratar alguém. Consegui sozinho — em uma tarde.", initials: "C2", angle: "facilidade" },
  { quote: "Pago R$ 50 e já recuperei isso em vendas no primeiro mês. A partir do segundo é só margem.", initials: "C3", angle: "custo-benefício" },
];

function ProofSection() {
  return (
    <section className="l-section l-section-deep">
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <span className="l-stat-big l-tnum">+500</span>
        <span style={{ fontSize: 24, fontWeight: 500,
          color: "color-mix(in oklab,var(--fg-on-deep) 75%,transparent)",
          letterSpacing: "-0.02em", maxWidth: 420 }}>
          lojas abertas no Negócio Express
        </span>
      </div>

      <div style={{ marginTop: 64, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 18 }}>
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="l-quote" style={{
            background: "color-mix(in oklab,var(--fg-on-deep) 4%,transparent)",
            borderColor: "color-mix(in oklab,var(--fg-on-deep) 12%,transparent)",
            color: "var(--fg-on-deep)", height: "100%" }}>
            <div className="l-mono" style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.5 }}>
              Foco: {t.angle}
            </div>
            <div style={{ fontSize: 17, lineHeight: 1.45 }}>"{t.quote}"</div>
            <div className="l-quote-meta" style={{ color: "color-mix(in oklab,var(--fg-on-deep) 60%,transparent)", marginTop: "auto" }}>
              <div className="l-avatar" style={{ background: "color-mix(in oklab,var(--fg-on-deep) 14%,transparent)",
                color: "var(--fg-on-deep)", borderColor: "transparent" }}>{t.initials}</div>
              <div>
                <div style={{ color: "var(--fg-on-deep)", fontWeight: 500 }}>[Nome do cliente]</div>
                <div>[Segmento] · [Cidade]</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── 6. Offer / Pricing ───────────────────────────────────────────────────────

const OFFER_FEATURES = [
  "Loja online completa e pronta pra vender",
  "Domínio incluído — sem pagar à parte",
  "Design configurado — sem contratar designer",
  "SEO automático — Google indexa sua loja",
  "QR code pra usar no seu ponto físico",
  "Suporte a retirada local",
  "Suporte via chat em dias úteis",
  "1 mês grátis pra testar sem risco",
];

function OfferSection() {
  return (
    <section className="l-section" id="preco">
      <div style={{ maxWidth: 760, marginBottom: 56 }}>
        <div className="l-eyebrow" style={{ marginBottom: 16 }}>005 · A oferta</div>
        <h2 className="l-display-md" style={{ fontSize: "var(--t-h2)" }}>
          Tudo que você precisa pra abrir a loja.{" "}
          <em style={{ color: "var(--accent)", fontStyle: "normal" }}>Em um preço só.</em>
        </h2>
      </div>

      <div className="l-price-card">
        <div className="l-price-feat">
          <div className="l-mono" style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase",
            color: "var(--fg-tertiary)", marginBottom: 8 }}>O que está incluído</div>
          <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1.1 }}>
            Negócio Express{" "}
            <em style={{ fontStyle: "normal", color: "var(--fg-secondary)" }}>completo</em>
          </div>
          <ul>
            {OFFER_FEATURES.map((f, i) => (
              <li key={i}>
                <CheckIcon />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="l-price-amount">
          <div style={{ display: "inline-flex", padding: "5px 10px", borderRadius: 999,
            background: "color-mix(in oklab,var(--accent) 25%,transparent)",
            color: "var(--fg-on-deep)", fontFamily: "monospace", fontSize: 11,
            fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", width: "fit-content" }}>
            <span style={{ marginRight: 6 }}>●</span> 1º mês grátis
          </div>

          <div>
            <div style={{ fontSize: 14, opacity: 0.65, marginBottom: 6 }}>Depois do teste</div>
            <div className="l-price-big l-tnum">
              <sup>R$</sup>50<sub>/mês</sub>
            </div>
            <div style={{ fontSize: 14, opacity: 0.65, marginTop: 6 }}>
              Menos de <span className="l-tnum" style={{ color: "var(--fg-on-deep)" }}>R$ 2 por dia</span>.
            </div>
          </div>

          <Link href="/register" className="l-btn l-btn-lg"
            style={{ background: "var(--fg-on-deep)", color: "var(--bg-deep)", marginTop: "auto" }}>
            Abrir minha loja agora <ArrowIcon />
          </Link>

          <div className="l-mono" style={{ fontSize: 12, opacity: 0.55, lineHeight: 1.45, letterSpacing: "0.02em" }}>
            Nenhuma taxa de setup. Nenhum contrato de fidelidade. Cancela quando quiser.
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 7. Objections ────────────────────────────────────────────────────────────

const OBJECTIONS = [
  { q: "Meu negócio é muito pequeno pra ter loja online.", a: "Esse é exatamente o perfil de quem mais se beneficia. Grandes redes já estão no digital faz tempo — você precisa chegar lá antes que o atraso custe mais caro." },
  { q: "Não entendo nada de tecnologia.", a: "Não precisa entender. O design já vem pronto, o domínio já vem configurado, o SEO já trabalha sozinho. Sua parte é cadastrar produto e receber pedido." },
  { q: "R$ 50 é mais uma conta no fim do mês.", a: "Um único pedido a mais por mês já paga a mensalidade. E você tem 30 dias grátis pra confirmar isso antes de pagar qualquer coisa." },
  { q: "Já tentei montar loja antes e foi um pesadelo.", a: "Porque as outras plataformas foram feitas por técnicos, pra técnicos. O Negócio Express foi feito pra quem tem negócio pra tocar, não tempo pra aprender ferramenta." },
  { q: "E se eu não gostar?", a: "Você cancela quando quiser. Sem multa, sem burocracia, sem ligação de retenção." },
];

function ObjectionsSection() {
  return (
    <section className="l-section l-section-tinted">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "28px 72px" }}>
        <div style={{ position: "sticky", top: 100, alignSelf: "start" }}>
          <div className="l-eyebrow" style={{ marginBottom: 16 }}>006 · O que pode estar te segurando</div>
          <h2 className="l-display-md" style={{ fontSize: "var(--t-h2)" }}>
            As 5 dúvidas que{" "}
            <em style={{ color: "var(--accent)", fontStyle: "normal" }}>todo mundo</em> tem.
          </h2>
          <p className="l-muted" style={{ marginTop: 18, fontSize: 16, maxWidth: 360 }}>
            Você não é o primeiro a pensar isso. Aqui vão as respostas, na real.
          </p>
        </div>
        <Accordion items={OBJECTIONS} />
      </div>
    </section>
  );
}

// ─── 8. Guarantee ────────────────────────────────────────────────────────────

function GuaranteeSection() {
  return (
    <section className="l-section l-section-tight">
      <div className="l-guarantee-strip">
        <div className="l-guarantee-seal">30<br/>DIAS<br/>GRÁTIS</div>
        <div>
          <div className="l-mono" style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase",
            opacity: 0.6, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <ShieldIcon /> Garantia
          </div>
          <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            Teste por 30 dias{" "}
            <em style={{ fontStyle: "normal", opacity: 0.7 }}>sem pagar nada.</em>
          </div>
          <p style={{ marginTop: 12, fontSize: 15, opacity: 0.75, maxWidth: 600, lineHeight: 1.45 }}>
            Você abre sua loja, usa a plataforma completa e só decide se vale a pena depois de 1 mês inteiro de uso real. Se não fizer sentido pro seu negócio, cancela sem custo, sem pergunta, sem enrolação.
          </p>
        </div>
        <div style={{ textAlign: "right", fontSize: 18, fontWeight: 500, letterSpacing: "-0.01em", opacity: 0.85, maxWidth: 160 }}>
          O risco é todo nosso.
        </div>
      </div>
    </section>
  );
}

// ─── 9. Urgency ───────────────────────────────────────────────────────────────

function UrgencySection() {
  return (
    <section className="l-section l-section-tight">
      <div className="l-urgency-bar" style={{ maxWidth: 820 }}>
        <span className="l-urgency-dot" />
        <div style={{ flex: 1 }}>
          <strong style={{ fontWeight: 600 }}>Atenção:</strong>{" "}
          <span className="l-muted">o teste grátis de 1 mês é uma oferta de entrada — pode ser encerrada a qualquer momento conforme a demanda.</span>
        </div>
      </div>
    </section>
  );
}

// ─── 10. FAQ ──────────────────────────────────────────────────────────────────

const FAQ = [
  { q: "Quanto tempo leva pra minha loja ficar no ar?", a: "Você cadastra seus produtos e já está vendendo. Não tem prazo de espera, não tem aprovação manual." },
  { q: "Funciona pra qualquer tipo de negócio?", a: "Sim. Loja de roupas, pet shop, açougue, farmácia, restaurante, papelaria — qualquer segmento pode usar." },
  { q: "Preciso ter ponto físico?", a: "Não. Mas se tiver, o QR code e a opção de retirada local são diferenciais que fazem muita diferença na experiência do cliente." },
  { q: "E se eu não gostar? Perco o dinheiro?", a: "Não perde nada — o primeiro mês é grátis. E mesmo depois, cancela quando quiser sem custo." },
  { q: "Tem suporte se eu travar em alguma coisa?", a: "Sim. Suporte via chat em dias úteis pra te ajudar sempre que precisar." },
  { q: "Minha loja vai aparecer no Google?", a: "Sim. O SEO automático já trabalha isso por você desde o primeiro dia." },
];

function FAQSection() {
  return (
    <section className="l-section" id="faq">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "28px 72px" }}>
        <div>
          <div className="l-eyebrow" style={{ marginBottom: 16 }}>007 · Perguntas</div>
          <h2 className="l-display-md" style={{ fontSize: "var(--t-h2)" }}>
            Tudo que você quer{" "}
            <em style={{ color: "var(--accent)", fontStyle: "normal" }}>saber antes.</em>
          </h2>
          <p className="l-muted" style={{ marginTop: 18, fontSize: 16, maxWidth: 360 }}>
            Não achou sua dúvida?{" "}
            <span style={{ color: "var(--fg)", borderBottom: "1px solid var(--border)" }}>
              Manda mensagem no chat.
            </span>
          </p>
        </div>
        <FAQAccordion items={FAQ} />
      </div>
    </section>
  );
}

// ─── 11. Final CTA ────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="l-section l-section-deep">
      <div style={{ maxWidth: 920 }}>
        <div className="l-eyebrow" style={{ marginBottom: 24, color: "color-mix(in oklab,var(--fg-on-deep) 55%,transparent)" }}>
          008 · A hora é agora
        </div>
        <h2 className="l-display" style={{ fontSize: 72 }}>
          Seu concorrente{" "}
          <em style={{ fontStyle: "normal", color: "color-mix(in oklab,var(--fg-on-deep) 55%,transparent)" }}>
            já está no digital.
          </em>
          <br />
          Seu cliente{" "}
          <em style={{ fontStyle: "normal", color: "color-mix(in oklab,var(--fg-on-deep) 55%,transparent)" }}>
            já pesquisa no Google.
          </em>
          <br />
          <span style={{ color: "var(--accent)" }}>Você pode esperar.</span> Ou abrir sua loja agora.
        </h2>
        <div style={{ marginTop: 40, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18 }}>
          <Link href="/register" className="l-btn l-btn-lg"
            style={{ background: "var(--fg-on-deep)", color: "var(--bg-deep)" }}>
            Abrir minha loja agora <ArrowIcon />
          </Link>
          <div className="l-cta-fine" style={{ color: "color-mix(in oklab,var(--fg-on-deep) 55%,transparent)" }}>
            <span>Sem cartão</span><span className="l-dot"/>
            <span>Sem contrato</span><span className="l-dot"/>
            <span>Cancela quando quiser</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 12. PS ───────────────────────────────────────────────────────────────────

function PSBlock() {
  return (
    <section className="l-section l-section-tight">
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 64,
        alignItems: "start", padding: "48px 56px",
        background: "var(--bg-elevated)", border: "1px solid var(--border)",
        borderRadius: "var(--r-xl)" }}>
        <div className="l-mono" style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.04em",
          color: "var(--accent)", paddingTop: 4 }}>P.S.</div>
        <p className="l-ps-body" style={{ maxWidth: 620 }}>
          O teste grátis não dura pra sempre.{" "}
          <strong>Se você chegou até aqui, já sabe que precisa disso.</strong>
          {" "}A única diferença entre quem vende online e quem não vende é quem deu o primeiro passo.
          <br/><br/>
          Clica no botão. Abre sua loja. Você decide o resto depois.
        </p>
        <Link href="/register" className="l-btn l-btn-primary l-btn-lg" style={{ alignSelf: "center" }}>
          Testar grátis <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <div className="l-foot">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className="l-logo-mark" style={{ width: 22, height: 22, fontSize: 11 }}>NE</span>
        <span>Negócio Express · © {new Date().getFullYear()}</span>
      </div>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <a href="#" style={{ color: "var(--fg-secondary)" }}>Termos</a>
        <a href="#" style={{ color: "var(--fg-secondary)" }}>Privacidade · LGPD</a>
        <Link href="/login" style={{ color: "var(--fg-secondary)" }}>Entrar no painel</Link>
        <a href="mailto:contato@negocioexpress.com.br" style={{ color: "var(--fg-secondary)" }}>
          contato@negocioexpress.com.br
        </a>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="landing-root">
      <Nav />
      <Hero />
      <PainSection />
      <SolutionSection />
      <BenefitsSection />
      <ProofSection />
      <OfferSection />
      <ObjectionsSection />
      <GuaranteeSection />
      <UrgencySection />
      <FAQSection />
      <FinalCTA />
      <PSBlock />
      <Footer />
    </div>
  );
}
