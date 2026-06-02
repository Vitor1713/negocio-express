"use client";

import { useState } from "react";
import { AppButton, AppEmptyState, AppErrorState, AppSpinner } from "@/components/ui";
import { useProducts } from "../hooks";
import { ProductCard } from "./ProductCard";

type Props = {
  onNew: () => void;
  onEdit: (id: string) => void;
};

export function ProductList({ onNew, onEdit }: Props) {
  const { data: products, isLoading, isError, error } = useProducts();
  const [search, setSearch] = useState("");

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <AppSpinner className="h-10 w-10" />
      </div>
    );
  }

  if (isError) {
    return (
      <AppErrorState
        title="Erro ao carregar produtos"
        error={error}
      />
    );
  }

  const list = products ?? [];
  const q = search.toLowerCase();
  const filtered = q
    ? list.filter((p) => p.name?.toLowerCase().includes(q) || p.slug?.includes(q))
    : list;

  return (
    <>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-ink-900 tracking-tight">
            Produtos
          </h1>
          <p className="text-sm text-ink-500 mt-0.5">{list.length} produtos no catálogo</p>
        </div>
        <AppButton icon="Plus" onClick={onNew}>Novo produto</AppButton>
      </div>

      {/* Busca */}
      <div className="relative mb-5">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produto..."
          className="w-full border border-ink-200 rounded-lg pl-10 pr-4 py-2.5 text-sm bg-white text-ink-900 placeholder-ink-400 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </span>
      </div>

      {/* Grade / vazio */}
      {filtered.length === 0 ? (
        <AppEmptyState
          icon="Package"
          title="Nenhum produto encontrado"
          desc={search ? "Tente ajustar a busca." : "Crie seu primeiro produto."}
          action={
            <AppButton icon="Plus" onClick={onNew}>
              Novo produto
            </AppButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} onClick={() => onEdit(p.id!)} />
          ))}
        </div>
      )}
    </>
  );
}
