"use client";

/**
 * Redefinição de senha (POST /auth/reset-password). O token vem do link de
 * e-mail (querystring). Ao concluir, leva ao login.
 */
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppButton, AppInput, Icon } from "@/components/ui";
import { resetPasswordSchema, type ResetPasswordValues } from "../schema";
import { recoveryErrorMessage, useResetPassword } from "../hooks";

type FieldErrors = Partial<Record<keyof ResetPasswordValues, string>>;

export function ResetPasswordForm({ token }: { token: string | null }) {
  const router = useRouter();
  const mutation = useResetPassword();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const serverError = mutation.isError ? recoveryErrorMessage(mutation.error) : null;

  // Link inválido/incompleto: sem token não há como redefinir.
  if (!token) {
    return (
      <div className="mt-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-100 text-red-600">
          <Icon name="CircleAlert" size={26} />
        </span>
        <h2 className="mt-4 font-display text-xl font-extrabold text-ink-900">Link inválido</h2>
        <p className="mt-2 text-[15px] text-ink-500">
          Este link de redefinição é inválido ou expirou. Solicite um novo.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 font-medium text-white transition-colors hover:bg-brand-700"
        >
          Pedir novo link
        </Link>
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
    mutation.mutate(
      { token, newPassword: result.data.password },
      { onSuccess: () => router.replace("/login?reset=1") },
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
        label="Nova senha"
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
        label="Confirmar nova senha"
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
        Redefinir senha
      </AppButton>

      <p className="pt-2 text-center text-sm text-ink-500">
        <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
          Voltar ao login
        </Link>
      </p>
    </form>
  );
}
