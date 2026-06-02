import { cn } from "@/lib/cn";

/** Spinner base reutilizável para estados de loading. */
export function AppSpinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Carregando"
      className={cn(
        "inline-block h-6 w-6 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600",
        className,
      )}
    />
  );
}
