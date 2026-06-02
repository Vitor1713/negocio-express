/**
 * AppField — wrapper de label + controle + hint, para compor controles que
 * não são <input> nativo (selects custom, toggles, grupos). Extraído de Field
 * no ./design.
 */
import { type ReactNode } from "react";

export type AppFieldProps = {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
};

export function AppField({ label, hint, error, required, htmlFor, children }: AppFieldProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink-700">
          {label} {required && <span className="text-brand-600">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-ink-500">{hint}</p>
      )}
    </div>
  );
}
