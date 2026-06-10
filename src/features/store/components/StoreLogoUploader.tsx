"use client";

/**
 * Upload do logotipo da loja (imagem única, controlada). Diferente da galeria de
 * produtos (`ProductImageUploader`): aqui é só uma imagem — preview quadrado com
 * o logo atual e ações de enviar / trocar / remover. O arquivo sobe na hora ao
 * Azure (useUploadLogo); a URL só é persistida quando o lojista salva o formulário.
 * Validação de tipo (JPG/PNG/WEBP) e tamanho (≤5MB) no cliente.
 */
import { useRef, useState } from "react";
import { AppButton, AppSpinner, Icon } from "@/components/ui";
import { useUploadLogo } from "../hooks";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
};

export function StoreLogoUploader({ value, onChange }: Props) {
  const upload = useUploadLogo();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!ACCEPTED.includes(file.type)) {
      setError("Tipo inválido. Envie JPG, PNG ou WEBP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("A imagem excede 5MB.");
      return;
    }
    try {
      const { url } = await upload.mutateAsync(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar a imagem.");
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-ink-700 mb-2">Logotipo</label>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
          e.target.value = "";
        }}
      />

      <div className="flex items-center gap-4">
        {/* Preview / placeholder */}
        <div className="h-16 w-16 shrink-0 rounded-xl border border-ink-200 overflow-hidden bg-ink-50 grid place-items-center">
          {upload.isPending ? (
            <AppSpinner />
          ) : value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Logotipo da loja" className="h-full w-full object-cover" />
          ) : (
            <span className="text-white grid place-items-center h-full w-full bg-gradient-to-br from-brand-500 to-brand-700">
              <Icon name="Store" size={24} />
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <AppButton
              type="button"
              variant="outline"
              size="sm"
              icon="Upload"
              loading={upload.isPending}
              onClick={() => inputRef.current?.click()}
            >
              {value ? "Trocar logo" : "Enviar logo"}
            </AppButton>
            {value && !upload.isPending && (
              <AppButton
                type="button"
                variant="ghost"
                size="sm"
                icon="Trash2"
                onClick={() => {
                  setError(null);
                  onChange(null);
                }}
              >
                Remover
              </AppButton>
            )}
          </div>
          <p className="text-xs text-ink-500 font-mono">JPG, PNG ou WEBP · até 5MB</p>
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
