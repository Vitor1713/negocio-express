import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui";
import { CustomerRegisterForm } from "@/features/auth/components/CustomerRegisterForm";

export const metadata: Metadata = {
  title: "Criar conta",
  robots: { index: false },
};

/**
 * Cadastro do cliente na vitrine (RF-F05, multi-tenant). A loja vem do SLUG da
 * rota. Ao concluir, o cliente é logado automaticamente e volta para /stores/{slug}.
 */
export default async function StoreRegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main className="screen-enter grid min-h-screen place-items-center bg-ink-50 px-6 py-10">
      <div className="w-full max-w-[460px]">
        <div className="mb-8 flex justify-center">
          <Link href={`/stores/${slug}`}>
            <Logo size="md" />
          </Link>
        </div>

        <div className="rounded-2xl border border-ink-200 bg-white p-7 shadow-soft sm:p-8">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">
            Criar conta
          </h1>
          <p className="mt-2 text-[15px] text-ink-500">
            Cadastre-se para acompanhar seus pedidos e finalizar a compra mais rápido.
          </p>

          <CustomerRegisterForm slug={slug} />
        </div>
      </div>
    </main>
  );
}
