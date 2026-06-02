"use client";

/**
 * AppInput — campo de texto base (label + ícone + erro + hint).
 * Semântica nativa (onChange recebe o evento) para casar com Zod/forms na Fase 1.
 * Para senha, use type="password": mostra o toggle de visibilidade.
 */
import { forwardRef, useId, useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

export type AppInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  icon?: IconName;
  error?: string;
  hint?: string;
};

export const AppInput = forwardRef<HTMLInputElement, AppInputProps>(function AppInput(
  { label, icon, error, hint, className, type = "text", id, required, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const isPassword = type === "password";
  const [show, setShow] = useState(false);
  const resolvedType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-700">
          {label} {required && <span className="text-brand-600">*</span>}
        </label>
      )}
      <div
        className={cn(
          "flex items-stretch overflow-hidden rounded-lg border bg-white transition-all",
          "focus-within:ring-2",
          error
            ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-100"
            : "border-ink-200 focus-within:border-brand-600 focus-within:ring-brand-100",
        )}
      >
        {icon && (
          <span className="grid place-items-center pl-3 text-ink-400">
            <Icon name={icon} size={17} />
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          type={resolvedType}
          required={required}
          aria-invalid={Boolean(error)}
          className={cn(
            "min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-ink-900",
            "placeholder-ink-400 focus:outline-none disabled:text-ink-500",
            className,
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="grid place-items-center px-3 text-ink-400 transition-colors hover:text-ink-700"
            aria-label={show ? "Ocultar senha" : "Mostrar senha"}
          >
            <Icon name={show ? "EyeOff" : "Eye"} size={17} />
          </button>
        )}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-ink-500">{hint}</p>
      )}
    </div>
  );
});
