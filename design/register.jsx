// ============================================================================
// TELA 2 — CADASTRO DO LOJISTA  (wizard de 3 etapas)
//   Etapa 1 — Dados pessoais
//   Etapa 2 — Dados da loja   (Nome, Slug, CNPJ, E-mail, Telefone, Segmento)
//   Etapa 3 — Plano (preview)
// ============================================================================

const SEGMENTOS = [
  { key: "restaurante", label: "Restaurante",  icon: "UtensilsCrossed" },
  { key: "padaria",     label: "Padaria",      icon: "Croissant" },
  { key: "salao",       label: "Salão / Beleza", icon: "Scissors" },
  { key: "moda",        label: "Moda & Roupas", icon: "Shirt" },
  { key: "petshop",     label: "Pet Shop",     icon: "PawPrint" },
  { key: "farmacia",    label: "Farmácia",     icon: "Pill" },
  { key: "mercado",     label: "Mercado",      icon: "ShoppingBasket" },
  { key: "outros",      label: "Outros",       icon: "Store" },
];

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatPhoneBR(raw) {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function formatCNPJ(raw) {
  const d = raw.replace(/\D/g, "").slice(0, 14);
  let out = d;
  if (d.length > 2)  out = `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length > 5)  out = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length > 8)  out = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  if (d.length > 12) out = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  return out;
}

function RegisterScreen({ onNavigate }) {
  const [step, setStep] = React.useState(1);
  const [slugEdited, setSlugEdited] = React.useState(false);
  const [form, setForm] = React.useState({
    // Etapa 1
    nome: "João Almeida",
    email: "",
    telefone: "",
    senha: "",
    confirmar: "",
    aceito: false,
    // Etapa 2
    nomeLoja: "",
    slug: "",
    cnpj: "",
    emailLoja: "",
    telLoja: "",
    segmento: "",
  });
  const [errors, setErrors] = React.useState({});
  const update = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  // Slug acompanha o nome da loja até o usuário editá-lo manualmente
  const onNomeLojaChange = (v) => {
    setForm((f) => ({
      ...f,
      nomeLoja: v,
      slug: slugEdited ? f.slug : slugify(v),
    }));
  };
  const onSlugChange = (v) => {
    setSlugEdited(true);
    setForm((f) => ({ ...f, slug: slugify(v) }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.nome.trim()) e.nome = "Informe seu nome completo.";
    if (!form.email.includes("@")) e.email = "E-mail inválido.";
    if (form.telefone.replace(/\D/g, "").length < 10) e.telefone = "WhatsApp incompleto.";
    if (form.senha.length < 6) e.senha = "Mínimo de 6 caracteres.";
    if (form.confirmar !== form.senha) e.confirmar = "As senhas não coincidem.";
    if (!form.aceito) e.aceito = "Você precisa aceitar os termos.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.nomeLoja.trim()) e.nomeLoja = "Informe o nome da loja.";
    if (form.slug.length < 3) e.slug = "Escolha um endereço com ao menos 3 letras.";
    // CNPJ é opcional (pessoa física / MEI pode não ter) — valida formato só quando preenchido
    const cnpjDigits = form.cnpj.replace(/\D/g, "");
    if (cnpjDigits.length > 0 && cnpjDigits.length !== 14) e.cnpj = "CNPJ deve ter 14 dígitos.";
    if (!form.emailLoja.includes("@")) e.emailLoja = "E-mail da loja inválido.";
    if (form.telLoja.replace(/\D/g, "").length < 10) e.telLoja = "Telefone incompleto.";
    if (!form.segmento) e.segmento = "Selecione o segmento do seu negócio.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleStep1 = () => {
    if (validateStep1()) {
      setErrors({});
      // pré-preenche e-mail/telefone da loja com os dados pessoais como atalho
      setForm((f) => ({
        ...f,
        emailLoja: f.emailLoja || f.email,
        telLoja: f.telLoja || f.telefone,
      }));
      setStep(2);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  const handleStep2 = () => {
    if (validateStep2()) {
      setErrors({});
      setStep(3);
      // segue para a escolha de plano
      setTimeout(() => onNavigate("PLAN"), 450);
    }
  };

  const goBack = () => {
    setErrors({});
    setStep(1);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <div className="min-h-screen w-full bg-white screen-enter">
      {/* Header com logo */}
      <header className="w-full px-6 py-6 flex items-center justify-between">
        <a onClick={() => onNavigate("LOGIN")} className="cursor-pointer">
          <Logo size="md" />
        </a>
        <button
          onClick={() => onNavigate("LOGIN")}
          className="text-sm text-ink-500 hover:text-ink-900 transition-colors inline-flex items-center gap-1.5"
        >
          <Icon name="ArrowLeft" size={15} /> Voltar para o login
        </button>
      </header>

      <main className="w-full px-6 pb-16">
        <div className="mx-auto max-w-[520px] pt-6">
          {/* Título */}
          <div className="text-center">
            <h1 className="font-display font-extrabold text-[34px] leading-tight tracking-tight text-ink-900">
              {step === 1 ? "Crie sua conta grátis" : step === 2 ? "Dados da sua loja" : "Tudo pronto!"}
            </h1>
            <p className="mt-2 text-ink-500 text-[15px]">
              {step === 1
                ? "Comece em 2 minutos. Sem cartão de crédito."
                : step === 2
                ? "Essas informações aparecem na vitrine pública da sua loja."
                : "Estamos preparando seu painel..."}
            </p>
          </div>

          {/* Step indicator */}
          <div className="mt-10">
            <StepIndicator
              steps={["Dados pessoais", "Dados da loja", "Plano"]}
              current={step}
            />
          </div>

          {/* ----------------------------- ETAPA 1 ----------------------------- */}
          {step === 1 && (
            <React.Fragment>
              <Card className="mt-8 p-7 screen-enter">
                <div className="space-y-4">
                  <Input
                    label="Nome completo"
                    value={form.nome}
                    onChange={update("nome")}
                    placeholder="Como você quer ser chamado(a)"
                    icon="User"
                    error={errors.nome}
                  />
                  <Input
                    label="E-mail"
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    placeholder="voce@exemplo.com.br"
                    icon="Mail"
                    error={errors.email}
                  />
                  <Input
                    label="WhatsApp / Telefone"
                    value={form.telefone}
                    onChange={(v) => update("telefone")(formatPhoneBR(v))}
                    placeholder="(11) 98765-4321"
                    icon="Phone"
                    error={errors.telefone}
                    hint={!errors.telefone && "Usamos para enviar notificações de pedidos."}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PasswordInput
                      label="Senha"
                      value={form.senha}
                      onChange={update("senha")}
                      placeholder="Mín. 6 caracteres"
                      icon="Lock"
                      error={errors.senha}
                    />
                    <PasswordInput
                      label="Confirmar senha"
                      value={form.confirmar}
                      onChange={update("confirmar")}
                      placeholder="Repita a senha"
                      icon="Lock"
                      error={errors.confirmar}
                    />
                  </div>

                  <div className="pt-2">
                    <Checkbox checked={form.aceito} onChange={update("aceito")}>
                      Li e aceito os{" "}
                      <a className="text-brand-700 font-medium hover:underline cursor-pointer">Termos de Uso</a>{" "}
                      e a{" "}
                      <a className="text-brand-700 font-medium hover:underline cursor-pointer">Política de Privacidade</a>.
                    </Checkbox>
                    {errors.aceito && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <Icon name="AlertCircle" size={13} /> {errors.aceito}
                      </p>
                    )}
                  </div>

                  <Button fullWidth size="lg" onClick={handleStep1} iconRight="ArrowRight">
                    Continuar
                  </Button>
                </div>
              </Card>

              {/* Preview das próximas etapas */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3">
                <PreviewStep icon="Store" number="2" title="Dados da loja" desc="Nome, endereço web e segmento da sua loja." />
                <PreviewStep icon="CreditCard" number="3" title="Escolha do plano" desc="Comece no plano grátis. Mude quando quiser." />
              </div>
            </React.Fragment>
          )}

          {/* ----------------------------- ETAPA 2 ----------------------------- */}
          {step === 2 && (
            <Card className="mt-8 p-7 screen-enter">
              <div className="space-y-4">
                <Input
                  label="Nome da loja"
                  value={form.nomeLoja}
                  onChange={onNomeLojaChange}
                  placeholder="Ex: Padaria do João"
                  icon="Store"
                  error={errors.nomeLoja}
                />

                {/* Slug com prefixo de domínio */}
                <SlugInput
                  value={form.slug}
                  onChange={onSlugChange}
                  error={errors.slug}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="CNPJ (opcional)"
                    value={form.cnpj}
                    onChange={(v) => update("cnpj")(formatCNPJ(v))}
                    placeholder="00.000.000/0000-00"
                    icon="Building2"
                    error={errors.cnpj}
                    hint={!errors.cnpj && "Pessoa física? Pode deixar em branco."}
                  />
                  <Input
                    label="Telefone da loja"
                    value={form.telLoja}
                    onChange={(v) => update("telLoja")(formatPhoneBR(v))}
                    placeholder="(11) 3333-4444"
                    icon="Phone"
                    error={errors.telLoja}
                  />
                </div>

                <Input
                  label="E-mail de contato"
                  type="email"
                  value={form.emailLoja}
                  onChange={update("emailLoja")}
                  placeholder="contato@sualoja.com.br"
                  icon="Mail"
                  error={errors.emailLoja}
                />

                {/* Segmento */}
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">Segmento do negócio</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {SEGMENTOS.map((s) => {
                      const active = form.segmento === s.key;
                      return (
                        <button
                          key={s.key}
                          type="button"
                          onClick={() => update("segmento")(s.key)}
                          className={`flex flex-col items-center justify-center gap-2 py-3.5 px-2 rounded-xl border text-center transition-all
                            ${active
                              ? "border-brand-600 bg-brand-50 ring-2 ring-brand-100"
                              : "border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50"}`}
                        >
                          <span className={`h-9 w-9 rounded-lg grid place-items-center transition-colors
                            ${active ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-500"}`}>
                            <Icon name={s.icon} size={18} />
                          </span>
                          <span className={`text-[12.5px] font-medium leading-tight ${active ? "text-brand-800" : "text-ink-700"}`}>
                            {s.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.segmento && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                      <Icon name="AlertCircle" size={13} /> {errors.segmento}
                    </p>
                  )}
                </div>

                {/* Ações */}
                <div className="flex items-center gap-3 pt-2">
                  <Button variant="secondary" size="lg" icon="ArrowLeft" onClick={goBack}>
                    Voltar
                  </Button>
                  <Button fullWidth size="lg" onClick={handleStep2} iconRight="ArrowRight">
                    Continuar
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* ----------------------------- ETAPA 3 ----------------------------- */}
          {step === 3 && (
            <Card className="mt-8 p-10 text-center screen-enter">
              <div className="mx-auto h-14 w-14 rounded-full bg-brand-100 text-brand-700 grid place-items-center">
                <Icon name="CheckCircle2" size={28} />
              </div>
              <h3 className="mt-4 font-display font-extrabold text-xl text-ink-900">Conta criada com sucesso</h3>
              <p className="mt-1.5 text-ink-500 text-sm">Vamos escolher o seu plano...</p>
              <div className="mt-6 h-1 w-40 mx-auto rounded-full bg-ink-100 overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full animate-pulse" style={{ width: "70%" }} />
              </div>
            </Card>
          )}

          {step !== 3 && (
            <p className="mt-8 text-center text-sm text-ink-500">
              Já tem conta?{" "}
              <a
                onClick={() => onNavigate("LOGIN")}
                className="font-semibold text-brand-700 hover:text-brand-800 hover:underline cursor-pointer"
              >
                Entrar
              </a>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

// ---------- Slug input com prefixo de domínio --------------------------------
function SlugInput({ value, onChange, error }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-ink-700 mb-1.5">Endereço da loja (slug)</label>
      <div
        className={`flex items-stretch rounded-lg border overflow-hidden transition-all
          ${error ? "border-red-400 ring-2 ring-red-100"
            : focused ? "border-brand-600 ring-2 ring-brand-100" : "border-ink-200 hover:border-ink-300"}`}
      >
        <span className="flex items-center gap-1.5 px-3.5 bg-ink-50 border-r border-ink-200 text-ink-500 text-[13.5px] whitespace-nowrap">
          <Icon name="Link" size={15} />
          negocioexpress.com.br/
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="padaria-do-joao"
          className="flex-1 min-w-0 bg-white px-3 py-3 text-[15px] text-ink-900 placeholder-ink-400 focus:outline-none"
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
          <Icon name="AlertCircle" size={13} /> {error}
        </p>
      ) : (
        <p className="mt-1.5 text-xs text-ink-500 flex items-center gap-1">
          <Icon name="Check" size={13} className="text-brand-600" /> Disponível · este será o link público da sua loja.
        </p>
      )}
    </div>
  );
}

function PreviewStep({ icon, number, title, desc }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-dashed border-ink-200 bg-ink-50/60">
      <span className="h-10 w-10 rounded-lg bg-white border border-ink-200 grid place-items-center text-ink-500">
        <Icon name={icon} size={18} />
      </span>
      <div>
        <div className="text-xs uppercase tracking-wide font-semibold text-ink-400">Etapa {number}</div>
        <div className="text-[15px] font-display font-semibold text-ink-900 leading-snug">{title}</div>
        <div className="text-sm text-ink-500 leading-snug mt-0.5">{desc}</div>
      </div>
    </div>
  );
}

window.RegisterScreen = RegisterScreen;
