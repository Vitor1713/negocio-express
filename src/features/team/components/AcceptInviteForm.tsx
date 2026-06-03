"use client";

/**
 * Aceite do convite de equipe (POST /team/accept). O token vem do link de
 * e-mail (querystring). O convidado define a própria senha; ao concluir, faz
 * login automático e vai para o painel. Espelha o ResetPasswordForm.
 */
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AppButton, AppInput, AppSpinner, Icon } from "@/components/ui";
import { resetPasswordSchema, type ResetPasswordValues } from "@/features/auth";
import { roleInfo } from "../roles";
import { acceptInviteErrorMessage, useAcceptInvite, useInvite } from "../hooks";

type FieldErrors = Partial<Record<keyof ResetPasswordValues, string>>;

export function AcceptInviteForm({ token }: { token: string | null }) {
  const invite = useInvite(token);
  const mutation = useAcceptInvite();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const serverError = mutation.isError ? acceptInviteErrorMessage(mutation.error) : null;

  // Link inválido/incompleto: sem token (ou convite inválido) não há como aceitar.
  if (!token || invite.isError) {
    return (
      <div className="mt-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-100 text-red-600">
          <Icon name="CircleAlert" size={26} />
        </span>
        <h2 className="mt-4 font-display text-xl font-extrabold text-ink-900">Convite inválido</h2>
        <p className="mt-2 text-[15px] text-ink-500">
          Este convite é inválido ou expirou. Peça um novo ao dono da loja.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 font-medium text-white transition-colors hover:bg-brand-700"
        >
          Ir para o login
        </Link>
      </div>
    );
  }

  if (invite.isLoading) {
    return (
      <div className="mt-8 flex justify-center py-10">
        <AppSpinner className="h-10 w-10" />
      </div>
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const next: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ResetPasswordValues;
        next[key] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    mutation.mutate({ token, password: result.data.password });
  }

  const role = roleInfo(invite.data?.role);

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
      {/* Resumo do convite */}
      <div className="rounded-lg border border-ink-200 bg-ink-50/40 p-3.5 text-sm">
        <div className="text-ink-500">
          Você foi convidado(a) para a equipe de{" "}
          <span className="font-semibold text-ink-900">{invite.data?.storeName ?? "sua loja"}</span>
          {invite.data?.role && (
            <>
              {" "}como <span className="font-semibold text-ink-900">{role.label}</span>
            </>
          )}
          .
        </div>
        {invite.data?.email && (
          <div className="mt-1 inline-flex items-center gap-1.5 text-ink-500">
            <Icon name="Mail" size={14} />
            {invite.data.email}
          </div>
        )}
      </div>

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
        label="Crie sua senha"
        type="password"
        icon="Lock"
        placeholder="Mín. 6 caracteres"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        disabled={mutation.isPending}
      />
      <AppInput
        label="Confirmar senha"
        type="password"
        icon="Lock"
        placeholder="Repita a senha"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
        disabled={mutation.isPending}
      />

      <AppButton type="submit" size="lg" fullWidth loading={mutation.isPending} iconRight="ArrowRight">
        Entrar na equipe
      </AppButton>
    </form>
  );
}
