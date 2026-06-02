"use client";

/** Estado de ERRO padronizado, com retentativa opcional. */
import { ApiError } from "@/lib/api";
import { Icon } from "./Icon";
import { AppButton } from "./AppButton";

export type AppErrorStateProps = {
  error: unknown;
  onRetry?: () => void;
  title?: string;
};

function messageOf(error: unknown): string {
  if (error instanceof ApiError) return error.messages.join(" ");
  if (error instanceof Error) return error.message;
  return "Não foi possível carregar os dados.";
}

export function AppErrorState({ error, onRetry, title = "Algo deu errado" }: AppErrorStateProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50/50 p-8 text-center sm:p-12">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-red-100 text-red-500">
        <Icon name="TriangleAlert" size={22} />
      </div>
      <p className="font-medium text-ink-900">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-ink-500">{messageOf(error)}</p>
      {onRetry && (
        <div className="mt-4 flex justify-center">
          <AppButton variant="outline" size="sm" icon="RotateCw" onClick={onRetry}>
            Tentar novamente
          </AppButton>
        </div>
      )}
    </div>
  );
}
