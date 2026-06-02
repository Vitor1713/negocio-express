# SDD Front-end — Negócio Express

**Software Design Document — Front-end (Next.js)**
Especificação para implementação assistida com Claude Code.

> Fonte da verdade do contrato de dados: **openapi.json** (gerado do backend).
> Fonte da verdade visual: os **JSX do Claude Design** em `./design/`.
> Este documento descreve o que construir no front e como validar.

---

## 1. Visão Geral

Front-end web do **Negócio Express**, SaaS de e-commerce multi-tenant. Consome a
API .NET já implementada. São **4 superfícies**:

1. **Landing page** — pública, marketing/conversão.
2. **Login** — autenticação (painel e vitrine).
3. **Dashboard do lojista** — área autenticada de gestão.
4. **Vitrine da loja** — pública, por loja (`/stores/[slug]`).

---

## 2. Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS** (tokens extraídos do design)
- **TanStack Query** — estado servidor, cache, loading/erro
- **Zod** — validação de formulários
- **openapi-typescript** — tipos gerados do `openapi.json`

---

## 3. Arquitetura

### Estrutura por feature
```
src/
  app/                      → rotas (App Router)
    (marketing)/            → landing
    login/
    dashboard/              → painel do lojista
    stores/[slug]/          → vitrine pública
  components/
    ui/                     → design system (AppButton, AppInput, AppCard...)
  features/
    products/               → service, hooks, components, types
    orders/
    auth/
    ...
  lib/
    api.ts                  → cliente HTTP central
    api-types.ts            → tipos gerados do openapi.json
    query-client.ts         → config TanStack Query
```

### Integração com a API
- Base URL via `NEXT_PUBLIC_API_URL`.
- Cliente central em `lib/api.ts` injeta `Authorization: Bearer <token>` e
  padroniza tratamento de erro (mapeia status HTTP → erro tipado).
- **Sempre** usar os tipos de `lib/api-types.ts`; nunca redefinir DTO na mão.

### Autenticação
- Token JWT guardado de forma segura; provider/contexto de auth na raiz.
- Guarda de rota no `/dashboard` (redireciona para `/login` sem token).
- Claims usadas no front: `role`, `store_id` (lê do token, não confia em input).

### Multi-tenant no front
- **Vitrine:** `/stores/[slug]/...` — a loja vem do **slug na rota**.
- **Dashboard:** `/dashboard/...` — a loja vem do **token** (sem slug).

---

## 4. Design System

> Extraído dos JSX do `./design`, **não** inventado do zero.

- Tokens no Tailwind: cor primária **verde**, tipografia, espaçamento, raios.
- Componentes base reutilizáveis: `AppButton`, `AppInput`, `AppCard`,
  `AppTable`, `AppModal`, `AppBadge` (ajustar à realidade do design).
- Estilo **minimalista**. Toda tela reusa os componentes base — nunca estilos soltos.
- Estados padronizados em toda tela que consome API: **loading**, **erro**, **vazio**.

---

## 5. Requisitos por Superfície

### RF-F01 — Landing page (pública)
- Comunicação de valor, planos, CTA para cadastro.
- Responsiva, foco em conversão; sem dependência de auth.

### RF-F02 — Login
- Form de email/senha com validação (Zod).
- Painel: `POST /api/auth/login`. Vitrine: `POST /api/stores/{slug}/auth/login`.
- Ao logar: guarda token, redireciona por `role` (Lojista → dashboard,
  Customer → vitrine).
- Tratamento de credenciais inválidas e estados de loading.

### RF-F03 — Onboarding (wizard 3 etapas)
- Etapa 1: dados do usuário. Etapa 2: dados da loja (nome, CNPJ com máscara,
  email, telefone, categoria). Etapa 3: escolha do plano.
- Validação por etapa **no front** antes de avançar.
- Envio único ao final: `POST /api/auth/register`.

### RF-F04 — Dashboard do lojista (autenticado)
- Layout com navegação lateral + guarda de rota.
- Catálogo: CRUD de produtos, variações e imagens.
- Pedidos: lista + atualização de status.
- Entregadores: cadastro e atribuição.
- Equipe: cadastro de membros (Owner).

### RF-F05 — Vitrine da loja (pública)
- Catálogo de produtos ativos da loja (`/stores/[slug]`).
- Detalhe do produto: variações, imagens, avaliações.
- Carrinho (estado **no front** até o checkout).
- Checkout: endereço/tipo de entrega → cria pedido → pagamento.
- Área do cliente: pedidos, endereços, avaliação (compra verificada).

---

## 6. Requisitos Não-Funcionais

| Categoria | Requisito |
|---|---|
| **Responsividade** | Mobile-first; testar vitrine e dashboard no celular |
| **Acessibilidade** | Labels, foco visível, contraste adequado, navegação por teclado |
| **Performance** | Cache via TanStack Query; imagens otimizadas (next/image) |
| **Consistência** | Estados loading/erro/vazio em toda chamada de API |
| **Segurança** | Token nunca exposto em log; rotas protegidas com guarda |
| **Tipagem** | Tudo tipado a partir do openapi.json; zero `any` em chamadas de API |
| **SEO** | Vitrine e landing com metadata adequada (SSR/SSG onde fizer sentido) |

---

## 7. Plano de Implementação (faseado)

> 1 sessão = 1 fase. Cada fase só começa após a anterior revisada.

| Fase | Superfície | Entrega |
|---|---|---|
| 0 | **Setup** | Scaffold, tipos do OpenAPI, cliente HTTP, design system, esqueleto de rotas |
| 1 | **Auth** | Login, contexto de auth, guarda de rota, redirecionamento por role |
| 2 | **Referência (Dashboard/Produtos)** | Módulo de produtos ponta a ponta — padrão do projeto |
| 3 | **Onboarding** | Wizard 3 etapas → register |
| 4 | **Dashboard (restante)** | Pedidos, entregadores, equipe |
| 5 | **Vitrine** | Catálogo público + detalhe do produto |
| 6 | **Carrinho + Checkout** | Carrinho no front, checkout → pedido + pagamento |
| 7 | **Área do cliente** | Pedidos, endereços, avaliações |
| 8 | **Landing page** | Marketing/conversão |

> Auth (Fase 1) e o módulo de referência (Fase 2) são a base — fazem o padrão
> de consumo de API e de UI que todas as outras fases copiam.

---

## 8. Critérios de Aceite (por fase)

- [ ] Usa os tipos de `lib/api-types.ts` (sem DTO redefinido na mão).
- [ ] Reusa os componentes base do design system (sem estilos soltos).
- [ ] Estados de loading, erro e vazio implementados.
- [ ] Chamadas via cliente central (`lib/api.ts`) com token injetado.
- [ ] Rotas do dashboard protegidas por guarda.
- [ ] Multi-tenant correto (vitrine pelo slug, dashboard pelo token).
- [ ] Responsivo (testado em mobile).
- [ ] Sem `any` em integrações de API.

---

## 9. Como o Claude Code deve usar este documento

1. Ler `CLAUDE.md`, este `SDD_FRONTEND.md`, `openapi.json` e os JSX de `./design`.
2. Usar o módulo de referência (Fase 2) como padrão de service/hooks/componentes.
3. Implementar **uma fase por sessão**, na ordem do plano.
4. Validar contra os critérios de aceite (seção 8) ao final de cada fase.
5. Em dúvida de fluxo ou visual, perguntar antes de assumir.
