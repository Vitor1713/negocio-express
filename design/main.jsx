// main.jsx
// Top-level app: DesignCanvas hosting mobile + desktop Landing artboards,
// shared tweaks panel that mutates a single source of truth for both.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "headline": "C",
  "ctaVariant": "A",
  "accent": "verde",
  "dark": false,
  "showHeroChips": true
}/*EDITMODE-END*/;

const ACCENTS = {
  verde:   { name: "Verde",   hex: "#2E8957", hover: "#26744A", soft: "#E7F3EC", darkSoft: "#1F2E26" },
  coral:   { name: "Coral",   hex: "#E16545", hover: "#C9533A", soft: "#FBEAE3", darkSoft: "#33231D" },
  indigo:  { name: "Indigo",  hex: "#3A55D4", hover: "#2F47B8", soft: "#E6EAFB", darkSoft: "#1D2240" },
  carvao:  { name: "Carvão",  hex: "#2A2925", hover: "#000000", soft: "#EFEEE9", darkSoft: "#26251F" },
};

function applyTheme(root, t) {
  const a = ACCENTS[t.accent] || ACCENTS.verde;
  root.style.setProperty("--accent", a.hex);
  root.style.setProperty("--accent-hover", a.hover);
  root.style.setProperty("--accent-soft", t.dark ? a.darkSoft : a.soft);
  root.classList.toggle("dark", !!t.dark);
}

// ─── Landing ──────────────────────────────────────────────────────────
function Landing({ mode = "desktop", tweaks, label }) {
  const rootRef = React.useRef(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const mobile = mode === "mobile";

  React.useEffect(() => {
    if (rootRef.current) applyTheme(rootRef.current, tweaks);
  }, [tweaks]);

  const onCta = () => setModalOpen(true);

  return (
    <div ref={rootRef} className={`landing-root ${mobile ? "mobile" : ""}`} data-screen-label={label}>
      <Nav onCta={onCta} mobile={mobile} />
      <Hero tweaks={tweaks} onCta={onCta} mobile={mobile} />
      <PainSection mobile={mobile} />
      <SolutionSection mobile={mobile} />
      <BenefitsSection mobile={mobile} />
      <ProofSection mobile={mobile} />
      <OfferSection tweaks={tweaks} onCta={onCta} mobile={mobile} />
      <ObjectionsSection mobile={mobile} />
      <GuaranteeSection mobile={mobile} />
      <UrgencySection mobile={mobile} />
      <FAQSection mobile={mobile} />
      <FinalCTA tweaks={tweaks} onCta={onCta} mobile={mobile} />
      <PSBlock tweaks={tweaks} onCta={onCta} mobile={mobile} />
      <Footer mobile={mobile} />
      <SignupModal open={modalOpen} onClose={() => setModalOpen(false)} mobile={mobile} />
    </div>
  );
}

// ─── App: design canvas with mobile + desktop artboards ──────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Heights are tall — pages are long. The canvas zooms out so both fit.
  const DESKTOP_W = 1280;
  const DESKTOP_H = 5760;
  const MOBILE_W = 390;
  const MOBILE_H = 6800;

  return (
    <>
      <DesignCanvas>
        <DCSection id="landing" title="Negócio Express — landing page" subtitle="Mesma página em duas larguras. Use os tweaks pra alternar headline, CTA, cor de destaque e modo escuro.">
          <DCArtboard id="desktop" label="Desktop · 1280px" width={DESKTOP_W} height={DESKTOP_H}>
            <Landing mode="desktop" tweaks={t} label="Desktop" />
          </DCArtboard>
          <DCArtboard id="mobile" label="Mobile · 390px" width={MOBILE_W} height={MOBILE_H}>
            <Landing mode="mobile" tweaks={t} label="Mobile" />
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Conteúdo" />
        <TweakRadio
          label="Headline"
          value={t.headline}
          options={["A", "B", "C"]}
          onChange={(v) => setTweak("headline", v)}
        />
        <div style={{ fontSize: 10.5, color: "rgba(41,38,27,.55)", lineHeight: 1.4, marginTop: -4 }}>
          {t.headline === "A" && '"Sua loja online pronta. Sem complicação."'}
          {t.headline === "B" && '"Venda pela internet por menos de R$ 2 por dia."'}
          {t.headline === "C" && '"Seu negócio no digital hoje. Sem técnico, sem enrolação."'}
        </div>

        <TweakRadio
          label="CTA principal"
          value={t.ctaVariant}
          options={["A", "B"]}
          onChange={(v) => setTweak("ctaVariant", v)}
        />
        <div style={{ fontSize: 10.5, color: "rgba(41,38,27,.55)", lineHeight: 1.4, marginTop: -4 }}>
          {t.ctaVariant === "A" && '"Testar grátis por 1 mês"'}
          {t.ctaVariant === "B" && '"Abrir minha loja agora"'}
        </div>

        <TweakSection label="Visual" />
        <TweakColor
          label="Cor de destaque"
          value={(ACCENTS[t.accent] || ACCENTS.verde).hex}
          options={Object.values(ACCENTS).map((a) => a.hex)}
          onChange={(v) => {
            const key = Object.entries(ACCENTS).find(([_, a]) => a.hex === v)?.[0] || "verde";
            setTweak("accent", key);
          }}
        />
        <TweakToggle
          label="Modo escuro"
          value={t.dark}
          onChange={(v) => setTweak("dark", v)}
        />
        <TweakToggle
          label="Chips flutuantes no hero"
          value={t.showHeroChips}
          onChange={(v) => setTweak("showHeroChips", v)}
        />
      </TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
