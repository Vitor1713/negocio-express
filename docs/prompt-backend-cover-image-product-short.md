# Prompt — Adicionar `coverImageUrl` ao `ResponseProductShort` (backend .NET)

Cole o bloco abaixo no agente/dev do backend. Ele contém todo o contexto e os
critérios de aceite para a mudança.

---

## Contexto

No front-end do **Negócio Express**, a **listagem de produtos do dashboard**
(`GET /products`) não exibe a imagem de capa do produto — só um ícone genérico.
A causa é de contrato: o endpoint retorna `ResponseProductShort`, que hoje
**não tem nenhum campo de imagem** (só `id`, `name`, `slug`, `basePrice`,
`isActive`).

A vitrine pública já funciona porque o endpoint dela
(`GET /stores/{slug}/products`) retorna `ResponseCatalogProduct`, que **já**
expõe `coverImageUrl`. Queremos o mesmo campo no DTO do dashboard.

O front **já está pronto** para consumir o campo (renderiza a capa com fallback
para ícone quando vier `null`). Só falta o backend popular o dado.

## O que implementar

Adicionar a propriedade **`coverImageUrl`** ao DTO `ResponseProductShort`:

- **Tipo:** `string?` (nullable — produtos sem imagem retornam `null`).
- **Conteúdo:** a URL pública da **imagem de capa** do produto — a `ProductImage`
  com `isCover == true`; se nenhuma estiver marcada como capa, usar a de menor
  `displayOrder`; se o produto não tiver imagens, `null`.
- **Endpoint afetado:** `GET /products` (lista do dashboard, resposta
  `ResponseProducts { products: ResponseProductShort[] }`).

### Espelhar o que já existe

A lógica deve ser idêntica à já usada para montar `ResponseCatalogProduct.coverImageUrl`
na vitrine. Reusar o mesmo critério de seleção da capa para manter consistência
entre dashboard e vitrine.

### Atenção a performance (N+1)

A lista pode conter muitos produtos. Ao projetar `coverImageUrl`, evitar uma
query por produto: usar `Include`/projeção (`Select`) ou um `join`/subquery que
traga a capa junto na mesma consulta da listagem.

## Critérios de aceite

1. `GET /products` retorna cada item com `coverImageUrl` preenchido para produtos
   que têm imagem, e `null` para os que não têm.
2. O valor corresponde à imagem `isCover == true` (ou menor `displayOrder` como
   fallback) — mesma capa que aparece na vitrine para o mesmo produto.
3. A listagem não dispara uma query por produto (sem N+1).
4. O `openapi.json` (Swagger) gerado passa a incluir `coverImageUrl` em
   `ResponseProductShort`.

## Sincronização do contrato (front)

O front já adicionou `coverImageUrl?: string | null` em `ResponseProductShort`
no `openapi.json` local e regenerou `src/lib/api-types.ts`. Quando o backend
expuser o campo, **reexportar o `openapi.json` oficial** e rodar:

```bash
npm run gen:api
```

para realinhar os tipos gerados com a spec do servidor.

## Definição do campo (referência do contrato no front)

```json
"ResponseProductShort": {
  "type": "object",
  "properties": {
    "id":            { "type": "string", "format": "uuid" },
    "name":          { "type": "string" },
    "slug":          { "type": "string" },
    "basePrice":     { "type": ["number", "string"], "format": "double" },
    "isActive":      { "type": "boolean" },
    "coverImageUrl": { "type": ["null", "string"] }
  }
}
```
