# PROMPTS_FRONT.md — Negócio Express (Front-end)

Prompts prontos para cada sessão do Claude Code no front. **1 sessão = 1 fase.**

Convenções gerais (valem para todas as fases):
- Contrato de dados: **openapi.json**. Tipos em `lib/api-types.ts` — **nunca** redefinir DTO na mão.
- Visual: JSX do Claude Design em `./design` — **extrair**, não reinventar.
- Reusar sempre os componentes base do design system (`components/ui`).
- Estados de **loading / erro / vazio** em toda tela que consome API.
- Chamadas via cliente central `lib/api.ts` com token injetado.
- Multi-tenant: vitrine pelo `[slug]` na rota; dashboard pelo token.
- Mostrar cada parte antes de avançar.

> Ajuste os caminhos `./openapi.json` e `./design/` para os reais do seu projeto.

---

## Fase 0 — Setup

```
Vamos criar o SETUP do front-end do Negócio Express em Next.js.

CONTEXTO:
- Front de um SaaS de e-commerce multi-tenant. A API .NET já está pronta.
- Contrato da API em ./openapi.json
- Telas geradas pelo Claude Design (JSX) em ./design/ -- REFERÊNCIA visual,
  a adaptar para a estrutura real do projeto.
- 4 superfícies: landing, login, dashboard do lojista, vitrine da loja.

OBJETIVO: montar a fundação. NÃO implemente as telas inteiras ainda.
Faça nesta ordem, me mostrando antes de avançar:

1. SCAFFOLD: Next.js (App Router) + TypeScript + Tailwind. Estrutura por
   feature. Env NEXT_PUBLIC_API_URL.
2. TIPOS: gere os tipos do ./openapi.json com openapi-typescript em
   lib/api-types.ts. Nunca redefina interfaces na mão.
3. CLIENTE HTTP + AUTH: lib/api.ts central (base URL, token Bearer, erro
   padronizado). Contexto/provider de auth e guarda de rota do dashboard.
   TanStack Query configurado na raiz.
4. DESIGN SYSTEM: analise os JSX de ./design e EXTRAIA componentes base
   (AppButton, AppInput, AppCard, AppTable...) e tokens (verde, tipografia,
   espaçamento) para o Tailwind. Me mostre o design system extraído.
5. ROTEAMENTO (esqueleto, sem conteúdo): / (landing), /login,
   /dashboard/... (com guarda), /stores/[slug]/... (slug = loja).

Ao final, resuma a estrutura e confirme que o design system veio do ./design.
```

---

## Fase 1 — Auth (login)

```
Fase 1: autenticação. Releia o RF-F02 do SDD_FRONTEND e a tela de login
em ./design.

Implemente:
- Tela de login reusando os componentes base (AppInput, AppButton).
- Validação com Zod (email/senha).
- Painel:  POST /api/auth/login
  Vitrine: POST /api/stores/{slug}/auth/login
  (use os tipos de lib/api-types.ts).
- Ao logar: guardar o token, popular o contexto de auth, e redirecionar por
  role (Lojista → /dashboard, Customer → vitrine da loja).
- Estados de loading e erro (credenciais inválidas).
- Guarda de rota: acessar /dashboard sem token redireciona para /login.

Mostre o contexto de auth e o cliente antes das telas.
```

---

## Fase 2 — Módulo de referência (Dashboard / Produtos)

```
Fase 2: criar o PADRÃO DE REFERÊNCIA do projeto com o módulo de Produtos
no dashboard (listar, criar, editar, excluir). Servirá de template para
todos os outros módulos.

Releia em ./design as telas de produtos (lista e formulário) e use os tipos
de produto/variação/imagem em lib/api-types.ts.

Implemente, nesta ordem, mostrando antes de seguir:
1. features/products/service.ts  → chamadas à API tipadas (via lib/api.ts)
2. features/products/hooks.ts     → TanStack Query (queries + mutations,
   com invalidação de cache)
3. features/products/components/   → lista, formulário (Zod), card
4. app/dashboard/products/...      → páginas (App Router)

Inclua estados loading/erro/vazio. Reuse os componentes base.
Capriche — este módulo é o template de todo o resto. Ao final, descreva o
padrão que ficou estabelecido para eu validar antes das próximas fases.
```

---

## Fase 3 — Onboarding (wizard 3 etapas)

```
Fase 3: onboarding (RF-F03). Releia a tela do wizard em ./design.

Implemente um wizard de 3 etapas:
- Etapa 1: dados do usuário (nome, email, senha, telefone).
- Etapa 2: dados da loja (nome, CNPJ com máscara, email, telefone, categoria).
- Etapa 3: escolha do plano (consome a lista de planos da API).

Regras:
- Validação por etapa NO FRONT antes de avançar (Zod).
- Estado das etapas mantido no front; só envia no final.
- Envio único: POST /api/auth/register (tipos de lib/api-types.ts).
- Ao sucesso: guarda token e redireciona para /dashboard.

Reuse os componentes base e o padrão estabelecido na Fase 2.
```

---

## Fase 4 — Dashboard (restante)

```
Fase 4: completar o dashboard (RF-F04), seguindo o padrão da Fase 2.
Releia as telas correspondentes em ./design.

Módulos:
- Pedidos: lista + atualização de status (PUT /api/orders/{id}/status).
- Entregadores: cadastro (POST /api/deliverers) e atribuição
  (PUT /api/deliveries/{id}/assign).
- Equipe: cadastro de membro (POST /api/team) — só Owner.

Para cada um: service → hooks → components → página, reusando o padrão e os
componentes base. Estados loading/erro/vazio. Tipos de lib/api-types.ts.
```

---

## Fase 5 — Vitrine pública

```
Fase 5: vitrine pública da loja (RF-F05, parte 1). Releia as telas de
vitrine e detalhe do produto em ./design.

Rotas públicas sob /stores/[slug] (a loja vem do slug, não do token):
- /stores/[slug]            → catálogo de produtos ATIVOS
  (GET /api/stores/{slug}/products)
- /stores/[slug]/[prodSlug] → detalhe: variações, imagens, avaliações
  (GET /api/stores/{slug}/products/{prodSlug})

Sem necessidade de auth para navegar. Considere SSR/SSG para SEO.
Reuse os componentes base; estados loading/erro/vazio. Mobile-first.
```

---

## Fase 6 — Carrinho + Checkout

```
Fase 6: carrinho e checkout (RF-F05, parte 2). Releia as telas em ./design.

- Carrinho: estado NO FRONT (adicionar/remover variações, quantidades).
- Checkout: escolher tipo de entrega e endereço do cliente, revisar o pedido.
- Criar pedido: POST /api/stores/{slug}/orders
- Pagamento:    POST /api/stores/{slug}/orders/{id}/payment
  (tipos de lib/api-types.ts).
- Tratar estados de pagamento (aprovado/recusado) e permitir retentativa.

Esta fase tem fluxo sensível (pedido + pagamento). Mostre o gerenciamento de
estado do carrinho e o fluxo de checkout antes de implementar as telas.
```

---

## Fase 7 — Área do cliente

```
Fase 7: área do cliente na vitrine (RF-F05, parte 3). Releia ./design.

Sob /stores/[slug] (cliente autenticado):
- Meus pedidos: histórico e status.
- Endereços: GET/POST /api/stores/{slug}/addresses (CRUD).
- Avaliações: POST /api/stores/{slug}/reviews — só para produtos de um pedido
  do próprio cliente (compra verificada). O front deve permitir avaliar
  apenas itens elegíveis.

Padrão da Fase 2, componentes base, estados loading/erro/vazio.
```

---

## Fase 8 — Landing page

```
Fase 8: landing page pública (RF-F01). Releia a landing em ./design.

- Comunicação de valor, seção de planos, CTA para cadastro (→ onboarding).
- Responsiva, mobile-first, foco em conversão.
- Sem dependência de auth. Metadata para SEO.
- Reuse os componentes base e os tokens do design system.

Se a lista de planos vier da API, consuma-a; senão, deixe estática conforme
o ./design.
```

---

## Lembretes ao revisar cada fase (critérios de aceite — SDD seção 8)

- [ ] Usa os tipos de lib/api-types.ts (sem DTO na mão).
- [ ] Reusa os componentes base (sem estilos soltos).
- [ ] Estados loading/erro/vazio implementados.
- [ ] Chamadas via lib/api.ts com token injetado.
- [ ] Rotas do dashboard protegidas por guarda.
- [ ] Multi-tenant correto (vitrine pelo slug, dashboard pelo token).
- [ ] Responsivo (testado em mobile).
- [ ] Sem `any` nas integrações de API.
```
