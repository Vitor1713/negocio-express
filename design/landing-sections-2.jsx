// landing-sections-2.jsx
// Offer, objections, guarantee, urgency, FAQ, final CTA, PS, footer, signup modal.

const { useState: useState2, useEffect: useEffect2, useRef: useRef2 } = React;

// ─── 9. Offer / pricing ──────────────────────────────────────────────
function OfferSection({ tweaks, onCta, mobile }) {
  const cta = CTAS[tweaks.ctaVariant] || CTAS.A;
  const features = [
    "Loja online completa e pronta pra vender",
    "Domínio incluído — sem pagar à parte",
    "Design configurado — sem contratar designer",
    "SEO automático — Google indexa sua loja",
    "QR code pra usar no seu ponto físico",
    "Suporte a retirada local",
    "Suporte via chat em dias úteis",
    "1 mês grátis pra testar sem risco",
  ];
  return (
    <section className="section" id="preco">
      <Reveal>
        <div style={{ maxWidth: 760, marginBottom: mobile ? 32 : 56 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>005 · A oferta</div>
          <h2 className="display-md" style={{ fontSize: "var(--t-h2)" }}>
            Tudo que você precisa pra abrir a loja. <em style={{ color: "var(--accent)", fontStyle: "normal" }}>Em um preço só.</em>
          </h2>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="price-card">
          <div className="price-feat">
            <div className="mono" style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-tertiary)", marginBottom: 8 }}>
              O que está incluído
            </div>
            <div style={{ fontSize: mobile ? 24 : 30, fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1.1 }}>
              Negócio Express <em style={{ fontStyle: "normal", color: "var(--fg-secondary)" }}>completo</em>
            </div>
            <ul>
              {features.map((f, i) => (
                <li key={i}>
                  <Icon.check />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="price-amount">
            <div style={{
              display: "inline-flex",
              padding: "5px 10px",
              borderRadius: 999,
              background: "color-mix(in oklab, var(--accent) 25%, transparent)",
              color: "var(--fg-on-deep)",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              width: "fit-content",
            }}>
              <span style={{ marginRight: 6 }}>●</span> 1º mês grátis
            </div>

            <div>
              <div style={{ fontSize: 14, opacity: 0.65, marginBottom: 6 }}>Depois do teste</div>
              <div className="price-big tnum">
                <sup>R$</sup>50<sub>/mês</sub>
              </div>
              <div style={{ fontSize: 14, opacity: 0.65, marginTop: 6 }}>
                Menos de <span className="tnum" style={{ color: "var(--fg-on-deep)" }}>R$ 2 por dia</span>.
              </div>
            </div>

            <button
              className="btn btn-lg"
              onClick={onCta}
              style={{
                background: "var(--fg-on-deep)",
                color: "var(--bg-deep)",
                marginTop: "auto",
              }}
            >
              {cta.primary} <Icon.arrow />
            </button>

            <div style={{ fontSize: 12, opacity: 0.55, lineHeight: 1.45, fontFamily: "var(--font-mono)", letterSpacing: "0.02em" }}>
              Nenhuma taxa de setup. Nenhum contrato de fidelidade. Cancela quando quiser.
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ─── 10. Objections ──────────────────────────────────────────────────
const OBJECTIONS = [
  {
    q: "Meu negócio é muito pequeno pra ter loja online.",
    a: "Esse é exatamente o perfil de quem mais se beneficia. Grandes redes já estão no digital faz tempo — você precisa chegar lá antes que o atraso custe mais caro.",
  },
  {
    q: "Não entendo nada de tecnologia.",
    a: "Não precisa entender. O design já vem pronto, o domínio já vem configurado, o SEO já trabalha sozinho. Sua parte é cadastrar produto e receber pedido.",
  },
  {
    q: "R$ 50 é mais uma conta no fim do mês.",
    a: "Um único pedido a mais por mês já paga a mensalidade. E você tem 30 dias grátis pra confirmar isso antes de pagar qualquer coisa.",
  },
  {
    q: "Já tentei montar loja antes e foi um pesadelo.",
    a: "Porque as outras plataformas foram feitas por técnicos, pra técnicos. O Negócio Express foi feito pra quem tem negócio pra tocar, não tempo pra aprender ferramenta.",
  },
  {
    q: "E se eu não gostar?",
    a: "Você cancela quando quiser. Sem multa, sem burocracia, sem ligação de retenção.",
  },
];

function ObjectionsSection({ mobile }) {
  const [open, setOpen] = useState2(0);
  return (
    <section className="section section-tinted">
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1.6fr", gap: mobile ? 28 : 72 }}>
        <Reveal>
          <div style={{ position: mobile ? "static" : "sticky", top: 100 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>006 · O que pode estar te segurando</div>
            <h2 className="display-md" style={{ fontSize: "var(--t-h2)" }}>
              As 5 dúvidas que <em style={{ color: "var(--accent)", fontStyle: "normal" }}>todo mundo</em> tem.
            </h2>
            <p className="muted" style={{ marginTop: 18, fontSize: 16, maxWidth: 360 }}>
              Você não é o primeiro a pensar isso. E provavelmente nem o décimo. Aqui vão as respostas, na real.
            </p>
          </div>
        </Reveal>
        <div>
          {OBJECTIONS.map((o, i) => (
            <div key={i} className={`acc-row ${open === i ? "open" : ""}`} onClick={() => setOpen(open === i ? -1 : i)}>
              <div className="acc-head">
                <span>"{o.q}"</span>
                <span className="acc-icon">
                  <Icon.plus />
                </span>
              </div>
              <div className="acc-body">{o.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 11. Guarantee ───────────────────────────────────────────────────
function GuaranteeSection({ mobile }) {
  return (
    <section className="section section-tight">
      <Reveal>
        <div className="guarantee-strip">
          <div className="guarantee-seal">
            <div>
              30<br/>DIAS<br/>GRÁTIS
            </div>
          </div>
          <div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.6, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <Icon.shield width="14" height="14" /> Garantia
            </div>
            <div style={{ fontSize: mobile ? 22 : 30, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Teste por 30 dias <em style={{ fontStyle: "normal", opacity: 0.7 }}>sem pagar nada.</em>
            </div>
            <p style={{ marginTop: 12, fontSize: 15, opacity: 0.75, maxWidth: 600, lineHeight: 1.45 }}>
              Você abre sua loja, usa a plataforma completa e só decide se vale a pena depois de 1 mês inteiro de uso real. Se não fizer sentido pro seu negócio, cancela sem custo, sem pergunta, sem enrolação.
            </p>
          </div>
          <div style={{
            textAlign: mobile ? "left" : "right",
            fontSize: mobile ? 16 : 18,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            opacity: 0.85,
            maxWidth: 160,
          }}>
            O risco é todo nosso.
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ─── 12. Urgency ─────────────────────────────────────────────────────
function UrgencySection({ mobile }) {
  return (
    <section className="section section-tight">
      <Reveal>
        <div className="urgency-bar" style={{ maxWidth: 820 }}>
          <span className="dot"></span>
          <div style={{ flex: 1 }}>
            <strong style={{ fontWeight: 600 }}>Atenção:</strong>
            <span className="muted"> o teste grátis de 1 mês é uma oferta de entrada — pode ser encerrada a qualquer momento conforme a demanda.</span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ─── 13. FAQ ─────────────────────────────────────────────────────────
const FAQ = [
  { q: "Quanto tempo leva pra minha loja ficar no ar?", a: "Você cadastra seus produtos e já está vendendo. Não tem prazo de espera, não tem aprovação manual." },
  { q: "Funciona pra qualquer tipo de negócio?", a: "Sim. Loja de roupas, pet shop, açougue, farmácia, restaurante, papelaria — qualquer segmento pode usar." },
  { q: "Preciso ter ponto físico?", a: "Não. Mas se tiver, o QR code e a opção de retirada local são diferenciais que fazem muita diferença na experiência do cliente." },
  { q: "E se eu não gostar? Perco o dinheiro?", a: "Não perde nada — o primeiro mês é grátis. E mesmo depois, cancela quando quiser sem custo." },
  { q: "Tem suporte se eu travar em alguma coisa?", a: "Sim. Suporte via chat em dias úteis pra te ajudar sempre que precisar." },
  { q: "Quais formas de pagamento aceitas?", a: "[A confirmar — cartão, Pix, boleto?]" },
  { q: "Tem limite de produtos cadastrados?", a: "[A confirmar conforme o plano atual]" },
  { q: "Minha loja vai aparecer no Google?", a: "Sim. O SEO automático já trabalha isso por você desde o primeiro dia." },
];

function FAQSection({ mobile }) {
  const [open, setOpen] = useState2(0);
  return (
    <section className="section" id="faq">
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1.6fr", gap: mobile ? 28 : 72 }}>
        <Reveal>
          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>007 · Perguntas</div>
            <h2 className="display-md" style={{ fontSize: "var(--t-h2)" }}>
              Tudo que você quer <em style={{ color: "var(--accent)", fontStyle: "normal" }}>saber antes.</em>
            </h2>
            <p className="muted" style={{ marginTop: 18, fontSize: 16, maxWidth: 360 }}>
              Não achou sua dúvida aqui? <a href="#chat" style={{ color: "var(--fg)", borderBottom: "1px solid var(--border-strong)" }}>Manda mensagem pro nosso chat</a> — responde em dia útil.
            </p>
          </div>
        </Reveal>
        <div>
          {FAQ.map((f, i) => (
            <div key={i} className={`acc-row ${open === i ? "open" : ""}`} onClick={() => setOpen(open === i ? -1 : i)}>
              <div className="acc-head">
                <span>{f.q}</span>
                <span className="acc-icon">
                  <Icon.plus />
                </span>
              </div>
              <div className="acc-body">{f.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 14. Final CTA ───────────────────────────────────────────────────
function FinalCTA({ tweaks, onCta, mobile }) {
  // Final CTA uses the alternate variant for variety (vary copy through page)
  const altKey = tweaks.ctaVariant === "A" ? "B" : "A";
  const cta = CTAS[altKey];
  return (
    <section className="section section-deep">
      <div style={{ maxWidth: 920 }}>
        <Reveal>
          <div className="eyebrow" style={{ marginBottom: 24, color: "color-mix(in oklab, var(--fg-on-deep) 55%, transparent)" }}>
            008 · A hora é agora
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="display" style={{ fontSize: mobile ? 40 : 72 }}>
            Seu concorrente <em style={{ fontStyle: "normal", color: "color-mix(in oklab, var(--fg-on-deep) 55%, transparent)" }}>já está no digital.</em>
            <br/>
            Seu cliente <em style={{ fontStyle: "normal", color: "color-mix(in oklab, var(--fg-on-deep) 55%, transparent)" }}>já pesquisa no Google.</em>
            <br/>
            <span style={{ color: "var(--accent)" }}>Você pode esperar.</span> Ou abrir sua loja agora.
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <div style={{ marginTop: 40, display: "flex", flexDirection: mobile ? "column" : "row", alignItems: mobile ? "stretch" : "center", gap: 18 }}>
            <button className="btn btn-lg" onClick={onCta} style={{
              background: "var(--fg-on-deep)", color: "var(--bg-deep)",
            }}>
              {cta.primary} <Icon.arrow />
            </button>
            <div className="cta-fine" style={{ color: "color-mix(in oklab, var(--fg-on-deep) 55%, transparent)" }}>
              Sem cartão<span className="dot"></span>Sem contrato<span className="dot"></span>Cancela quando quiser
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── 15. PS ──────────────────────────────────────────────────────────
function PSBlock({ tweaks, onCta, mobile }) {
  const cta = CTAS[tweaks.ctaVariant] || CTAS.A;
  return (
    <section className="section section-tight">
      <Reveal>
        <div style={{
          display: "grid",
          gridTemplateColumns: mobile ? "1fr" : "auto 1fr auto",
          gap: mobile ? 24 : 64,
          alignItems: "start",
          padding: mobile ? 28 : "48px 56px",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)",
        }}>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600,
            letterSpacing: "0.04em", color: "var(--accent)", paddingTop: 4,
          }}>
            P.S.
          </div>
          <div className="ps-block" style={{ maxWidth: 620 }}>
            O teste grátis não dura pra sempre. <strong>Se você chegou até aqui, já sabe que precisa disso.</strong> A única diferença entre quem vende online e quem não vende é quem deu o primeiro passo.
            <br/><br/>
            Clica no botão. Abre sua loja. Você decide o resto depois.
          </div>
          <button className="btn btn-primary btn-lg" onClick={onCta} style={{ alignSelf: mobile ? "stretch" : "center" }}>
            {cta.primary} <Icon.arrow />
          </button>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────
function Footer({ mobile }) {
  return (
    <div className="foot">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className="logo-mark" style={{ width: 22, height: 22, fontSize: 11 }}>NE</span>
        <span>Negócio Express · © 2026</span>
      </div>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <a href="#" style={{ color: "var(--fg-secondary)" }}>Termos</a>
        <a href="#" style={{ color: "var(--fg-secondary)" }}>Privacidade · LGPD</a>
        <a href="#" style={{ color: "var(--fg-secondary)" }}>Suporte</a>
        <a href="#" style={{ color: "var(--fg-secondary)" }}>contato@negocioexpress.com.br</a>
      </div>
    </div>
  );
}

// ─── Signup modal (3-step) ──────────────────────────────────────────
function SignupModal({ open, onClose, mobile }) {
  const [step, setStep] = useState2(0);
  const [data, setData] = useState2({ tipo: "", nome: "", email: "", whatsapp: "" });

  useEffect2(() => { if (!open) { setStep(0); setData({ tipo: "", nome: "", email: "", whatsapp: "" }); } }, [open]);

  const tipos = [
    { id: "comida", name: "Comida / Bebida", desc: "Restaurante, bar, padaria, doceria" },
    { id: "varejo", name: "Varejo", desc: "Roupas, papelaria, presentes" },
    { id: "servico", name: "Serviços", desc: "Pet shop, salão, oficina" },
    { id: "outro", name: "Outro", desc: "Conta pra gente depois" },
  ];

  const stepLabel = ["1 de 3 · Seu negócio", "2 de 3 · Seus dados", "3 de 3 · Quase lá"];

  return (
    <div className={`modal-backdrop ${open ? "open" : ""}`} onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ position: "relative" }}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 3l8 8M11 3l-8 8"/></svg>
        </button>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-tertiary)" }}>
            {step < 3 ? stepLabel[step] : "Pronto"}
          </div>
        </div>

        <div className="progress-track">
          <div className="progress-bar" style={{ width: `${((step + 1) / 3) * 100}%` }}></div>
        </div>

        {step === 0 && (
          <>
            <h3 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
              Qual é o seu tipo de negócio?
            </h3>
            <div style={{ display: "grid", gap: 8, marginTop: 4 }}>
              {tipos.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setData({ ...data, tipo: t.id })}
                  style={{
                    textAlign: "left",
                    padding: "14px 16px",
                    background: data.tipo === t.id ? "var(--accent-soft)" : "var(--bg)",
                    border: `1px solid ${data.tipo === t.id ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: "var(--r-md)",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    color: "var(--fg)",
                    transition: "background .15s, border-color .15s",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{t.name}</div>
                  <div style={{ fontSize: 13, color: "var(--fg-secondary)", marginTop: 2 }}>{t.desc}</div>
                </button>
              ))}
            </div>
            <button className="btn btn-primary" onClick={() => setStep(1)} disabled={!data.tipo} style={{ opacity: data.tipo ? 1 : 0.5 }}>
              Continuar <Icon.arrow />
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <h3 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
              Como a gente te chama?
            </h3>
            <div>
              <label>Nome</label>
              <input value={data.nome} onChange={(e) => setData({ ...data, nome: e.target.value })} placeholder="Maria Silva" />
            </div>
            <div>
              <label>Email</label>
              <input value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} placeholder="maria@email.com" type="email" />
            </div>
            <div>
              <label>WhatsApp</label>
              <input value={data.whatsapp} onChange={(e) => setData({ ...data, whatsapp: e.target.value })} placeholder="(71) 99999-9999" />
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.4, marginTop: 6 }}>
              <input type="checkbox" defaultChecked style={{ marginTop: 2 }} />
              <span>Ao criar sua conta, você concorda com nossa <a style={{ color: "var(--fg)", borderBottom: "1px solid var(--border-strong)" }} href="#">Política de Privacidade</a> e com o tratamento dos seus dados conforme a LGPD.</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => setStep(0)} style={{ flex: 1 }}>Voltar</button>
              <button className="btn btn-primary" onClick={() => setStep(2)} disabled={!data.nome || !data.email} style={{ flex: 2, opacity: (data.nome && data.email) ? 1 : 0.5 }}>
                Abrir minha loja <Icon.arrow />
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{
              width: 56, height: 56, borderRadius: 28,
              background: "var(--accent-soft)", color: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "8px 0",
            }}>
              <Icon.check width="28" height="28" />
            </div>
            <h3 style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              Loja criada{data.nome ? `, ${data.nome.split(" ")[0]}` : ""}!
            </h3>
            <p style={{ fontSize: 15, color: "var(--fg-secondary)", lineHeight: 1.5 }}>
              Em alguns segundos você recebe um email com o link de acesso. Você tem <strong style={{ color: "var(--fg)" }}>30 dias grátis</strong> pra cadastrar produtos, configurar entrega e começar a vender.
            </p>
            <div style={{
              background: "var(--bg-tinted)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-md)",
              padding: 14,
              fontSize: 13, color: "var(--fg-secondary)",
            }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-tertiary)", marginBottom: 4 }}>
                Próximo passo
              </div>
              Cadastre 3 produtos pra colocar sua loja no ar hoje.
            </div>
            <button className="btn btn-primary" onClick={onClose}>
              Entendi <Icon.arrow />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { OfferSection, ObjectionsSection, GuaranteeSection, UrgencySection, FAQSection, FinalCTA, PSBlock, Footer, SignupModal });
