/**
 * Route Handler de upload de imagens → Azure Blob Storage.
 *
 * O backend .NET não tem endpoint de upload: `POST /products/{id}/images`
 * só armazena uma URL. Então o arquivo sobe aqui (server-side), e o front
 * persiste a URL pública resultante via `addImage` no momento do Salvar.
 *
 * Erros seguem o envelope do projeto: { errorMessages: string[] } (ResponseError).
 *
 * Gate v1: exige header Authorization: Bearer presente (a página do dashboard
 * já é protegida por guarda de rota). Validar a assinatura do JWT exigiria a
 * chave do .NET — ponto a endurecer depois (ex.: endpoint .NET de SAS).
 */
import { BlobServiceClient } from "@azure/storage-blob";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function fail(status: number, message: string) {
  return NextResponse.json({ errorMessages: [message] }, { status });
}

export async function POST(req: Request) {
  if (!req.headers.get("authorization")?.startsWith("Bearer ")) {
    return fail(401, "Sessão expirada. Faça login novamente.");
  }

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const containerName = process.env.AZURE_STORAGE_CONTAINER;
  if (!connectionString || !containerName) {
    return fail(500, "Upload indisponível: armazenamento não configurado.");
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, "Requisição inválida.");
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return fail(400, "Nenhum arquivo enviado.");
  }

  const ext = ALLOWED[file.type];
  if (!ext) {
    return fail(415, "Tipo de arquivo inválido. Envie JPG, PNG ou WEBP.");
  }
  if (file.size > MAX_BYTES) {
    return fail(413, "Arquivo muito grande. Máximo 5MB.");
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const container = BlobServiceClient.fromConnectionString(connectionString).getContainerClient(
      containerName,
    );
    const blobName = `${randomUUID()}.${ext}`;
    const blockBlob = container.getBlockBlobClient(blobName);
    await blockBlob.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: file.type },
    });

    return NextResponse.json({ url: blockBlob.url });
  } catch {
    return fail(502, "Falha ao enviar a imagem. Tente novamente.");
  }
}
