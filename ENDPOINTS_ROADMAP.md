# Roadmap — consumo dos endpoints faltantes

Auditoria (jun/2026): **36 de 60** endpoints do `openapi.json` eram consumidos.
Plano para ligar os 24 restantes, **uma feature por vez** (service → hooks →
components → página), no padrão do módulo de referência (Produtos).

> **Status (jun/2026): roadmap concluído ✅** — todas as 9 features em escopo (F1–F9)
> foram ligadas. Único bloqueio remanescente é por contrato: `PUT /deliveries/{id}/assign`
> (o backend não expõe `deliveryId`). Admin de planos segue fora de escopo.

> Plans-admin (`POST/PUT/DELETE /plans`, `GET /plans/{id}`) fica **fora de escopo**
> — é super-admin, não faz parte das 4 superfícies do SDD.

## Progresso

| # | Feature | Superfície | Endpoints | Status |
|---|---------|-----------|-----------|--------|
| 1 | **Configurações da loja** | Dashboard | `GET /store`, `PUT /store` | ✅ Concluída |
| 2 | **Home / Visão geral** | Dashboard | `GET /store/dashboard` | ✅ Concluída |
| 3 | **Categorias (CRUD)** | Dashboard | `GET /categories/{id}`, `POST /categories`, `PUT /categories/{id}`, `DELETE /categories/{id}` | ✅ Concluída |
| 4 | **Cupons (CRUD)** | Dashboard | `GET /coupons`, `GET /coupons/{id}`, `POST /coupons`, `PUT /coupons/{id}`, `DELETE /coupons/{id}` | ✅ Concluída |
| 5 | **Pedidos: detalhe + fluxo** | Dashboard | `GET /orders/{id}`, `GET /orders/status-flow` | ✅ Concluída |
| 6 | **Entregadores: editar/excluir** | Dashboard | `PUT /deliverers/{id}`, `DELETE /deliverers/{id}` | ✅ Concluída |
| 7 | **Equipe: editar/remover** | Dashboard | `PUT /team/{memberId}`, `DELETE /team/{memberId}` | ✅ Concluída |
| 8 | **Checkout: preview** | Vitrine | `POST /stores/{slug}/orders/preview` | ✅ Concluída |
| 9 | **Sessão: refresh de token** | Auth | `POST /auth/refresh` | ✅ Concluída |
| — | ~~Admin de planos~~ | (super-admin) | `GET /plans/{id}`, `POST/PUT/DELETE /plans` | 🚫 Fora de escopo |

## Detalhes / observações por feature

- **F1 — Configurações da loja** ✅
  Rota `/dashboard/settings` (antes 404). Edita nome/email/telefone/segmento;
  slug/CNPJ read-only; preserva campos operacionais (`isOpen`, `deliveryFee`,
  `minOrderAmount`, `estimatedDeliveryMinutes`) no PUT. Esses 4 ainda **não têm UI**
  (fora do mock) — possível follow-up "card de Operação/Entrega".
  Corrigiu de quebra o bug de guarda de papel (`storeRole` vs `role`).

- **F2 — Home/Visão geral** ✅
  5 cards de métricas (vendas/pedidos hoje, pendentes, em preparo, produtos) +
  "Pedidos recentes" reusando `GET /orders`. Substituiu o esqueleto de
  `src/app/dashboard/page.tsx`. **Gaps de backend** (no design, sem API): gráfico
  de faturamento 7 dias, estoque baixo e deltas de tendência — omitidos.

- **F3 — Categorias** ✅
  Rota `/dashboard/categories` (+ link no nav). CRUD completo: lista ordenada,
  criar/editar via drawer (edição carrega detalhe por `GET /categories/{id}`),
  toggle ativo rápido (PUT) e excluir (com confirmação no footer). Centralizou o
  service de categorias — `products` agora reusa (`listDashboardCategories` virou
  reexport). Estabelece o padrão de CRUD completo para F6/F7.

- **F4 — Cupons** ✅
  Rota `/dashboard/coupons` (+ nav). CRUD completo em grid de cards (tipo, valor,
  pedido mín., validade, barra de uso, status). `discountType` aceito pelo backend:
  **`Percentage`** e **`FixedAmount`** (string livre no openapi; validado por probe).
  ⚠️ **Bug de backend:** criar/editar cupom com `validUntil` (ou `validFrom`)
  preenchido retorna **500** ("error saving the entity changes") — a coluna de data
  não persiste. O campo "Válido até" existe na UI (está no design) mas hoje quebra
  se preenchido; sem data funciona. Precisa de correção no backend.

- **F5 — Pedidos** ✅
  `GET /orders/{id}` destravou o `OrderDrawer` (itens, cliente, endereço, totais);
  `GET /orders/status-flow` dá as transições válidas (botões de avanço dinâmicos).
  **Correção importante:** o status de pedido estava em minúsculo errado
  (`pending/paid/...`); trocado para o real PascalCase do backend
  (`Pending→Confirmed→Preparing→Ready→Shipped→Delivered` + `Cancelled`) em
  `status.ts`, `OrdersList` (filtros) e `OrderDrawer`. **Gap de backend:**
  `ResponseOrderShort` (lista) não traz o nome do cliente, só `customerId` (UUID)
  — a lista mostra o UUID; o nome só aparece no detalhe.

- **F6 — Entregadores** ✅
  `PUT /deliverers/{id}` (editar) e `DELETE /deliverers/{id}` ligados ao
  `DelivererForm` (edição prefill + exclusão com confirmação no footer) e à lista
  (toggle rápido de disponibilidade via PUT). ⚠️ **Soft-delete:** o DELETE responde
  204 mas só marca `isActive=false` — o entregador continua na lista como inativo.
  Não confundir com `PUT /deliveries/{id}/assign` (atribuição), que está codado mas
  **bloqueado** — o backend não expõe `deliveryId` em lugar nenhum (sem `GET /deliveries`
  e os pedidos não trazem o id da entrega).

- **F7 — Equipe** ✅
  `PUT /team/{memberId}` (só `role` é editável) e `DELETE /team/{memberId}` (204).
  Novo `TeamMemberForm` (drawer) edita a função e remove com confirmação no footer;
  cada linha da lista ganhou botão de editar. **Guarda:** o Owner e o próprio usuário
  logado (match por `userId`/`sub` ou `userEmail`/`email` do JWT) não têm ação de
  editar/remover. Funções atribuíveis: `Manager`/`Staff` (Owner não é convidável).

- **F8 — Checkout preview** ✅
  `POST /stores/{slug}/orders/preview` dá os totais **autoritativos** (subtotal,
  frete, desconto, total) a partir do mesmo `RequestCreateOrder` do pedido. Ligado
  via `usePreviewOrder` (query keyed por slug+body; refaz ao mudar entrega/endereço/
  cupom/itens; `enabled` só após o carrinho). O `OrderSummary` passa a priorizar os
  valores do backend (com spinner no `isFetching`) e o `PaymentStep` mostra o total
  do preview; o cálculo client-side (`calcTotals`/`DELIVERY_FEE` 6.9) vira **fallback**
  enquanto o preview carrega ou falha. Endpoint é auth-opcional (`security: [{}]`).
  **Obs.:** o frete fixo client-side (6.9) continua só como fallback — o valor real
  vem do backend (depende da loja/endereço).

- **F9 — Refresh de token** ✅
  `authService.refresh()` (`POST /auth/refresh`, sem body — o backend renova a partir
  do bearer atual). O `AuthProvider` ganhou um efeito que **agenda** o refresh
  ~1 min antes do `exp` do JWT (skew de 60s, delay mínimo de 5s p/ não entrar em loop):
  sucesso troca o token e reagenda; **401** (`ApiError.isAuth`) encerra a sessão; erro
  transitório (rede) preserva a sessão. Reroda a cada troca de token (login/refresh).
  Sem `exp` no token, não agenda. Endpoint é auth-opcional no contrato (`security: [{}]`),
  mas só faz sentido autenticado.
