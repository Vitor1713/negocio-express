// ============================================================================
// TELA 1 — LOGIN DO LOJISTA
// ============================================================================

function LoginScreen({ onNavigate }) {
  const [email, setEmail] = React.useState("joao@padariadojoao.com.br");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState({});

  const handleSubmit = () => {
    const e = {};
    if (!email.includes("@")) e.email = "Informe um e-mail válido.";
    if (password.length < 6) e.password = "A senha deve ter pelo menos 6 caracteres.";
    setErrors(e);
    if (Object.keys(e).length === 0) onNavigate("DASHBOARD");
  };

  const benefits = [
    { icon: "Store",       text: "Loja online em minutos" },
    { icon: "LayoutGrid",  text: "Painel simples e intuitivo" },
    { icon: "Clock",       text: "Aceite pedidos 24 horas por dia" },
  ];

  return (
    <div className="min-h-screen w-full flex screen-enter">
      {/* ---------------- Coluna esquerda ---------------- */}
      <aside className="hidden lg:flex relative w-1/2 bg-brand-600 text-white overflow-hidden">
        {/* dot grid pattern */}
        <div className="absolute inset-0 dot-grid opacity-80" />
        {/* shapes decorativas */}
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-brand-700/60 blur-2xl" />
        <div className="absolute -bottom-40 -left-20 w-[380px] h-[380px] rounded-full bg-brand-800/40 blur-3xl" />
        <div className="absolute top-1/2 -right-16 w-44 h-44 rounded-[28px] bg-white/10 rotate-12" />
        <div className="absolute top-24 right-24 w-20 h-20 rounded-2xl bg-white/10 rotate-6" />

        <div className="relative z-10 flex flex-col justify-between p-14 xl:p-16 w-full">
          <Logo variant="light" size="md" />

          <div className="max-w-md">
            <h1 className="font-display font-extrabold text-[44px] xl:text-[52px] leading-[1.05] tracking-tight text-balance">
              Gerencie seu negócio de qualquer lugar.
            </h1>
            <p className="mt-5 text-brand-100 text-lg leading-relaxed">
              Crie sua loja, receba pedidos e acompanhe vendas em tempo real — tudo num só lugar.
            </p>

            <ul className="mt-10 space-y-4">
              {benefits.map((b) => (
                <li key={b.text} className="flex items-center gap-3.5">
                  <span className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-sm grid place-items-center ring-1 ring-white/20">
                    <Icon name={b.icon} size={20} className="text-white" />
                  </span>
                  <span className="text-[15px] text-white/95">{b.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* prova social */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <Avatar name="Ana Lima" size="sm" tone="amber" />
              <Avatar name="Bruno Costa" size="sm" tone="blue" />
              <Avatar name="Clara Souza" size="sm" tone="pink" />
              <Avatar name="Diego Reis" size="sm" tone="purple" />
            </div>
            <div className="text-sm text-white/90">
              <strong className="font-display">+12.400 lojistas</strong> já usam Negócio Express
            </div>
          </div>
        </div>
      </aside>

      {/* ---------------- Coluna direita ----------------- */}
      <main className="flex-1 flex items-center justify-center px-6 py-10 bg-white">
        <div className="w-full max-w-[420px]">
          {/* logo mobile */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo size="md" />
          </div>

          <h2 className="font-display font-extrabold text-3xl tracking-tight text-ink-900">
            Entrar na sua conta
          </h2>
          <p className="mt-2 text-ink-500 text-[15px]">
            Bem-vindo de volta. Acesse o painel para gerenciar sua loja.
          </p>

          <div className="mt-8 space-y-4">
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="voce@exemplo.com.br"
              icon="Mail"
              error={errors.email}
              autoComplete="email"
            />
            <PasswordInput
              label="Senha"
              value={password}
              onChange={setPassword}
              placeholder="Sua senha"
              icon="Lock"
              error={errors.password}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between pt-1">
              <Checkbox checked={true} onChange={() => {}}>
                Lembrar de mim
              </Checkbox>
              <a
                onClick={() => onNavigate("FORGOT")}
                className="text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline cursor-pointer"
              >
                Esqueci minha senha
              </a>
            </div>

            <Button fullWidth size="lg" onClick={handleSubmit} iconRight="ArrowRight">
              Entrar
            </Button>

            <Divider>ou</Divider>

            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-3 px-5 py-3 rounded-lg border border-ink-200 bg-white text-ink-900 font-medium text-[15px] hover:bg-ink-50 hover:border-ink-300 transition-all"
            >
              <GoogleIcon size={18} />
              Entrar com Google
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-ink-500">
            Não tem conta?{" "}
            <a
              onClick={() => onNavigate("REGISTER")}
              className="font-semibold text-brand-700 hover:text-brand-800 hover:underline cursor-pointer"
            >
              Cadastre-se grátis
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

window.LoginScreen = LoginScreen;
