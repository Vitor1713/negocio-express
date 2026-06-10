# Plano — Upload de imagens do produto com Azure Blob Storage

## Contexto

Hoje o cadastro de produto aceita imagem **apenas colando uma URL** de texto
(`ProductForm.tsx`, campo `imageUrl`). Na gravação, as páginas `new`/`[id]`
chamam `addImage(productId, { url, displayOrder, isCover })` depois de
criar/atualizar o produto.

Queremos: (1) **upload real de arquivo** para o **Azure Blob Storage** e
(2) UI **igual ao design** (`design/dash_products.jsx`): grade de até 8 imagens,
drag-and-drop, badge "Capa" na primeira, remover no hover, JPG/PNG até 5MB.

**Restrição de contrato (verificada no openapi ao vivo `:5248`):** o backend
.NET **não tem endpoint de upload** — `POST /products/{id}/images` aceita só
JSON `{ url, displayOrder, isCover }` e armazena a URL. Logo, o upload ao Azure
acontece no **lado Next.js**.

### Decisões (confirmadas com o usuário)
- **Arquitetura:** Route Handler Next.js (`/api/uploads`) faz o upload server-side
  com `@azure/storage-blob` e devolve a URL pública. Sem mudança no .NET.
- **Escopo:** galeria múltipla (até 8 imagens), fiel ao design.
- **Acesso:** container Azure com **leitura pública** → URL direta e permanente
  (server→Azure, sem CORS no browser).

### Fluxo final
Selecionar/soltar arquivo → upload imediato via `/api/uploads` → recebe `{ url }`
→ guarda no estado do form (`images[]`, sem `id`) → no **Salvar**, para cada
imagem nova chama `addImage`; para imagens removidas chama `deleteImage`. O
produto só precisa existir (`productId`) no momento do `addImage` (no save), não
no upload — então funciona igual em "novo" e "editar".

---

## O que você precisa fornecer (sua parte)

1. **Conta de Storage no Azure** + um **container** (ex.: `product-images`) com
   **nível de acesso público = Blob** (leitura anônima de blobs).
2. **Connection string** da conta (Portal → Storage account → Access keys →
   *Connection string*). Vamos colocá-la em `.env.local` **sem** prefixo
   `NEXT_PUBLIC_` (fica só no servidor):
   ```
   AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net"
   AZURE_STORAGE_CONTAINER="product-images"
   ```
   > Para produção (Vercel/host), cadastrar as mesmas variáveis no painel do host.
3. Confirmar que o domínio do blob (`https://<conta>.blob.core.windows.net`)
   pode ser exibido pela vitrine — ajustaremos `next.config` (`images` /
   `remotePatterns`) se a vitrine usar `next/image`.

> Nada de mudança no backend .NET é necessária.

---

## Etapas

Cada etapa tem os arquivos afetados e um **prompt pronto** para executar.

### Etapa 1 — Dependência + Route Handler de upload
**Arquivos:** `package.json` (+`@azure/storage-blob`), novo
`src/app/api/uploads/route.ts`.

- `route.ts`: `export const runtime = "nodejs"`. `POST` lê `formData()`, pega o
  `file`, **valida** content-type (`image/jpeg|png|webp`) e tamanho (≤ 5MB),
  gera nome único (`crypto.randomUUID()` + extensão), faz upload via
  `BlobServiceClient.fromConnectionString(...).getContainerClient(...)
  .getBlockBlobClient(name).uploadData(buffer, { blobHTTPHeaders: { blobContentType } })`
  e responde `{ url }` (o `blockBlobClient.url`). Erros → `{ errorMessages: [...] }`
  com status adequado, no mesmo formato do `ApiError` do projeto.
- **Gate v1:** exigir header `Authorization: Bearer ...` presente (a página do
  dashboard já é protegida por guarda de rota); validar a assinatura do JWT não
  é possível aqui sem a chave do .NET — anotar como ponto a endurecer depois.

> **Prompt da etapa 1:**
> "Adicione `@azure/storage-blob` e crie `src/app/api/uploads/route.ts` (runtime
> nodejs): POST que recebe `file` via FormData, valida tipo (jpeg/png/webp) e
> tamanho (≤5MB), envia ao Azure Blob usando `AZURE_STORAGE_CONNECTION_STRING` e
> `AZURE_STORAGE_CONTAINER`, e retorna `{ url }`. Exija header Authorization
> presente. Erros no formato `{ errorMessages: string[] }`."

### Etapa 2 — Serviço + hook de upload no front
**Arquivos:** `src/features/products/service.ts`, `src/features/products/hooks.ts`,
`src/features/products/index.ts`.

- `service.ts`: `uploadProductImage(file: File, token: string): Promise<{ url: string }>`
  — `fetch("/api/uploads", { method: "POST", body: FormData, headers:{Authorization} })`.
  **Não** usar `lib/api.ts` (ele é JSON-only e aponta pro .NET); é uma chamada
  multipart à rota interna do Next.
- `hooks.ts`: `useUploadImage()` (TanStack `useMutation`) que pega o token do
  AuthProvider e chama `uploadProductImage`. Expor estado de loading/erro por
  imagem para a UI.

> **Prompt da etapa 2:**
> "Em products/service.ts adicione `uploadProductImage(file, token)` que faz
> POST multipart para `/api/uploads` e retorna `{ url }`. Em hooks.ts crie
> `useUploadImage()` (useMutation) usando o token do AuthProvider. Reexporte no
> index.ts."

### Etapa 3 — Componente de galeria (UI igual ao design)
**Arquivos:** novo `src/features/products/components/ProductImageUploader.tsx`;
usa `AppCard`, `Icon` (`ImagePlus`, `X`), `cn`, `AppSpinner` de `components/ui`.

- Props controladas: `value: ProductImage[]`, `onChange(next)`, max 8.
- Grade `grid-cols-3 sm:grid-cols-4 gap-3`, tiles `aspect-square rounded-xl`
  **iguais ao `dash_products.jsx` (linhas 184–219)**, mas exibindo a **imagem
  real** (`<img src={img.url}>`) no lugar do placeholder de gradiente.
- Slot "Adicionar": `<input type=file accept=image/* multiple>` oculto +
  **drag-and-drop** (`onDrop`/`onDragOver`) na área tracejada.
- Ao selecionar/soltar: para cada arquivo chama `useUploadImage`; mostra spinner
  no tile enquanto sobe; ao concluir adiciona `{ url, displayOrder, isCover }`
  (primeiro = `isCover:true`). Badge "Capa" no índice 0; remover (X no hover);
  validação 5MB/tipo no cliente com mensagem.
- Texto de ajuda idêntico: "arraste imagens ou clique em adicionar · JPG/PNG até
  5MB · a primeira é a capa".

> **Prompt da etapa 3:**
> "Crie `ProductImageUploader.tsx` (galeria controlada de até 8 imagens) fiel ao
> bloco 'Imagens' do design/dash_products.jsx (linhas 184–219): grade de tiles
> quadrados, badge Capa no primeiro, remover no hover, slot tracejado com input
> file oculto + drag-and-drop. Usa useUploadImage; spinner por tile durante o
> upload; exibe a imagem real via <img>. Valida tipo/5MB no cliente."

### Etapa 4 — Integrar no ProductForm
**Arquivos:** `src/features/products/components/ProductForm.tsx`.

- Trocar o campo `imageUrl` (zod `string().url()`) por
  `images: z.array(z.object({ id: z.string().optional(), url: z.string(),
  displayOrder: z.number(), isCover: z.boolean() })).max(8)`.
- `defaultValues.images` ← `product?.images ?? []`.
- Substituir o card "Imagem de capa (URL)" (linhas 201–211) pelo
  `<ProductImageUploader>` ligado via `watch("images")`/`setValue("images")`.

> **Prompt da etapa 4:**
> "No ProductForm troque o campo `imageUrl` por `images: ProductImage[]` no
> schema/defaults e substitua o card de URL pelo ProductImageUploader,
> controlado por watch/setValue('images')."

### Etapa 5 — Persistência nas páginas (new + edit)
**Arquivos:** `src/app/dashboard/products/new/page.tsx`,
`src/app/dashboard/products/[id]/page.tsx`.

- **new:** após `createProduct` + variantes, percorrer `values.images` e chamar
  `addImage(productId, { url, displayOrder: i, isCover: i===0 })`.
- **edit (reconciliação por `id`/`url`):**
  - imagens do form **sem `id`** (recém-enviadas) → `addImage`.
  - imagens do servidor cujo `id` sumiu do form → `deleteImage`.
  - mudança de capa/ordem em imagens já existentes: como **não há endpoint de
    update de imagem**, fazer `deleteImage`+`addImage` apenas nas afetadas.
- Substitui a lógica atual de "troca de imagem única" (linhas 88–96 do `[id]`).

> **Prompt da etapa 5:**
> "Atualize new/page.tsx e [id]/page.tsx para persistir `values.images` como
> lista: no novo, addImage para cada uma; no editar, reconcilie por id/url
> (addImage para novas, deleteImage para removidas; capa/ordem alteradas em
> existentes = delete+readd, pois não há update de imagem)."

### Etapa 6 — Vitrine exibe a imagem (se necessário)
**Arquivos:** `next.config.*` (se a vitrine usar `next/image` com o domínio do
blob); conferir `ProductCard`/página da vitrine.

> **Prompt da etapa 6:**
> "Garanta que a vitrine exibe as imagens do blob: se usar next/image, adicione
> `<conta>.blob.core.windows.net` em images.remotePatterns no next.config."

---

## Verificação (end-to-end)

1. **Pré:** criar storage+container público no Azure e preencher `.env.local`
   (`AZURE_STORAGE_CONNECTION_STRING`, `AZURE_STORAGE_CONTAINER`).
2. `npm run dev`; logar no dashboard; **Produtos → Novo**.
3. Arrastar 2–3 JPG/PNG para a galeria → ver spinner por tile → preview real
   carrega; badge "Capa" no primeiro; testar remover e arquivo >5MB (deve
   recusar com mensagem).
4. **Salvar** → confirmar no Portal do Azure que os blobs subiram e que
   `GET /products/{id}` (via app ou curl) retorna `images[]` com as URLs do blob.
5. **Editar** o produto: remover uma imagem e adicionar outra → salvar → conferir
   que `deleteImage`/`addImage` refletiram (lista correta no GET).
6. Abrir a **vitrine** da loja e confirmar que as imagens aparecem.
7. `npx tsc --noEmit` limpo.

## Limitações conhecidas (v1)
- Blobs órfãos se o usuário enviar e cancelar sem salvar (sem GC). Aceitável p/ v1.
- Sem endpoint de update de imagem no .NET → mudança de capa/ordem em imagens já
  salvas usa delete+readd.
- Gate da rota `/api/uploads` apenas confere presença do Bearer; validação plena
  do JWT exigiria a chave do .NET — endurecer depois (ex.: endpoint .NET de SAS).
