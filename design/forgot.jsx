// ============================================================================
// TELA — RECUPERAR SENHA
//   Fluxo: email (solicitar link) → sent (confirmação) → reset (nova senha) → done
// ============================================================================

function ForgotPasswordScreen({ onNavigate }) {
  const [stage, setStage] = React.useState("email"); // email | sent | reset | done
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [resendIn, setResendIn] = React.useState(0);

  // senha nova
  const [senha, setSenha] = React.useState("");
  const [confirmar, setConfirmar] = React.useState("");
  const [resetErrors, setResetErrors] = React.useState({});

  // contador de reenvio
  React.useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const sendLink = () => {
    if (!email.includes("@")) {
      setError("Informe um e-mail válido.");
      return;
    }
    setError("");
    setStage("sent");
    setResendIn(30);
  };

  const strength = React.useMemo(() => {
    let s = 0;
    if (senha.length >= 6) s++;
    if (senha.length >= 10) s++;
    if (/[A-Z]/.test(senha) && /[a-z]/.test(senha)) s++;
    if (/\d/.test(senha) && /[^A-Za-z0-9]/.test(senha)) s++;
    return s; // 0..4
  }, [senha]);

  const submitReset = () => {
    const e = {};
    if (senha.length < 6) e.senha = "Mínimo de 6 caracteres.";
    if (confirmar !== senha) e.confirmar = "As senhas não coincidem.";
    setResetErrors(e);
    if (Object.keys(e).length === 0) {
      setStage("done");
      setTimeout(() => onNavigate("LOGIN"), 1800);
    }
  };

  const benefits = [
    { icon: "ShieldCheck", text: "Recuperação rápida e segura" },
    { icon: "MailCheck",   text: "Link enviado direto para o seu e-mail" },
    { icon: "Lock",        text: "Seus dados sempre protegidos" },
  ];

  return (
    <div className="min-h-screen w-full flex screen-enter">
      {/* ---------------- Coluna esquerda ---------------- */}
      <aside className="hidden lg:flex relative w-1/2 bg-brand-600 text-white overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-80" />
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-brand-700/60 blur-2xl" />
        <div className="absolute -bottom-40 -left-20 w-[380px] h-[380px] rounded-full bg-brand-800/40 blur-3xl" />
        <div className="absolute top-1/2 -right-16 w-44 h-44 rounded-[28px] bg-white/10 rotate-12" />
        <div className="absolute top-24 right-24 w-20 h-20 rounded-2xl bg-white/10 rotate-6" />

        <div className="relative z-10 flex flex-col justify-between p-14 xl:p-16 w-full">
          <Logo variant="light" size="md" />

          <div className="max-w-md">
            <span className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur-sm grid place-items-center ring-1 ring-white/20">
              <Icon name="KeyRound" size={26} className="text-white" />
            </span>
            <h1 className="mt-6 font-display font-extrabold text-[40px] xl:text-[48px] leading-[1.05] tracking-tight text-balance">
              Esqueceu a senha? Sem problemas.
            </h1>
            <p className="mt-5 text-brand-100 text-lg leading-relaxed">
              Vamos te ajudar a recuperar o acesso ao painel da sua loja em poucos passos.
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

          <div className="text-sm text-white/80 inline-flex items-center gap-2">
            <Icon name="LifeBuoy" size={16} /> Precisa de ajuda? Fale com o suporte.
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

          {/* voltar */}
          <button
            onClick={() => onNavigate("LOGIN")}
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 transition-colors"
          >
            <Icon name="ArrowLeft" size={15} /> Voltar para o login
          </button>

          {/* ============ STAGE: EMAIL ============ */}
          {stage === "email" && (
            <div className="screen-enter">
              <span className="h-12 w-12 rounded-xl bg-brand-100 text-brand-700 grid place-items-center mb-5">
                <Icon name="KeyRound" size={22} />
              </span>
              <h2 className="font-display font-extrabold text-3xl tracking-tight text-ink-900">
                Recuperar senha
              </h2>
              <p className="mt-2 text-ink-500 text-[15px]">
                Digite o e-mail da sua conta e enviaremos um link para você criar uma nova senha.
              </p>

              <div className="mt-8 space-y-4">
                <Input
                  label="E-mail"
                  type="email"
                  value={email}
                  onChange={(v) => { setEmail(v); setError(""); }}
                  placeholder="voce@exemplo.com.br"
                  icon="Mail"
                  error={error}
                  autoComplete="email"
                />
                <Button fullWidth size="lg" onClick={sendLink} iconRight="ArrowRight">
                  Enviar link de recuperação
                </Button>
              </div>

              <p className="mt-8 text-center text-sm text-ink-500">
                Lembrou a senha?{" "}
                <a
                  onClick={() => onNavigate("LOGIN")}
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline cursor-pointer"
                >
                  Entrar
                </a>
              </p>
            </div>
          )}

          {/* ============ STAGE: SENT ============ */}
          {stage === "sent" && (
            <div className="screen-enter">
              <span className="h-12 w-12 rounded-xl bg-brand-100 text-brand-700 grid place-items-center mb-5">
                <Icon name="MailCheck" size={22} />
              </span>
              <h2 className="font-display font-extrabold text-3xl tracking-tight text-ink-900">
                Verifique seu e-mail
              </h2>
              <p className="mt-2 text-ink-500 text-[15px]">
                Enviamos um link de recuperação para{" "}
                <strong className="text-ink-900">{email}</strong>. Confira sua caixa de entrada e o spam.
              </p>

              <div className="mt-6 rounded-xl border border-ink-200 bg-ink-50/60 p-4 flex items-start gap-3">
                <Icon name="Info" size={18} className="text-ink-400 mt-0.5" />
                <p className="text-[13px] text-ink-600 leading-relaxed">
                  O link expira em <strong>30 minutos</strong>. Se não encontrar o e-mail, reenvie abaixo.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {/* demo: avança para redefinição */}
                <Button fullWidth size="lg" icon="MailOpen" onClick={() => setStage("reset")}>
                  Abrir link de recuperação
                </Button>
                <button
                  onClick={() => { if (resendIn === 0) setResendIn(30); }}
                  disabled={resendIn > 0}
                  className={`w-full text-sm font-medium py-2 transition-colors ${
                    resendIn > 0 ? "text-ink-400 cursor-not-allowed" : "text-brand-700 hover:text-brand-800 hover:underline"
                  }`}
                >
                  {resendIn > 0 ? `Reenviar e-mail em ${resendIn}s` : "Não recebeu? Reenviar e-mail"}
                </button>
              </div>

              <button
                onClick={() => setStage("email")}
                className="mt-6 w-full text-center text-sm text-ink-500 hover:text-ink-900 transition-colors"
              >
                Usar outro e-mail
              </button>
            </div>
          )}

          {/* ============ STAGE: RESET ============ */}
          {stage === "reset" && (
            <div className="screen-enter">
              <span className="h-12 w-12 rounded-xl bg-brand-100 text-brand-700 grid place-items-center mb-5">
                <Icon name="LockKeyhole" size={22} />
              </span>
              <h2 className="font-display font-extrabold text-3xl tracking-tight text-ink-900">
                Criar nova senha
              </h2>
              <p className="mt-2 text-ink-500 text-[15px]">
                Escolha uma senha forte que você ainda não usou nesta conta.
              </p>

              <div className="mt-8 space-y-4">
                <div>
                  <PasswordInput
                    label="Nova senha"
                    value={senha}
                    onChange={(v) => { setSenha(v); setResetErrors((e) => ({ ...e, senha: undefined })); }}
                    placeholder="Mín. 6 caracteres"
                    icon="Lock"
                    error={resetErrors.senha}
                  />
                  {/* medidor de força */}
                  {senha.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 flex gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                              i < strength
                                ? strength <= 1 ? "bg-red-400" : strength === 2 ? "bg-amber-400" : "bg-brand-500"
                                : "bg-ink-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-[11px] font-medium ${
                        strength <= 1 ? "text-red-500" : strength === 2 ? "text-amber-600" : "text-brand-700"
                      }`}>
                        {strength <= 1 ? "Fraca" : strength === 2 ? "Média" : strength === 3 ? "Boa" : "Forte"}
                      </span>
                    </div>
                  )}
                </div>

                <PasswordInput
                  label="Confirmar nova senha"
                  value={confirmar}
                  onChange={(v) => { setConfirmar(v); setResetErrors((e) => ({ ...e, confirmar: undefined })); }}
                  placeholder="Repita a senha"
                  icon="Lock"
                  error={resetErrors.confirmar}
                />

                <Button fullWidth size="lg" onClick={submitReset} icon="Check">
                  Redefinir senha
                </Button>
              </div>
            </div>
          )}

          {/* ============ STAGE: DONE ============ */}
          {stage === "done" && (
            <div className="screen-enter text-center py-6">
              <span className="mx-auto h-16 w-16 rounded-full bg-brand-100 text-brand-700 grid place-items-center">
                <Icon name="CheckCircle2" size={32} />
              </span>
              <h2 className="mt-5 font-display font-extrabold text-2xl tracking-tight text-ink-900">
                Senha redefinida!
              </h2>
              <p className="mt-2 text-ink-500 text-[15px]">
                Sua senha foi alterada com sucesso. Redirecionando para o login...
              </p>
              <div className="mt-6 h-1 w-40 mx-auto rounded-full bg-ink-100 overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full animate-pulse" style={{ width: "70%" }} />
              </div>
              <button
                onClick={() => onNavigate("LOGIN")}
                className="mt-6 text-sm font-semibold text-brand-700 hover:text-brand-800 hover:underline"
              >
                Ir para o login agora
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

window.ForgotPasswordScreen = ForgotPasswordScreen;
