"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { AppSpinner, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useAuth } from "@/features/auth";
import { AddressesTab } from "./AddressesTab";
import { OrdersTab } from "./OrdersTab";
import { ReviewsTab } from "./ReviewsTab";

type Tab = "addresses" | "orders" | "reviews";

const TABS: { key: Tab; label: string; icon: Parameters<typeof Icon>[0]["name"] }[] = [
  { key: "addresses", label: "Endereços", icon: "MapPin" },
  { key: "orders", label: "Meus pedidos", icon: "ShoppingBag" },
  { key: "reviews", label: "Avaliar", icon: "Star" },
];

type Props = { slug: string };

export function AccountPage({ slug }: Props) {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = (searchParams.get("tab") as Tab) ?? "addresses";

  // Enquanto hidrata o auth
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <AppSpinner className="h-10 w-10" />
      </div>
    );
  }

  // Redireciona para login se não autenticado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-ink-50/60 grid place-items-center px-6">
        <div className="text-center max-w-sm">
          <span className="h-16 w-16 rounded-full bg-brand-100 text-brand-700 grid place-items-center mx-auto">
            <Icon name="Lock" size={28} />
          </span>
          <h1 className="mt-4 font-display font-extrabold text-xl text-ink-900">
            Faça login para continuar
          </h1>
          <p className="mt-2 text-ink-500 text-sm">
            Acesse sua conta para gerenciar endereços, ver pedidos e avaliar produtos.
          </p>
          <Link
            href={`/stores/${slug}/login`}
            className="mt-5 inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors"
          >
            Entrar na loja
          </Link>
        </div>
      </div>
    );
  }

  function setTab(tab: Tab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-ink-50/60">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-ink-200">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <Link
            href={`/stores/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-ink-700 hover:text-ink-900 transition-colors"
          >
            <Icon name="ArrowLeft" size={16} /> Voltar à loja
          </Link>
          <div className="font-display font-bold text-ink-900">Minha conta</div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 transition-colors"
          >
            <Icon name="LogOut" size={15} /> Sair
          </button>
        </div>
      </header>

      <main className="max-w-[960px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Sidebar de tabs */}
          <nav className="md:col-span-1">
            <div className="bg-white border border-ink-200 rounded-xl overflow-hidden">
              {TABS.map((tab) => {
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setTab(tab.key)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3.5 text-sm text-left transition-colors border-b border-ink-100 last:border-0",
                      active
                        ? "bg-brand-50 text-brand-700 font-semibold"
                        : "text-ink-700 hover:bg-ink-50",
                    )}
                  >
                    <Icon
                      name={tab.icon}
                      size={16}
                      className={active ? "text-brand-700" : "text-ink-400"}
                    />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Conteúdo da tab */}
          <div className="md:col-span-3">
            {activeTab === "addresses" && <AddressesTab slug={slug} />}
            {activeTab === "orders" && <OrdersTab slug={slug} />}
            {activeTab === "reviews" && <ReviewsTab slug={slug} />}
          </div>
        </div>
      </main>
    </div>
  );
}
