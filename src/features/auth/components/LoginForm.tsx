"use client";

/**
 * Formulário de login reutilizável (painel e vitrine).
 * - Form controlado + validação Zod no submit (estabelece o padrão de form).
 * - Reusa os componentes base AppInput / AppButton.
 * - Estados: validação por campo, erro do servidor e loading.
 * - Extras do ./design (Google, lembrar, esqueci a senha) ficam como
 *   placeholders visíveis e sem ação até existir endpoint.
 */
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AppButton, AppInput, Icon } from "@/components/ui";
import { loginSchema, lojistaLoginSchema, type LojistaLoginValues, type LoginValues } from "../schema";

/** Valores emitidos: o painel inclui storeSlug; a vitrine, não (por isso opcional). */
export type LoginSubmitValues = LoginValues & { storeSlug?: string };

type FieldErrors = Partial<Record<keyof LojistaLoginValues, string>>;

type LoginFormProps = {
  onSubmit: (values: LoginSubmitValues) => void;
  loading?: boolean;
  serverError?: string | null;
  /** Mensagem de sucesso/aviso (ex.: confirmação após redefinir a senha). */
  notice?: string | null;
  /** Texto do botão (ex.: "Entrar"). */
  submitLabel?: string;
  /** Destino do link "Cadastre-se" (painel → /register; vitrine → cadastro da loja). */
  registerHref?: string;
  /** Destino do link "Esqueci minha senha". */
  forgotHref?: string;
  /**
   * Exibe o campo "Loja" (storeSlug), obrigatório no login do painel (lojista).
   * Na vitrine fica `false`: a loja já vem do slug da rota.
   */
  storeField?: boolean;
  /**
   * Exibe o login social (Google). No painel do lojista fica `false`.
   */
  socialLogin?: boolean;
};

export function LoginForm({
  onSubmit,
  loading = false,
  serverError,
  notice,
  submitLabel = "Entrar",
  registerHref = "/register",
  forgotHref = "/forgot-password",
  storeField = false,
  socialLogin = true,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = storeField
      ? lojistaLoginSchema.safeParse({ email, password, storeSlug })
      : loginSchema.safeParse({ email, password });
    if (!result.success) {
      const next: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        next[key] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    onSubmit(result.data);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
      {notice && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-lg border border-brand-200 bg-brand-50 px-3.5 py-3 text-sm text-brand-800"
        >
          <Icon name="CircleCheck" size={17} className="mt-0.5 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
        >
          <Icon name="CircleAlert" size={17} className="mt-0.5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <AppInput
        label="E-mail"
        type="email"
        icon="Mail"
        placeholder="voce@exemplo.com.br"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        disabled={loading}
      />
      <AppInput
        label="Senha"
        type="password"
        icon="Lock"
        placeholder="Sua senha"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        disabled={loading}
      />

      {storeField && (
        <AppInput
          label="Loja"
          icon="Store"
          placeholder="identificador-da-loja"
          autoComplete="organization"
          hint="O identificador (slug) da sua loja, ex.: minha-loja."
          value={storeSlug}
          onChange={(e) => setStoreSlug(e.target.value)}
          error={errors.storeSlug}
          disabled={loading}
        />
      )}

      <div className="flex items-center justify-between pt-1">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-600">
          {/* Placeholder: persistência de sessão já é padrão; sem ação por ora. */}
          <input
            type="checkbox"
            defaultChecked
            className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-200"
          />
          Lembrar de mim
        </label>
        <Link
          href={forgotHref}
          className="text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
        >
          Esqueci minha senha
        </Link>
      </div>

      <AppButton type="submit" size="lg" fullWidth loading={loading} iconRight="ArrowRight">
        {submitLabel}
      </AppButton>

      {socialLogin && (
        <>
          <div className="flex items-center gap-3 py-1 text-xs text-ink-400">
            <span className="h-px flex-1 bg-ink-200" />
            ou
            <span className="h-px flex-1 bg-ink-200" />
          </div>

          {/* Placeholder: login social sem endpoint no contrato ainda. */}
          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-3 rounded-lg border border-ink-200 bg-white px-5 py-3 text-[15px] font-medium text-ink-900 transition-all hover:border-ink-300 hover:bg-ink-50"
          >
            <GoogleIcon size={18} />
            Entrar com Google
          </button>
        </>
      )}

      <p className="pt-2 text-center text-sm text-ink-500">
        Não tem conta?{" "}
        <Link
          href={registerHref}
          className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
        >
          Cadastre-se grátis
        </Link>
      </p>
    </form>
  );
}

/** Marca do Google (lucide não traz ícones de marca). Usado só no botão social. */
function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
