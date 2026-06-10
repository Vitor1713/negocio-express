"use client";

import Link from "next/link";
import {
  AppBadge,
  AppButton,
  AppCard,
  AppEmptyState,
  AppErrorState,
  AppSpinner,
  Icon,
  type IconName,
} from "@/components/ui";
import { useStore } from "@/features/store";
import {
  useOrders,
  statusInfo,
  deliveryInfo,
  type OrderShort,
} from "@/features/orders";
import { useDashboard } from "../hooks";
import type { Dashboard } from "../service";

const BRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

const num = (v: number | string | null | undefined) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const fmtTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—";

const today = () =>
  new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const orderNo = (o: OrderShort) =>
  o.number != null ? `#${o.number}` : "#" + String(o.id ?? "").replace(/\D/g, "").slice(0, 4);

type Metric = { label: string; value: string; icon: IconName; bg: string; fg: string };

function metrics(d: Dashboard): Metric[] {
  return [
    { label: "Faturamento hoje", value: BRL(num(d.todaySales)), icon: "TrendingUp", bg: "bg-brand-100", fg: "text-brand-700" },
    { label: "Pedidos hoje", value: String(num(d.todayOrders)), icon: "ShoppingBag", bg: "bg-blue-100", fg: "text-blue-700" },
    { label: "Pendentes", value: String(num(d.pendingOrders)), icon: "Clock", bg: "bg-amber-100", fg: "text-amber-700" },
    { label: "Em preparo", value: String(num(d.ordersInProgress)), icon: "ChefHat", bg: "bg-purple-100", fg: "text-purple-700" },
    { label: "Produtos", value: String(num(d.totalProducts)), icon: "Package", bg: "bg-ink-100", fg: "text-ink-700" },
  ];
}

export function Overview() {
  const { data: store } = useStore();
  const dash = useDashboard();
  const orders = useOrders();

  return (
    <>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-ink-900 tracking-tight">
            Visão geral
          </h1>
          <p className="text-sm text-ink-500 mt-0.5 first-letter:uppercase">{today()}</p>
        </div>
        <Link href="/dashboard/orders">
          <AppButton variant="outline" icon="ShoppingBag">
            Ver pedidos
          </AppButton>
        </Link>
      </div>

      {/* Métricas */}
      {dash.isLoading ? (
        <div className="flex justify-center py-16">
          <AppSpinner className="h-9 w-9" />
        </div>
      ) : dash.isError ? (
        <AppErrorState title="Erro ao carregar as métricas" error={dash.error} onRetry={() => dash.refetch()} />
      ) : dash.data ? (
        <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          {metrics(dash.data).map((m) => (
            <AppCard key={m.label} className="p-4 sm:p-5">
              <div className={`h-10 w-10 rounded-lg ${m.bg} grid place-items-center`}>
                <Icon name={m.icon} size={18} className={m.fg} />
              </div>
              <div className="mt-3 sm:mt-4">
                <div className="text-[13px] text-ink-500">{m.label}</div>
                <div className="mt-0.5 font-display font-extrabold text-xl sm:text-[26px] text-ink-900 tracking-tight leading-none">
                  {m.value}
                </div>
              </div>
            </AppCard>
          ))}
        </section>
      ) : null}

      {/* Pedidos recentes */}
      <section className="mt-6">
        <AppCard className="overflow-hidden">
          <div className="p-5 sm:p-6 pb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-ink-900">
                Pedidos recentes
              </h2>
              <p className="text-sm text-ink-500 mt-0.5">
                {store?.name ? `Últimos pedidos de ${store.name}` : "Atualizado agora"}
              </p>
            </div>
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 px-3 py-2 rounded-lg hover:bg-brand-50 transition-colors shrink-0"
            >
              Ver todos <Icon name="ArrowRight" size={14} />
            </Link>
          </div>

          {orders.isLoading ? (
            <div className="flex justify-center py-12">
              <AppSpinner className="h-8 w-8" />
            </div>
          ) : orders.isError ? (
            <div className="px-5 sm:px-6 pb-6">
              <AppErrorState title="Erro ao carregar pedidos" error={orders.error} onRetry={() => orders.refetch()} />
            </div>
          ) : (orders.data ?? []).length === 0 ? (
            <div className="px-5 sm:px-6 pb-2">
              <AppEmptyState icon="ShoppingBag" title="Nenhum pedido ainda" desc="Os pedidos da sua loja aparecerão aqui." />
            </div>
          ) : (
            <RecentOrders list={(orders.data ?? []).slice(0, 5)} />
          )}
        </AppCard>
      </section>
    </>
  );
}

function RecentOrders({ list }: { list: OrderShort[] }) {
  return (
    <>
      {/* Tabela (desktop) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-ink-500 border-y border-ink-200 bg-ink-50/60">
              <th className="py-3 px-6 font-medium">Pedido</th>
              <th className="py-3 px-6 font-medium">Cliente</th>
              <th className="py-3 px-6 font-medium">Tipo</th>
              <th className="py-3 px-6 font-medium">Total</th>
              <th className="py-3 px-6 font-medium">Status</th>
              <th className="py-3 px-6 font-medium">Hora</th>
            </tr>
          </thead>
          <tbody>
            {list.map((o) => {
              const st = statusInfo(o.status);
              const dt = deliveryInfo(o.deliveryType);
              return (
                <tr key={o.id} className="border-b border-ink-100 last:border-0 hover:bg-brand-50/40 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-medium text-ink-900">{orderNo(o)}</td>
                  <td className="py-3.5 px-6 font-medium text-ink-900">{o.customerId}</td>
                  <td className="py-3.5 px-6 text-ink-700">
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name={dt.icon} size={14} className="text-ink-400" />
                      {dt.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 font-display font-semibold text-ink-900 tabular-nums">
                    {BRL(num(o.total))}
                  </td>
                  <td className="py-3.5 px-6">
                    <AppBadge tone={st.tone} dot>
                      {st.label}
                    </AppBadge>
                  </td>
                  <td className="py-3.5 px-6 text-ink-500 tabular-nums">{fmtTime(o.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cards (mobile) */}
      <div className="md:hidden divide-y divide-ink-100">
        {list.map((o) => {
          const st = statusInfo(o.status);
          return (
            <div key={o.id} className="px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-ink-900 truncate">{o.customerId}</div>
                <div className="text-[11.5px] text-ink-500">
                  {orderNo(o)} · {fmtTime(o.createdAt)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-display font-semibold text-sm text-ink-900 tabular-nums">
                  {BRL(num(o.total))}
                </div>
                <AppBadge tone={st.tone} size="sm" dot>
                  {st.label}
                </AppBadge>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
