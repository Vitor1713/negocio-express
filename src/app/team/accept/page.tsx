import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui";
import { AcceptInviteForm } from "@/features/team/components/AcceptInviteForm";

export const metadata: Metadata = {
  title: "Aceitar convite",
  robots: { index: false },
};

type SearchParams = { searchParams: Promise<{ token?: string }> };

/** Aceite do convite de equipe a partir do token do e-mail (POST /team/accept). */
export default async function AcceptInvitePage({ searchParams }: SearchParams) {
  const { token } = await searchParams;

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
            Aceitar convite
          </h1>
          <p className="mt-2 text-[15px] text-ink-500">
            Defina sua senha para acessar o painel da loja.
          </p>

          <AcceptInviteForm token={token ?? null} />
        </div>
      </div>
    </main>
  );
}
