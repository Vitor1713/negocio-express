import type { Metadata } from "next";
import { Icon, Logo, type IconName } from "@/components/ui";
import { LojistaLoginForm } from "@/features/auth/components/LojistaLoginForm";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse o painel do Negócio Express para gerenciar sua loja.",
};

const BENEFITS: { icon: IconName; text: string }[] = [
  { icon: "Store", text: "Loja online em minutos" },
  { icon: "LayoutGrid", text: "Painel simples e intuitivo" },
  { icon: "Clock", text: "Aceite pedidos 24 horas por dia" },
];

/**
 * Login do painel (RF-F02). Split-screen do ./design: coluna verde de marca à
 * esquerda (escondida no mobile) + formulário à direita. O form fica num client
 * component (LojistaLoginForm) para esta página exportar metadata.
 */
export default function LoginPage() {
  return (
    <div className="screen-enter flex min-h-screen w-full">
      {/* Coluna de marca — decorativa, escondida no mobile */}
      <aside className="relative hidden w-1/2 overflow-hidden bg-brand-600 text-white lg:flex">
        <div className="dot-grid absolute inset-0 opacity-80" />
        <div className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-brand-700/60 blur-2xl" />
        <div className="absolute -bottom-40 -left-20 h-[380px] w-[380px] rounded-full bg-brand-800/40 blur-3xl" />

        <div className="relative z-10 flex w-full flex-col justify-between p-14 xl:p-16">
          <Logo variant="light" size="md" />

          <div className="max-w-md">
            <h1 className="font-display text-[44px] font-extrabold leading-[1.05] tracking-tight xl:text-[52px]">
              Gerencie seu negócio de qualquer lugar.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-brand-100">
              Crie sua loja, receba pedidos e acompanhe vendas em tempo real — tudo num só lugar.
            </p>

            <ul className="mt-10 space-y-4">
              {BENEFITS.map((b) => (
                <li key={b.text} className="flex items-center gap-3.5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
                    <Icon name={b.icon} size={20} className="text-white" />
                  </span>
                  <span className="text-[15px] text-white/95">{b.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-white/90">
            <strong className="font-display">+12.400 lojistas</strong> já usam Negócio Express
          </p>
        </div>
      </aside>

      {/* Coluna do formulário */}
      <main className="flex flex-1 items-center justify-center bg-white px-6 py-10">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo size="md" />
          </div>

          <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink-900">
            Entrar na sua conta
          </h2>
          <p className="mt-2 text-[15px] text-ink-500">
            Bem-vindo de volta. Acesse o painel para gerenciar sua loja.
          </p>

          <LojistaLoginForm />
        </div>
      </main>
    </div>
  );
}
