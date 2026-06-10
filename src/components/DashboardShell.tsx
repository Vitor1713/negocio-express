"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName, Logo } from "@/components/ui";
import { useAuth } from "@/features/auth";
import { useStore } from "@/features/store";
import { cn } from "@/lib/cn";

type NavItem = {
  href: string;
  label: string;
  icon: IconName;
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Início", icon: "LayoutDashboard" },
  { href: "/dashboard/products", label: "Produtos", icon: "Package" },
  { href: "/dashboard/categories", label: "Categorias", icon: "Tags" },
  { href: "/dashboard/coupons", label: "Cupons", icon: "Ticket" },
  { href: "/dashboard/orders", label: "Pedidos", icon: "ShoppingBag" },
  { href: "/dashboard/deliverers", label: "Entregadores", icon: "Bike" },
  { href: "/dashboard/team", label: "Equipe", icon: "Users" },
  { href: "/dashboard/settings", label: "Configurações", icon: "Settings" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { claims, logout } = useAuth();
  const { data: store } = useStore();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  const SidebarInner = (
    <>
      <div className="px-5 pt-6 pb-5 flex items-center justify-between">
        <Logo size="sm" />
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden h-8 w-8 grid place-items-center rounded-lg text-ink-500 hover:bg-ink-100"
        >
          <Icon name="X" size={18} />
        </button>
      </div>

      {store?.name && (
        <div className="mx-3 mb-3 px-3 py-3 rounded-xl bg-white border border-ink-200 shadow-soft">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-lg overflow-hidden bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center shrink-0">
              {store.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={store.logoUrl} alt={store.name} className="h-full w-full object-cover" />
              ) : (
                <Icon name="Store" size={16} />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-ink-500 leading-tight">Loja</div>
              <div className="text-[13px] font-semibold text-ink-900 truncate leading-tight mt-0.5">
                {store.name}
              </div>
            </div>
          </div>
        </div>
      )}

      {claims?.email && (
        <div className="mx-3 mb-4 px-3 py-3 rounded-xl bg-white border border-ink-200 shadow-soft">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-full bg-brand-100 grid place-items-center shrink-0">
              <span className="text-sm font-bold text-brand-700">
                {claims.email[0].toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-[12px] text-ink-500 leading-tight">{claims.role}</div>
              <div className="text-[13px] font-medium text-ink-900 truncate leading-tight mt-0.5">
                {claims.email}
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors",
                active
                  ? "bg-brand-100 text-brand-800 font-semibold"
                  : "text-ink-700 hover:bg-ink-100 hover:text-ink-900",
              )}
            >
              <Icon
                name={item.icon}
                size={18}
                className={active ? "text-brand-700" : "text-ink-500"}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-ink-200 px-3 py-3">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] text-ink-600 hover:bg-ink-100 hover:text-ink-900 transition-colors"
        >
          <Icon name="LogOut" size={16} className="text-ink-400" />
          Sair
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-[240px] shrink-0 bg-ink-50 border-r border-ink-200 flex-col sticky top-0 h-screen">
        {SidebarInner}
      </aside>

      {/* Sidebar mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-[260px] bg-ink-50 border-r border-ink-200 flex flex-col">
            {SidebarInner}
          </aside>
        </div>
      )}

      {/* Conteúdo */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-ink-200">
          <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden h-9 w-9 grid place-items-center rounded-lg border border-ink-200 text-ink-700"
            >
              <Icon name="Menu" size={18} />
            </button>
            <div className="lg:hidden">
              <Logo size="sm" />
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
}
