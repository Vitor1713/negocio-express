"use client";

import { useState } from "react";
import Link from "next/link";
import { AppErrorState, AppSpinner, Icon } from "@/components/ui";
import { useAuth } from "@/features/auth";
import { useCart } from "../cart-context";
import { useStoreProducts } from "../hooks";
import { storeBRL } from "../format";
import type { CatalogProduct, PublicStore, StoreCategory } from "../service";
import { StoreProductCard } from "./StoreProductCard";
import { StoreFooter } from "./StoreFooter";

type Props = {
  slug: string;
  storeName: string;
  /** Dados públicos da loja (status, entrega). Opcional: ausente em fallback. */
  store?: PublicStore | null;
  initialProducts: CatalogProduct[];
  categories: StoreCategory[];
};

export function StoreCatalog({ slug, storeName, store, initialProducts, categories }: Props) {
  const { count } = useCart();
  const { isAuthenticated, role } = useAuth();
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");

  const { data: products, isFetching, isError, error } = useStoreProducts(
    slug,
    categoryId,
    initialProducts,
  );

  const list = products ?? [];
  const q = search.trim().toLowerCase();
  const filtered = q
    ? list.filter((p) => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
    : list;

  // Resumo de entrega da loja (quando os dados públicos estão disponíveis).
  const deliveryInfo = store
    ? [
        Number(store.deliveryFee ?? 0) > 0
          ? `Entrega ${storeBRL(store.deliveryFee)}`
          : "Entrega grátis",
        Number(store.minOrderAmount ?? 0) > 0 ? `Mín. ${storeBRL(store.minOrderAmount)}` : null,
        Number(store.estimatedDeliveryMinutes ?? 0) > 0
          ? `~${store.estimatedDeliveryMinutes} min`
          : null,
      ].filter(Boolean)
    : [];

  return (
    <div className="min-h-screen w-full bg-ink-50/60 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-ink-200">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-3.5 flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center shadow-soft">
              <Icon name="Store" size={20} />
            </span>
            <div className="hidden sm:flex items-center gap-2">
              <span className="font-display font-extrabold text-[15px] text-ink-900 leading-tight">
                {storeName}
              </span>
              {store && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    store.isOpen ? "bg-brand-100 text-brand-700" : "bg-ink-100 text-ink-500"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${store.isOpen ? "bg-brand-500" : "bg-ink-400"}`}
                  />
                  {store.isOpen ? "Aberta" : "Fechada"}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 max-w-xl mx-auto">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
                <Icon name="Search" size={18} />
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar produtos..."
                className="w-full bg-ink-50 border border-ink-200 rounded-full pl-11 pr-4 py-2.5 text-[14px] placeholder-ink-400 focus:outline-none focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-all"
              />
            </div>
          </div>

          {/* Ícone de conta (só para clientes autenticados) */}
          {isAuthenticated && role !== "Owner" && role !== "Lojista" && (
            <Link
              href={`/stores/${slug}/account`}
              className="h-10 w-10 grid place-items-center rounded-lg border border-ink-200 text-ink-700 hover:bg-ink-50 transition-colors shrink-0"
              title="Minha conta"
            >
              <Icon name="User" size={18} />
            </Link>
          )}

          {/* Botão do carrinho */}
          <Link
            href={`/stores/${slug}/checkout`}
            className="h-10 px-3 inline-flex items-center gap-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors relative shrink-0"
          >
            <Icon name="ShoppingCart" size={18} />
            <span className="hidden sm:inline text-sm font-medium">
              {count > 0 ? `${count} iten${count === 1 ? "" : "s"}` : "Carrinho"}
            </span>
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 grid place-items-center rounded-full bg-white text-brand-700 text-[11px] font-bold border-2 border-brand-600 sm:hidden">
                {count}
              </span>
            )}
          </Link>
        </div>

        {/* Categorias */}
        {categories.length > 0 && (
          <div className="border-t border-ink-100 bg-white">
            <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
              <div className="flex items-center gap-1.5 overflow-x-auto scroll-thin py-2.5">
                <button
                  onClick={() => setCategoryId(undefined)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                    categoryId === undefined
                      ? "bg-brand-600 text-white shadow-soft"
                      : "bg-ink-100 text-ink-700 hover:bg-ink-200"
                  }`}
                >
                  Todos
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategoryId(c.id)}
                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                      categoryId === c.id
                        ? "bg-brand-600 text-white shadow-soft"
                        : "bg-ink-100 text-ink-700 hover:bg-ink-200"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Conteúdo */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h1 className="font-display font-extrabold text-xl sm:text-2xl text-ink-900 tracking-tight">
              {storeName}
            </h1>
            <p className="text-sm text-ink-500 mt-0.5">
              {filtered.length} {filtered.length === 1 ? "item" : "itens"}
              {deliveryInfo.length > 0 && (
                <span className="text-ink-400"> · {deliveryInfo.join(" · ")}</span>
              )}
            </p>
          </div>
          {isFetching && <AppSpinner />}
        </div>

        {isError ? (
          <AppErrorState title="Erro ao carregar o catálogo" error={error} />
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-ink-200 rounded-2xl p-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-ink-100 grid place-items-center text-ink-400 mb-3">
              <Icon name="SearchX" size={22} />
            </div>
            <p className="text-ink-700 font-medium">Nada encontrado.</p>
            <p className="text-sm text-ink-500 mt-1">Tente outra categoria ou palavra-chave.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filtered.map((p) => (
              <StoreProductCard key={p.id} slug={slug} product={p} />
            ))}
          </div>
        )}
      </main>

      <StoreFooter storeName={storeName} store={store} />
    </div>
  );
}
