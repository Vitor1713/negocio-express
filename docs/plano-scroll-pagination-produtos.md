# Scroll pagination (infinite scroll) — Produtos: dashboard + vitrine

## Contexto

As duas listagens de produtos hoje carregam o **catálogo inteiro de uma vez** e
renderizam tudo num grid, sem nenhuma paginação:

- Dashboard: `GET /products` → `useProducts()` (`useQuery`) → `ProductList`.
- Vitrine: `GET /stores/{slug}/products` → `useStoreProducts()` (`useQuery`) → `StoreCatalog`.

A API **não expõe paginação** (sem `page`/`pageSize`/`cursor` e sem metadata como
`totalCount`/`hasNextPage`) em nenhum dos dois endpoints. Logo, o ganho real de
paginação (payload menor, menos DB/rede) só existe com suporte do **backend** —
isso é o "mais viável" tecnicamente, mas vive **fora deste repo** e o backend
costuma estar atrás da spec do front.

**Decisão:** implementar o **front-end já no formato de paginação**
(`useInfiniteQuery` + serviço `page/pageSize`), fatiando no cliente por enquanto.
Quando o backend paginar, troca-se **apenas o corpo da função de serviço** — hooks,
componentes e UI ficam prontos sem retrabalho.

### Tradeoff assumido (interino)
Enquanto o serviço fatia no cliente, cada "página" busca a **lista completa** e
recorta o trecho pedido — ou seja, o payload **não** diminui ainda e há refetch da
lista a cada nova página. É aceitável porque hoje o catálogo já cabe numa resposta
só; o custo some quando o backend passar a paginar de verdade. O benefício imediato
é UX (render progressivo / scroll suave) e a UI pronta para o backend.

---

## Mudanças

### 1. Utilitário de paginação compartilhado — `src/lib/pagination.ts` (novo)
- Tipo `Paged<T> = { items: T[]; page: number; pageSize: number; total: number; hasNextPage: boolean }`
  — espelha o envelope que o backend deve retornar futuramente.
- `paginate<T>(all: T[], page: number, pageSize: number): Paged<T>` — recorte
  client-side (interino), usado pelos dois serviços.
- `const DEFAULT_PAGE_SIZE = 12` (múltiplo de 1/2/3 colunas dos grids).

### 2. Sentinela de scroll reutilizável — `src/components/ui/InfiniteScrollSentinel.tsx` (novo)
- Props: `{ hasMore: boolean; isLoading: boolean; onLoadMore: () => void }`.
- `IntersectionObserver` num `ref` (div invisível ao fim da lista); chama
  `onLoadMore()` ao entrar em viewport quando `hasMore && !isLoading`.
- Renderiza `<AppSpinner />` enquanto `isLoading`; nada quando `!hasMore`.
- Primeiro padrão de IntersectionObserver/infinite-scroll do repo (não existe outro).
- Exportar em `src/components/ui/index.ts`.

### 3. Dashboard (módulo de referência `features/products`)
- **`service.ts`**: adicionar
  `listProductsPaged({ page, pageSize, search }): Promise<Paged<ProductShort>>`.
  Interino: `const all = await listProducts();` → filtra por `search` (nome/slug,
  igual ao filtro atual de `ProductList`) → `return paginate(filtered, page, pageSize)`.
  Comentar o ponto exato de troca para o backend (`GET /products?page&pageSize&search`).
- **`hooks.ts`**: adicionar `useProductsInfinite({ search }?)` com `useInfiniteQuery`:
  - `queryKey: [...PRODUCTS_KEY, "infinite", search ?? ""]` — fica **sob `PRODUCTS_KEY`**,
    então as invalidações existentes nas mutations (`invalidateQueries({ queryKey: PRODUCTS_KEY })`)
    já cobrem a lista infinita; nenhuma mutation precisa mudar.
  - `initialPageParam: 1`, `getNextPageParam: (last) => last.hasNextPage ? last.page + 1 : undefined`.
  - Manter `useProducts()` (sem outros consumidores além do `ProductList`, mas é barato manter).
- **`components/ProductList.tsx`**: trocar `useProducts` por `useProductsInfinite`.
  - `search` passa a ser parâmetro do hook (com pequeno **debounce** ~300ms, via
    estado local, para não disparar refetch a cada tecla).
  - `const list = data?.pages.flatMap(p => p.items) ?? []` para o grid.
  - Contador do header usa o total real: `data?.pages[0]?.total ?? 0`.
  - Após o grid, renderizar `<InfiniteScrollSentinel hasMore={hasNextPage} isLoading={isFetchingNextPage} onLoadMore={fetchNextPage} />`.
  - Preservar estados loading/erro/vazio atuais.

### 4. Vitrine (`features/storefront`)
- **`service.ts`**: adicionar
  `listStoreProductsPaged(slug, { page, pageSize, search, categoryId }, signal?): Promise<Paged<CatalogProduct>>`.
  Interino: reusa `listStoreProducts(slug, { search, categoryId }, signal)` (o backend
  **já** aceita `search` e `categoryId` server-side) e aplica `paginate(...)` no resultado.
- **`hooks.ts`**: adicionar
  `useStoreProductsInfinite(slug, { categoryId, search }, initialProducts?)` com `useInfiniteQuery`:
  - `queryKey: ["storefront", slug, categoryId ?? "all", search ?? "", "infinite"]`.
  - `initialData` (preserva o SSR): quando `!categoryId && !search && initialProducts`,
    semear como `InfiniteData` com a 1ª página → `{ pages: [paginate(initialProducts, 1, pageSize)], pageParams: [1] }`.
  - `getNextPageParam` igual ao do dashboard.
- **`components/StoreCatalog.tsx`**: trocar `useStoreProducts` por `useStoreProductsInfinite`.
  - `search` (hoje filtrado client-side) passa a parâmetro do hook, com **debounce** ~300ms.
  - `categoryId` continua como já é.
  - `const filtered = data?.pages.flatMap(p => p.items) ?? []`; contador de "itens"
    usa `data?.pages[0]?.total`.
  - Sentinela após o grid; manter header/categorias/footer e estados loading/erro/vazio.

---

## Arquivos
- Novos: `src/lib/pagination.ts`, `src/components/ui/InfiniteScrollSentinel.tsx`
- Editados:
  - `src/components/ui/index.ts`
  - `src/features/products/service.ts`, `hooks.ts`, `components/ProductList.tsx`
  - `src/features/storefront/service.ts`, `hooks.ts`, `components/StoreCatalog.tsx`

Sem mudança de tipos (`api-types.ts` intacto) e sem mudança nas mutations.

---

## Quando o backend paginar (troca futura, documentada nos serviços)
Substituir o corpo de `listProductsPaged` / `listStoreProductsPaged` por uma chamada
real (`query: { page, pageSize, search, categoryId }`) e mapear a resposta para
`Paged<T>`. Hooks, componentes e sentinela permanecem iguais. Se o backend retornar
`hasNextPage`/`total` no envelope, idealmente regerar `api-types.ts` via `npm run gen:api`.

---

## Verificação
1. `npm run lint` e `npm run build` — zero erros de tipo (sem `any`, tipos de `api-types`).
2. `npm run dev`:
   - **Dashboard** `/dashboard/products`: com catálogo > `pageSize`, ver só as
     primeiras `12` cards; rolar até o fim carrega o próximo lote (spinner do sentinel);
     contador do header mostra o total real; busca filtra e re-pagina; criar/editar/excluir
     produto continua refletindo na lista (invalidação).
   - **Vitrine** `/stores/[slug]`: idem com `12` por lote; trocar categoria reinicia a
     paginação; busca (debounced) re-pagina; primeiro paint via SSR mantido (sem flash
     de lista vazia); estados vazio/erro corretos.
3. Confirmar que ao rolar não há erros de console e o `IntersectionObserver` é
   desconectado no unmount.
