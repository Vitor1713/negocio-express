"use client";

/**
 * AppTable — tabela base genérica e tipada.
 * Define colunas com render por linha; trata loading/vazio internamente.
 * Usada como referência de listagem no dashboard (pedidos, equipe, etc.).
 */
import { type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { AppEmptyState } from "./AppEmptyState";
import { AppSpinner } from "./AppSpinner";
import { type IconName } from "./Icon";

export type Column<T> = {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
};

type AppTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  empty?: { icon?: IconName; title: string; desc?: string; action?: ReactNode };
  className?: string;
};

const ALIGN = { left: "text-left", center: "text-center", right: "text-right" } as const;

export function AppTable<T>({
  columns,
  rows,
  getRowId,
  onRowClick,
  isLoading,
  empty,
  className,
}: AppTableProps<T>) {
  if (isLoading) {
    return (
      <div className="grid place-items-center rounded-xl border border-ink-200 bg-white py-16">
        <AppSpinner />
      </div>
    );
  }

  if (rows.length === 0 && empty) {
    return <AppEmptyState {...empty} />;
  }

  return (
    <div className={cn("overflow-hidden rounded-xl border border-ink-200 bg-white", className)}>
      <div className="overflow-x-auto scroll-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500",
                    ALIGN[col.align ?? "left"],
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={getRowId(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "border-b border-ink-100 last:border-0 transition-colors",
                  onRowClick && "cursor-pointer hover:bg-brand-50/40",
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn("px-4 py-3 text-ink-700", ALIGN[col.align ?? "left"], col.className)}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
