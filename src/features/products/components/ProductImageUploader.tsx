"use client";

/**
 * Galeria de imagens do produto (controlada, até 8). Fiel ao bloco "Imagens"
 * do design/dash_products.jsx (linhas 184–219): grade de tiles quadrados,
 * badge "Capa" no primeiro, remover no hover, slot tracejado com input file
 * oculto + drag-and-drop.
 *
 * Cada arquivo sobe imediatamente via useUploadImage (Azure Blob) e só entra
 * em `value` quando o upload conclui — durante o envio, um tile com spinner.
 * Validação de tipo (JPG/PNG/WEBP) e tamanho (≤5MB) no cliente.
 */
import { useRef, useState } from "react";
import { AppCard, AppSpinner, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useUploadImage } from "../hooks";

const MAX_IMAGES = 8;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export type UploaderImage = {
  id?: string;
  url: string;
  displayOrder: number;
  isCover: boolean;
};

type Props = {
  value: UploaderImage[];
  onChange: (next: UploaderImage[]) => void;
};

/** Reordena displayOrder/isCover após mudança (índice 0 = capa). */
function normalize(images: UploaderImage[]): UploaderImage[] {
  return images.map((img, i) => ({ ...img, displayOrder: i, isCover: i === 0 }));
}

export function ProductImageUploader({ value, onChange }: Props) {
  const upload = useUploadImage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = MAX_IMAGES - value.length - pending;

  async function handleFiles(files: FileList | File[]) {
    setError(null);
    const list = Array.from(files);
    if (!list.length) return;

    let slots = MAX_IMAGES - value.length - pending;
    const accepted: File[] = [];
    for (const file of list) {
      if (slots <= 0) {
        setError(`Máximo de ${MAX_IMAGES} imagens.`);
        break;
      }
      if (!ACCEPTED.includes(file.type)) {
        setError("Tipo inválido. Envie JPG, PNG ou WEBP.");
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError(`"${file.name}" excede 5MB.`);
        continue;
      }
      accepted.push(file);
      slots--;
    }
    if (!accepted.length) return;

    setPending((p) => p + accepted.length);
    // Mantém a ordem de seleção mesmo com uploads concorrentes.
    const results = await Promise.allSettled(accepted.map((f) => upload.mutateAsync(f)));
    setPending((p) => p - accepted.length);

    const uploaded: UploaderImage[] = [];
    for (const r of results) {
      if (r.status === "fulfilled") {
        uploaded.push({ url: r.value.url, displayOrder: 0, isCover: false });
      } else {
        setError(r.reason instanceof Error ? r.reason.message : "Falha ao enviar a imagem.");
      }
    }
    if (uploaded.length) onChange(normalize([...value, ...uploaded]));
  }

  function removeAt(index: number) {
    onChange(normalize(value.filter((_, i) => i !== index)));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  }

  return (
    <AppCard className="p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-ink-900">Imagens</h2>
        <span className="text-xs text-ink-500">
          {value.length}/{MAX_IMAGES}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {Array.from({ length: MAX_IMAGES }).map((_, i) => {
          const img = value[i];

          // Tile com imagem real
          if (img) {
            return (
              <div
                key={`img-${i}`}
                className="aspect-square rounded-xl border border-ink-200 overflow-hidden relative group bg-ink-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="h-full w-full object-cover" />
                {img.isCover && (
                  <span className="absolute top-1.5 left-1.5 text-[9px] font-bold bg-brand-600 text-white px-1.5 py-0.5 rounded">
                    Capa
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="absolute top-1.5 right-1.5 h-6 w-6 grid place-items-center rounded-md bg-white/90 text-ink-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Icon name="X" size={13} />
                </button>
              </div>
            );
          }

          // Tiles com spinner (uploads em andamento) logo após as imagens
          if (i >= value.length && i < value.length + pending) {
            return (
              <div
                key={`pending-${i}`}
                className="aspect-square rounded-xl border border-ink-200 bg-ink-50 grid place-items-center"
              >
                <AppSpinner />
              </div>
            );
          }

          // Slot "Adicionar" (primeiro tile vazio após imagens + pendentes)
          if (i === value.length + pending && remaining > 0) {
            return (
              <button
                key="add"
                type="button"
                onClick={() => inputRef.current?.click()}
                onDrop={onDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                className={cn(
                  "aspect-square rounded-xl border-2 border-dashed grid place-items-center transition-all",
                  dragActive
                    ? "border-brand-400 text-brand-600 bg-brand-50/50"
                    : "border-ink-300 bg-ink-50 text-ink-400 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50/50",
                )}
              >
                <div className="flex flex-col items-center gap-1">
                  <Icon name="ImagePlus" size={20} />
                  <span className="text-[10px] font-medium">Adicionar</span>
                </div>
              </button>
            );
          }

          // Placeholder vazio
          return (
            <div
              key={`empty-${i}`}
              className="aspect-square rounded-xl border border-dashed border-ink-200 bg-ink-50/50"
            />
          );
        })}
      </div>

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      <p className="mt-3 text-xs text-ink-500 font-mono">
        arraste imagens ou clique em adicionar · JPG/PNG até 5MB · a primeira é a capa
      </p>
    </AppCard>
  );
}
