"use client";

/**
 * AppDrawer — painel lateral (overlay) reutilizável.
 * Extraído do DashDrawer do ./design: cabeçalho com ícone/título/subtítulo,
 * corpo rolável e rodapé fixo opcional (ações). Fecha no overlay e no Esc.
 */
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

export type AppDrawerProps = {
  open: boolean;
  onClose: () => void;
  icon?: IconName;
  title: ReactNode;
  subtitle?: ReactNode;
  footer?: ReactNode;
  width?: number;
  children: ReactNode;
};

export function AppDrawer({
  open,
  onClose,
  icon,
  title,
  subtitle,
  footer,
  width = 440,
  children,
}: AppDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink-900/40" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        className="absolute right-0 top-0 h-full w-full bg-white shadow-2xl flex flex-col"
        style={{ maxWidth: width }}
      >
        {/* Cabeçalho */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-ink-200">
          {icon && (
            <span className="h-10 w-10 rounded-xl bg-brand-100 text-brand-700 grid place-items-center shrink-0">
              <Icon name={icon} size={20} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-display font-bold text-ink-900 truncate">{title}</div>
            {subtitle && <div className="text-xs text-ink-500 truncate">{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 grid place-items-center rounded-lg text-ink-500 hover:bg-ink-100 transition-colors shrink-0"
            aria-label="Fechar"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Corpo */}
        <div className={cn("flex-1 overflow-y-auto scroll-thin")}>{children}</div>

        {/* Rodapé */}
        {footer && <div className="border-t border-ink-200 px-5 py-4">{footer}</div>}
      </aside>
    </div>
  );
}
