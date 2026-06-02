/**
 * Logo do Negócio Express. `variant="light"` para fundos escuros (coluna
 * verde do login). Mantém o ícone em bloco verde + wordmark, como no design.
 */
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

type LogoProps = {
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
};

const MARK = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-12 w-12" } as const;
const TEXT = { sm: "text-base", md: "text-lg", lg: "text-xl" } as const;
const GLYPH = { sm: 18, md: 22, lg: 26 } as const;

export function Logo({ variant = "dark", size = "md" }: LogoProps) {
  const light = variant === "light";
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={cn(
          "grid place-items-center rounded-xl shadow-soft",
          MARK[size],
          light ? "bg-white text-brand-700" : "bg-brand-600 text-white",
        )}
      >
        <Icon name="Store" size={GLYPH[size]} />
      </span>
      <span
        className={cn(
          "font-display font-extrabold tracking-tight",
          TEXT[size],
          light ? "text-white" : "text-ink-900",
        )}
      >
        Negócio<span className={light ? "text-brand-100" : "text-brand-600"}>Express</span>
      </span>
    </span>
  );
}
