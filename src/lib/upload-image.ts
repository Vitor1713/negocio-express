/**
 * Sobe um arquivo para o Azure Blob via Route Handler interno (`/api/uploads`)
 * e devolve a URL pública. NÃO usa `lib/api.ts` (JSON-only, aponta ao .NET):
 * é uma chamada multipart à rota do próprio Next. O token vai no Authorization
 * (gate v1 da rota só confere presença do Bearer).
 *
 * Reutilizado por qualquer feature que precise hospedar uma imagem (produtos,
 * logotipo da loja, etc.).
 */
export async function uploadImage(file: File, token: string): Promise<{ url: string }> {
  const body = new FormData();
  body.append("file", file);

  const res = await fetch("/api/uploads", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });

  if (!res.ok) {
    let message = "Falha ao enviar a imagem.";
    try {
      const data = (await res.json()) as { errorMessages?: string[] };
      if (data?.errorMessages?.[0]) message = data.errorMessages[0];
    } catch {
      /* corpo vazio ou não-JSON */
    }
    throw new Error(message);
  }

  return (await res.json()) as { url: string };
}
