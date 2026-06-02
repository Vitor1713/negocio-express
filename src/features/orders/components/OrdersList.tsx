"use client";

import { useMemo, useState } from "react";
import { AppBadge, AppErrorState, AppTable, Icon, type Column } from "@/components/ui";
import { useOrders, useUpdateOrderStatus } from "../hooks";
import type { OrderShort } from "../service";
import { deliveryInfo, statusInfo } from "../status";
import { OrderDrawer } from "./OrderDrawer";

const BRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

const fmtTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—";

const orderNo = (id?: string) => "#" + (id ?? "").replace(/\D/g, "").slice(0, 4).padStart(4, "0");

const FILTERS = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendentes" },
  { value: "paid", label: "Pagos" },
  { value: "preparing", label: "Em preparo" },
  { value: "out_for_delivery", label: "Em entrega" },
  { value: "delivered", label: "Entregues" },
  { value: "cancelled", label: "Cancelados" },
];

export function OrdersList() {
  const { data: orders, isLoading, isError, error } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<OrderShort | null>(null);

  const list = useMemo(() => orders ?? [], [orders]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: list.length };
    list.forEach((o) => {
      if (o.status) c[o.status] = (c[o.status] ?? 0) + 1;
    });
    return c;
  }, [list]);

  if (isError) {
    return <AppErrorState title="Erro ao carregar pedidos" error={error} />;
  }

  const q = search.toLowerCase();
  const filtered = list.filter((o) => {
    const matchF = filter === "all" || o.status === filter;
    const matchQ =
      !q || o.customerId?.toLowerCase().includes(q) || o.id?.toLowerCase().includes(q);
    return matchF && matchQ;
  });

  async function advance(order: OrderShort, next: string) {
    await updateStatus.mutateAsync({ id: order.id!, status: next });
    setSelected((s) => (s && s.id === order.id ? { ...s, status: next } : s));
  }

  async function cancel(order: OrderShort) {
    await updateStatus.mutateAsync({ id: order.id!, status: "cancelled" });
    setSelected((s) => (s && s.id === order.id ? { ...s, status: "cancelled" } : s));
  }

  const columns: Column<OrderShort>[] = [
    {
      key: "order",
      header: "Pedido",
      render: (o) => <span className="font-mono font-medium text-ink-900">{orderNo(o.id)}</span>,
    },
    {
      key: "customer",
      header: "Cliente",
      render: (o) => <span className="font-medium text-ink-900">{o.customerId}</span>,
    },
    {
      key: "type",
      header: "Tipo",
      render: (o) => {
        const dt = deliveryInfo(o.deliveryType);
        return (
          <span className="inline-flex items-center gap-1.5">
            <Icon name={dt.icon} size={14} className="text-ink-400" />
            {dt.label}
          </span>
        );
      },
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      render: (o) => (
        <span className="font-display font-semibold text-ink-900 tabular-nums">
          {BRL(Number(o.total ?? 0))}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (o) => {
        const st = statusInfo(o.status);
        return (
          <AppBadge tone={st.tone} dot>
            {st.label}
          </AppBadge>
        );
      },
    },
    {
      key: "time",
      header: "Hora",
      render: (o) => <span className="text-ink-500 tabular-nums">{fmtTime(o.createdAt)}</span>,
    },
    {
      key: "chevron",
      header: "",
      align: "right",
      render: () => <Icon name="ChevronRight" size={16} className="text-ink-400" />,
    },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="font-display font-extrabold text-2xl text-ink-900 tracking-tight">Pedidos</h1>
        <p className="text-sm text-ink-500 mt-0.5">{list.length} pedidos</p>
      </div>

      {/* Busca */}
      <div className="relative mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por cliente ou nº do pedido..."
          className="w-full border border-ink-200 rounded-lg pl-10 pr-4 py-2.5 text-sm bg-white text-ink-900 placeholder-ink-400 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f.value
                ? "bg-brand-600 text-white"
                : "bg-ink-100 text-ink-600 hover:bg-ink-200"
            }`}
          >
            {f.label} ({counts[f.value] ?? 0})
          </button>
        ))}
      </div>

      <AppTable
        columns={columns}
        rows={filtered}
        getRowId={(o) => o.id!}
        onRowClick={(o) => setSelected(o)}
        isLoading={isLoading}
        empty={{
          icon: "ShoppingBag",
          title: "Nenhum pedido encontrado",
          desc:
            search || filter !== "all"
              ? "Ajuste a busca ou o filtro."
              : "Os pedidos da sua loja aparecerão aqui.",
        }}
      />

      <OrderDrawer
        order={selected}
        onClose={() => setSelected(null)}
        onAdvance={advance}
        onCancel={cancel}
        updating={updateStatus.isPending}
      />
    </>
  );
}
