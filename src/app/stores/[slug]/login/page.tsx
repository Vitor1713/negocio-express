import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui";
import { CustomerLoginForm } from "@/features/auth/components/CustomerLoginForm";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false },
};

/**
 * Login do cliente na vitrine (RF-F02, multi-tenant). A loja vem do SLUG da
 * rota — o mesmo LoginForm da base, ligado ao endpoint da loja. Ao logar, o
 * cliente volta para /stores/{slug}.
 */
export default async function StoreLoginPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main className="screen-enter grid min-h-screen place-items-center bg-ink-50 px-6 py-10">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex justify-center">
          <Link href={`/stores/${slug}`}>
            <Logo size="md" />
          </Link>
        </div>

        <div className="rounded-2xl border border-ink-200 bg-white p-7 shadow-soft sm:p-8">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">
            Entrar na loja
          </h1>
          <p className="mt-2 text-[15px] text-ink-500">
            Acesse para acompanhar seus pedidos e finalizar a compra.
          </p>

          <CustomerLoginForm slug={slug} />
        </div>
      </div>
    </main>
  );
}
