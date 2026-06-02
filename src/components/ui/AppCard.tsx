/**
 * AppCard — superfície base (branca, borda ink, raio, sombra soft).
 * `hoverable` ativa o realce de hover usado nos cards de produto/loja.
 */
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type AppCardProps = HTMLAttributes<HTMLDivElement> & {
  hoverable?: boolean;
};

export const AppCard = forwardRef<HTMLDivElement, AppCardProps>(function AppCard(
  { hoverable, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-ink-200 bg-white shadow-soft",
        hoverable && "transition-all hover:border-ink-300 hover:shadow-pop",
        className,
      )}
      {...props}
    />
  );
});
