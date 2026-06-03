"use client";

/**
 * Solicitação de recuperação de senha (POST /auth/forgot-password).
 * Em caso de sucesso mostramos um estado de confirmação neutro (não revela se
 * o e-mail existe) com instrução para checar a caixa de entrada.
 */
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AppButton, AppInput, Icon } from "@/components/ui";
import { forgotPasswordSchema } from "../schema";
import { recoveryErrorMessage, useForgotPassword } from "../hooks";

export function ForgotPasswordForm() {
  const mutation = useForgotPassword();
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  const serverError = mutation.isError ? recoveryErrorMessage(mutation.error) : null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? "E-mail inválido.");
      return;
    }
    setFieldError(null);
    mutation.mutate(result.data);
  }

  if (mutation.isSuccess) {
    return (
      <div className="mt-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-100 text-brand-700">
          <Icon name="MailCheck" size={26} />
        </span>
        <h2 className="mt-4 font-display text-xl font-extrabold text-ink-900">Verifique seu e-mail</h2>
        <p className="mt-2 text-[15px] text-ink-500">
          Se houver uma conta para <strong className="text-ink-700">{email}</strong>, enviamos um link
          para redefinir sua senha. O link expira em alguns minutos.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 font-medium text-white transition-colors hover:bg-brand-700"
        >
          Voltar ao login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
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
        error={fieldError ?? undefined}
        disabled={mutation.isPending}
      />

      <AppButton type="submit" size="lg" fullWidth loading={mutation.isPending} iconRight="ArrowRight">
        Enviar link de recuperação
      </AppButton>

      <p className="pt-2 text-center text-sm text-ink-500">
        Lembrou a senha?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
