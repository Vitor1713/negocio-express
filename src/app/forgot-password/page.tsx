import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Recuperar senha",
  description: "Receba um link para redefinir a senha do seu painel Negócio Express.",
  robots: { index: false },
};

/** Solicitação de recuperação de senha (POST /auth/forgot-password). */
export default function ForgotPasswordPage() {
  return (
    <main className="screen-enter grid min-h-screen place-items-center bg-ink-50 px-6 py-10">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex justify-center">
          <Link href="/login">
            <Logo size="md" />
          </Link>
        </div>

        <div className="rounded-2xl border border-ink-200 bg-white p-7 shadow-soft sm:p-8">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">
            Recuperar senha
          </h1>
          <p className="mt-2 text-[15px] text-ink-500">
            Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha.
          </p>

          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  );
}
