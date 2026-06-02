// landing-sections.jsx
// All section components for the Negócio Express landing page.

const { useState, useEffect, useRef, useMemo } = React;

// ─── Icons ────────────────────────────────────────────────────────────
const Icon = {
  arrow: (p = {}) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 7h8M7 3l4 4-4 4" />
    </svg>
  ),
  check: (p = {}) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 8.5l3 3 7-7" />
    </svg>
  ),
  plus: (p = {}) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}>
      <path d="M3 7h8M7 3v8" />
    </svg>
  ),
  shield: (p = {}) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M11 2L3 5v6c0 4.5 3.5 8 8 9 4.5-1 8-4.5 8-9V5l-8-3z" />
      <path d="M7.5 11l2.5 2.5L15 9" />
    </svg>
  ),
  spark: (p = {}) => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9 1.5l1.8 4.7L15.5 8l-4.7 1.8L9 14.5l-1.8-4.7L2.5 8l4.7-1.8L9 1.5z" />
    </svg>
  ),
};

// ─── Reveal-on-scroll helper ──────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Inside design canvas the section may already be in view; use a small timeout fallback.
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { setShown(true); io.disconnect(); }
      });
    }, { threshold: 0.08 });
    io.observe(el);
    const t = setTimeout(() => setShown(true), 1200);
    return () => { io.disconnect(); clearTimeout(t); };
  }, []);
  return (
    <div ref={ref} className={`reveal ${shown ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

// ─── 0. Nav ───────────────────────────────────────────────────────────
function Nav({ onCta, mobile }) {
  return (
    <nav className="nav">
      <div className="logo">
        <span className="logo-mark">NE</span>
        <span>Negócio Express</span>
      </div>
      {!mobile && (
        <div className="nav-links">
          <a href="#produto">Como funciona</a>
          <a href="#beneficios">Benefícios</a>
          <a href="#preco">Preço</a>
          <a href="#faq">FAQ</a>
        </div>
      )}
      <div className="nav-cta">
        {!mobile && <a className="btn btn-ghost btn-sm" href="#entrar" style={{ height: 38 }}>Entrar</a>}
        <button className="btn btn-primary btn-sm" onClick={onCta} style={{ height: 38 }}>
          Testar grátis <Icon.arrow />
        </button>
      </div>
    </nav>
  );
}

// ─── 1-4. Hero ────────────────────────────────────────────────────────
const HEADLINES = {
  A: { eyebrow: "Sua loja online pronta", main: ["Sua loja online ", { em: "pronta." }, " Sem complicação."] },
  B: { eyebrow: "Menos de R$ 2 por dia",  main: ["Venda pela internet por ", { em: "menos de R$ 2 por dia." }] },
  C: { eyebrow: "Seu negócio no digital, hoje", main: ["Seu negócio no digital ", { em: "hoje." }, " Sem técnico, sem enrolação."] },
};

const CTAS = {
  A: { primary: "Testar grátis por 1 mês", fine: "Sem cartão de crédito · Sem compromisso · Cancela quando quiser" },
  B: { primary: "Abrir minha loja agora",   fine: "1 mês grátis · Sua loja no ar ainda hoje" },
};

function HeadlineRender({ variant }) {
  const h = HEADLINES[variant] || HEADLINES.C;
  return (
    <h1 className="display" style={{ fontSize: "var(--t-h1)" }}>
      {h.main.map((part, i) =>
        typeof part === "string"
          ? <React.Fragment key={i}>{part}</React.Fragment>
          : <em key={i} style={{ fontStyle: "normal", color: "var(--accent)" }}>{part.em}</em>
      )}
    </h1>
  );
}

function Hero({ tweaks, onCta, mobile }) {
  const cta = CTAS[tweaks.ctaVariant] || CTAS.A;
  return (
    <section className="section" style={{ paddingTop: mobile ? 36 : 80, paddingBottom: mobile ? 64 : 96 }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: mobile ? "1fr" : "1.15fr 1fr",
        gap: mobile ? 48 : 64,
        alignItems: "center",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <Reveal>
            <div className="kicker-row">
              <span className="kicker-dot"></span>
              <span>{HEADLINES[tweaks.headline]?.eyebrow || HEADLINES.C.eyebrow}</span>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <HeadlineRender variant={tweaks.headline} />
          </Reveal>
          <Reveal delay={160}>
            <p style={{ fontSize: mobile ? 17 : 21, color: "var(--fg-secondary)", maxWidth: 540, lineHeight: 1.45, letterSpacing: "-0.01em" }}>
              O Negócio Express digitaliza sua loja em minutos — <span style={{ color: "var(--fg)" }}>domínio, design e SEO já vêm prontos</span>. Você só foca em vender.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", gap: 12, alignItems: mobile ? "stretch" : "center", marginTop: 8 }}>
              <button className="btn btn-primary btn-lg" onClick={onCta}>
                {cta.primary} <Icon.arrow />
              </button>
              {!mobile && (
                <a className="btn btn-ghost btn-lg" href="#demo">
                  Ver demo
                </a>
              )}
            </div>
          </Reveal>
          <Reveal delay={300}>
            <div className="cta-fine">
              {cta.fine.split("·").map((s, i, a) => (
                <span key={i}>{s.trim()}{i < a.length - 1 && <span className="dot"></span>}</span>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Mockup column */}
        <Reveal delay={120}>
          <div style={{
            display: "flex", justifyContent: mobile ? "center" : "flex-end",
            position: "relative",
          }}>
            <div style={{ position: "relative" }}>
              <PhoneMockup width={mobile ? 240 : 320} />
              {tweaks.showHeroChips !== false && <>
              {/* Floating chip — first order */}
              <div style={{
                position: "absolute",
                top: 28, left: mobile ? -16 : -70,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "12px 14px",
                fontSize: 12,
                boxShadow: "0 12px 28px -10px rgba(15,15,12,.22)",
                display: "flex", alignItems: "center", gap: 10,
                minWidth: 180,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 14,
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon.check />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: "var(--fg)", letterSpacing: "-0.01em" }}>Novo pedido</div>
                  <div style={{ color: "var(--fg-tertiary)", fontSize: 11, marginTop: 1 }}>Brigadeiro 12un · R$ 28</div>
                </div>
              </div>
              {/* Floating chip — SEO */}
              <div style={{
                position: "absolute",
                bottom: 80, right: mobile ? -8 : -40,
                background: "var(--bg-deep)",
                color: "var(--fg-on-deep)",
                borderRadius: 12,
                padding: "12px 14px",
                fontSize: 12,
                boxShadow: "0 12px 28px -10px rgba(15,15,12,.30)",
                minWidth: 170,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: 10, opacity: 0.7, letterSpacing: "0.06em" }}>
                  <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="7" cy="7" r="5.5"/><path d="M1.5 7h11M7 1.5c1.5 2 2.3 3.5 2.3 5.5S8.5 10.5 7 12.5C5.5 10.5 4.7 9 4.7 7S5.5 3.5 7 1.5z"/></svg>
                  GOOGLE.COM/SEARCH
                </div>
                <div style={{ fontWeight: 600, marginTop: 6, fontSize: 13 }}>"bolo cenoura salvador"</div>
                <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>Você está no top 3 ↑</div>
              </div>
              </>}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Opening / proposta de valor — same section, dense narrative */}
      <Reveal delay={200}>
        <div style={{
          marginTop: mobile ? 56 : 120,
          paddingTop: 48,
          borderTop: "1px solid var(--border)",
          display: "grid",
          gridTemplateColumns: mobile ? "1fr" : "260px 1fr",
          gap: mobile ? 16 : 64,
        }}>
          <div className="eyebrow">{/* */}001 · O ponto</div>
          <div style={{ fontSize: mobile ? 22 : 30, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.25, maxWidth: 780 }}>
            Você tem um negócio bom. <span style={{ color: "var(--fg-secondary)" }}>Mas se o cliente não te acha no Google, você não existe pra ele.</span>
            <br/><br/>
            Criar loja online sempre pareceu coisa cara, difícil e demorada. Precisava de programador, designer, hospedagem, domínio... <span style={{ color: "var(--fg-secondary)" }}>uma bagunça.</span>
            <br/><br/>
            O Negócio Express <span style={{ color: "var(--accent)" }}>resolve tudo isso de uma vez.</span> Você abre sua loja, cadastra seus produtos e já começa a receber pedidos — sem configurar nada do zero.
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ─── 5. Pain identification ───────────────────────────────────────────
const PAINS = [
  "Clientes perguntam se você tem loja online e você fica sem resposta.",
  "Concorrente menor que o seu já vende pelo Instagram ou WhatsApp com mais organização.",
  "Você já tentou montar uma loja e desistiu na metade por ser complicado demais.",
  "Paga caro em marketplace e entrega a margem pro app.",
  "Seu ponto físico atende bem — mas fora do horário comercial, você some.",
  "Sente que tá ficando pra trás enquanto o mercado vai pro digital.",
];

function PainSection({ mobile }) {
  const [checked, setChecked] = useState(new Set());
  const toggle = (i) => {
    const next = new Set(checked);
    if (next.has(i)) next.delete(i); else next.add(i);
    setChecked(next);
  };
  const hits = checked.size;
  return (
    <section className="section section-tinted" id="produto">
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? 36 : 80 }}>
        <div>
          <Reveal>
            <div className="eyebrow" style={{ marginBottom: 18 }}>002 · A dor</div>
            <h2 className="display-md" style={{ fontSize: "var(--t-h2)" }}>
              Reconhece alguma dessas <em style={{ color: "var(--accent)", fontStyle: "normal" }}>situações?</em>
            </h2>
            <p className="muted" style={{ fontSize: 17, marginTop: 18, maxWidth: 480 }}>
              Marca o que você sente. Sem julgamento. <span style={{ color: "var(--fg)" }}>Isso é o dia a dia de quase todo dono de pequeno negócio agora.</span>
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div style={{
              marginTop: 36,
              padding: "18px 22px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-md)",
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{ display: "flex", gap: 6 }}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <span key={i} style={{
                    width: 8, height: 8, borderRadius: 4,
                    background: i < hits ? "var(--accent)" : "var(--border)",
                    transition: "background .2s ease",
                  }}></span>
                ))}
              </div>
              <div style={{ fontSize: 13, color: "var(--fg-secondary)", flex: 1 }}>
                {hits === 0 && <>Marca pelo menos um item se for o seu caso.</>}
                {hits >= 1 && hits < 3 && <><strong style={{ color: "var(--fg)" }}>Já dá pra ver onde aperta.</strong> O Negócio Express foi feito pra resolver isso.</>}
                {hits >= 3 && <><strong style={{ color: "var(--fg)" }}>É exatamente o seu cenário.</strong> Você precisa começar essa semana.</>}
              </div>
            </div>
          </Reveal>
        </div>

        <div>
          {PAINS.map((p, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className={`pain-row ${checked.has(i) ? "on" : ""}`} onClick={() => toggle(i)}>
                <span className="pain-check">
                  {checked.has(i) && <Icon.check width="14" height="14" />}
                </span>
                <span>{p}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 6. Solution ──────────────────────────────────────────────────────
function SolutionSection({ mobile }) {
  const steps = [
    { n: "01", title: "Você entra e cadastra produto", body: "Foto, preço, descrição. Pronto.", time: "± 5 min" },
    { n: "02", title: "Design e domínio já configurados", body: "Sua loja já vem com cara profissional. Domínio próprio incluído.", time: "0 min — já vem pronto" },
    { n: "03", title: "Cliente compra. Você recebe.", body: "Pedido cai no painel. Retirada local ou entrega. Pix, cartão, boleto.", time: "Hoje mesmo" },
  ];

  return (
    <section className="section">
      <Reveal>
        <div style={{ maxWidth: 820, marginBottom: mobile ? 36 : 60 }}>
          <div className="eyebrow" style={{ marginBottom: 18 }}>003 · A solução</div>
          <h2 className="display-md" style={{ fontSize: "var(--t-h2)" }}>
            Uma plataforma <em style={{ color: "var(--accent)", fontStyle: "normal" }}>pra quem precisa vender</em> — não pra quem quer virar técnico.
          </h2>
          <p className="muted" style={{ fontSize: 18, marginTop: 18, lineHeight: 1.5 }}>
            Você entra, cadastra seus produtos e pronto. Design já configurado. Domínio já incluído. SEO já trabalha por você em segundo plano.
          </p>
        </div>
      </Reveal>

      <div style={{
        display: "grid",
        gridTemplateColumns: mobile ? "1fr" : "1fr 1fr 1fr",
        borderTop: "1px solid var(--border)",
      }}>
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 100}>
            <div style={{
              padding: mobile ? "28px 0" : "40px 36px 40px 0",
              borderRight: !mobile && i < 2 ? "1px solid var(--border)" : "none",
              borderBottom: mobile ? "1px solid var(--border)" : "none",
              display: "flex", flexDirection: "column", gap: 10,
              minHeight: mobile ? "auto" : 260,
            }}>
              <div className="step-num">{s.n}</div>
              <div style={{ fontSize: mobile ? 22 : 28, fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1.1, maxWidth: 280 }}>
                {s.title}
              </div>
              <div className="muted" style={{ fontSize: 15, marginTop: 6 }}>{s.body}</div>
              <div className="mono" style={{ fontSize: 12, color: "var(--fg-tertiary)", marginTop: "auto", paddingTop: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {s.time}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* QR + ponto físico aside */}
      <Reveal delay={300}>
        <div style={{
          marginTop: mobile ? 36 : 72,
          padding: mobile ? 24 : 40,
          background: "var(--bg-deep)",
          color: "var(--fg-on-deep)",
          borderRadius: "var(--r-xl)",
          display: "grid",
          gridTemplateColumns: mobile ? "1fr" : "auto 1fr auto",
          gap: mobile ? 24 : 40,
          alignItems: "center",
        }}>
          <div style={{
            background: "var(--fg-on-deep)",
            padding: 12,
            borderRadius: 12,
            width: 120, height: 120,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <MiniQR fg="#0E0E0C" size={96} />
          </div>
          <div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.6, marginBottom: 8 }}>
              Bônus pra quem tem balcão
            </div>
            <div style={{ fontSize: mobile ? 22 : 30, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.15, maxWidth: 560 }}>
              QR code pra colar no balcão. Cliente escaneia, vê seu catálogo e pede com retirada no local.
            </div>
          </div>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12, letterSpacing: "0.05em", opacity: 0.7,
            textAlign: mobile ? "left" : "right",
          }}>
            ZERO<br/>CONFIGURAÇÃO<br/>EXTRA
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ─── 7. Benefits ──────────────────────────────────────────────────────
const BENEFITS = [
  { num: "01", title: "Sua loja no ar sem depender de ninguém", body: "Chega de esperar programador ou pagar agência. Você publica sozinho — em minutos." },
  { num: "02", title: "Clientes te acham no Google", body: "O SEO já vem ativado desde o primeiro dia. Sem configurar nada, sem plugin, sem manual." },
  { num: "03", title: "Vende mesmo fora do horário", body: "Sua loja trabalha enquanto você descansa, almoça, dorme. 24/7, sem extras." },
  { num: "04", title: "QR code no balcão", body: "Cliente escaneia, vê o catálogo e já faz o pedido — pra retirar na hora ou agendar." },
  { num: "05", title: "Aceita retirada local", body: "Une o online com seu ponto físico. Cliente pede pelo celular e busca quando passa." },
  { num: "06", title: "Cabe no caixa", body: "Por menos de R$ 2 por dia, você tem presença profissional no digital. Sem taxa de venda." },
  { num: "07", title: "Zero enrolação técnica", body: "Domínio e design já prontos. Você cuida do produto. A gente cuida da plataforma." },
];

function BenefitsSection({ mobile }) {
  return (
    <section className="section section-tight" id="beneficios">
      <Reveal>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: mobile ? 36 : 56 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>004 · O que você ganha</div>
            <h2 className="display-md" style={{ fontSize: "var(--t-h2)", maxWidth: 720 }}>
              Sete coisas que você <em style={{ color: "var(--accent)", fontStyle: "normal" }}>não precisa fazer</em> mais.
            </h2>
          </div>
          {!mobile && <div className="mono muted" style={{ fontSize: 13 }}>07 / 07</div>}
        </div>
      </Reveal>

      <div className="benefit-grid">
        {BENEFITS.map((b, i) => (
          <div key={b.num} className="benefit-cell" style={{
            gridColumn: !mobile && i === 6 ? "span 3" : "auto",
            background: i === 6 ? "var(--bg-tinted)" : "var(--bg)",
          }}>
            <div className="benefit-num">{b.num}</div>
            <div className="benefit-title">{b.title}</div>
            <div className="benefit-body">{b.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── 8. Social proof ─────────────────────────────────────────────────
function ProofSection({ mobile }) {
  const testimonials = [
    {
      quote: "Abri minha loja em [X] minutos e já recebi meu primeiro pedido em [Y] dias. Coisa que eu adiava fazia 2 anos.",
      name: "[Nome do cliente]", role: "[Segmento]", city: "[Cidade]",
      initials: "C1", angle: "resultado",
    },
    {
      quote: "Nunca mexi com tecnologia. Achei que ia precisar contratar alguém. Consegui sozinho — em uma tarde.",
      name: "[Nome do cliente]", role: "[Segmento]", city: "[Cidade]",
      initials: "C2", angle: "facilidade",
    },
    {
      quote: "Pago R$ 50 e já recuperei isso em vendas no primeiro mês. A partir do segundo é só margem.",
      name: "[Nome do cliente]", role: "[Segmento]", city: "[Cidade]",
      initials: "C3", angle: "custo-benefício",
    },
  ];

  return (
    <section className="section section-deep">
      <Reveal>
        <div className="stat-row" style={{ flexWrap: "wrap", gap: mobile ? 8 : 16 }}>
          <span className="stat-big">+[500]</span>
          <span style={{ fontSize: mobile ? 18 : 24, fontWeight: 500, color: "color-mix(in oklab, var(--fg-on-deep) 75%, transparent)", letterSpacing: "-0.02em", maxWidth: 420 }}>
            lojas abertas no Negócio Express
            <span style={{ display: "block", fontSize: 13, opacity: 0.55, marginTop: 6, fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              [substituir pelo número real]
            </span>
          </span>
        </div>
      </Reveal>

      <div style={{
        marginTop: mobile ? 36 : 64,
        display: "grid",
        gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)",
        gap: 18,
      }}>
        {testimonials.map((t, i) => (
          <Reveal key={i} delay={i * 100}>
            <div className="quote" style={{
              background: "color-mix(in oklab, var(--fg-on-deep) 4%, transparent)",
              borderColor: "color-mix(in oklab, var(--fg-on-deep) 12%, transparent)",
              color: "var(--fg-on-deep)",
              height: "100%",
            }}>
              <div className="mono" style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.5 }}>
                Foco: {t.angle}
              </div>
              <div style={{ fontSize: 17, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.45 }}>
                "{t.quote}"
              </div>
              <div className="quote-meta" style={{ color: "color-mix(in oklab, var(--fg-on-deep) 60%, transparent)", marginTop: "auto" }}>
                <div className="avatar" style={{ background: "color-mix(in oklab, var(--fg-on-deep) 14%, transparent)", color: "var(--fg-on-deep)", borderColor: "transparent" }}>{t.initials}</div>
                <div>
                  <div style={{ color: "var(--fg-on-deep)", fontWeight: 500 }}>{t.name}</div>
                  <div>{t.role} · {t.city}</div>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={400}>
        <div style={{ marginTop: 40, padding: "16px 18px", border: "1px dashed color-mix(in oklab, var(--fg-on-deep) 22%, transparent)", borderRadius: 10, fontSize: 12, color: "color-mix(in oklab, var(--fg-on-deep) 55%, transparent)", fontFamily: "var(--font-mono)", letterSpacing: "0.02em" }}>
          ⚠ Placeholder — depoimentos a capturar antes da publicação. Priorizar resultado quantitativo (tempo, valor, pedidos).
        </div>
      </Reveal>
    </section>
  );
}

Object.assign(window, { Nav, Hero, PainSection, SolutionSection, BenefitsSection, ProofSection, Reveal, Icon, HEADLINES, CTAS });
