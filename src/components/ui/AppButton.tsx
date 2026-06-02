"use client";

/**
 * AppButton — botão base do design system.
 * Variantes/tamanhos extraídos do uso no ./design (primary/secondary/outline/
 * ghost/danger; sm/md/lg; ícones à esquerda/direita; fullWidth; loading).
 */
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "light";
type Size = "sm" | "md" | "lg";

export type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconRight?: IconName;
  fullWidth?: boolean;
  loading?: boolean;
};

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-200",
  secondary: "bg-brand-50 text-brand-700 hover:bg-brand-100 focus-visible:ring-brand-200",
  outline: "border border-ink-200 bg-white text-ink-900 hover:bg-ink-50 focus-visible:ring-ink-200",
  ghost: "text-ink-700 hover:bg-ink-100 focus-visible:ring-ink-200",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-200",
  light: "bg-white text-brand-700 hover:bg-brand-50 focus-visible:ring-white/40",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-lg",
  lg: "h-12 px-5 text-[15px] gap-2 rounded-xl",
};

const ICON_SIZE: Record<Size, number> = { sm: 15, md: 17, lg: 18 };

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(function AppButton(
  {
    variant = "primary",
    size = "md",
    icon,
    iconRight,
    fullWidth,
    loading,
    disabled,
    className,
    children,
    ...props
  },
  ref,
) {
  const iconSize = ICON_SIZE[size];
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all",
        "focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80"
          aria-hidden
        />
      ) : (
        icon && <Icon name={icon} size={iconSize} />
      )}
      {children}
      {iconRight && !loading && <Icon name={iconRight} size={iconSize} />}
    </button>
  );
});
