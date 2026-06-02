# CLAUDE.md — Negócio Express (Front-end)

Contexto inicial do front-end. Leia este arquivo no início de toda sessão.

---

## Sobre o projeto

Front-end web do **Negócio Express**, SaaS de e-commerce **multi-tenant** para
negócios locais. Consome a API .NET já implementada. Tem 4 superfícies:
landing page, login, dashboard do lojista e vitrine da loja (pública, por loja).

## Documentos e fontes da verdade (leia antes de codar)

1. **SDD_FRONTEND.md** — o que construir e como validar: superfícies, arquitetura,
   plano faseado e critérios de aceite.
2. **openapi.json** — contrato da API. Fonte da verdade dos dados.
3. **./design/** — JSX gerados pelo Claude Design. Fonte da verdade **visual**:
   extrair daqui o design system e os layouts; **não** reinventar o estilo.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- TanStack Query (estado servidor, cache, loading/erro)
- Zod (validação de formulários)
- Tipos da API gerados do `openapi.json` em `lib/api-types.ts`

## Módulo de referência

> Atualize após a Fase 2.

O módulo de **Produtos** (dashboard) é a referência de padrão: service → hooks
(TanStack Query) → components → página. Use-o como modelo para qualquer módulo novo.

## Convenções obrigatórias

- **Tipos sempre de `lib/api-types.ts`** — nunca redefinir DTO na mão; zero `any`
  em integrações de API.
- **Chamadas via `lib/api.ts`** (cliente central com token Bearer e erro padronizado).
- **Reusar os componentes base** de `components/ui` — nunca estilos soltos.
- **Design system extraído do `./design`** (cor primária verde, tipografia,
  espaçamento), não inventado.
- **Estados loading / erro / vazio** em toda tela que consome API.
- **Multi-tenant:** vitrine resolve a loja pelo `[slug]` na rota; dashboard
  resolve pelo token (sem slug).
- **Rotas do `/dashboard` protegidas** por guarda de rota.
- Mobile-first; vitrine e landing com metadata para SEO.

## Fluxo de trabalho

- **1 sessão = 1 fase**, na ordem do plano do SDD_FRONTEND.
- Sempre seguir o padrão do módulo de referência (Produtos).
- Ao final de cada fase, validar contra os **critérios de aceite** (SDD seção 8).
- Mostrar cada parte (service, hooks, componentes, página) antes de avançar.

## Antes de começar qualquer tarefa

1. Reler o SDD_FRONTEND.md no que for relevante à fase.
2. Conferir os tipos correspondentes em `lib/api-types.ts`.
3. Reler a tela correspondente em `./design`.
4. Em dúvida sobre fluxo ou visual, **perguntar antes de assumir**.
