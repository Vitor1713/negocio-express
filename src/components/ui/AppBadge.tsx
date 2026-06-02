/**
 * AppBadge — etiqueta de status (success/warning/danger/neutral/brand).
 * `dot` mostra o ponto colorido; tamanhos sm/md. Extraído do uso no ./design
 * (StockPill, Ativo/Inativo, status de pedido).
 */
import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "success" | "warning" | "danger" | "neutral" | "brand";
type Size = "sm" | "md";

export type AppBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
  size?: Size;
  dot?: boolean;
};

const TONES: Record<Tone, { wrap: string; dot: string }> = {
  success: { wrap: "bg-brand-50 text-brand-700", dot: "bg-brand-500" },
  warning: { wrap: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  danger: { wrap: "bg-red-50 text-red-700", dot: "bg-red-500" },
  neutral: { wrap: "bg-ink-100 text-ink-600", dot: "bg-ink-400" },
  brand: { wrap: "bg-brand-600 text-white", dot: "bg-white" },
};

const SIZES: Record<Size, string> = {
  sm: "text-[11px] px-2 py-0.5 gap-1",
  md: "text-xs px-2.5 py-1 gap-1.5",
};

export function AppBadge({
  tone = "neutral",
  size = "md",
  dot,
  className,
  children,
  ...props
}: AppBadgeProps) {
  const t = TONES[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        t.wrap,
        SIZES[size],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} />}
      {children}
    </span>
  );
}
