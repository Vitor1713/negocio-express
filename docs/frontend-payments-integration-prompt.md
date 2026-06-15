# Prompt — Front-end: integração de pagamentos (PIX + cartão / Asaas split)

> **Para a IA/dev de front-end.** Implemente as telas e campos para consumir o fluxo de
> pagamento do Negócio Express. O back-end já está pronto. O contrato completo e versionado
> está em [`docs/openapi.json`](./openapi.json) — use-o como fonte da verdade dos schemas.
> Este documento resume **o que precisa existir no front** e **as regras que não dá para inferir
> só pelo schema**.

---

## 1. Contexto do modelo (leia antes de codar)

- Pagamento é **assíncrono** e com **split**: o valor cai numa subconta Asaas da loja (líquido)
  e a plataforma retém a comissão. O front não lida com split — só inicia a cobrança e acompanha o status.
- **Cartão de crédito**: autoriza **na hora**. A resposta já volta `status: "Confirmed"` e o
  pedido já fica `Confirmed`. Não precisa polling para confirmar (mas a liquidação real é em D+32 — irrelevante p/ UX do cliente).
- **PIX**: a resposta volta `status: "Created"` com QR Code / copia-e-cola. A confirmação chega
  **depois**, por webhook do Asaas (cliente paga no app do banco). O front precisa **fazer polling**
  até o pedido virar `Confirmed`.
- Antes de cobrar, a loja precisa ter uma **subconta de pagamento aprovada** (`CanReceivePayments: true`).
  Sem isso, o checkout retorna `409`.

Há dois públicos no front:

| Público | O que implementar |
|---|---|
| **Lojista** (StoreUser) | Onboarding da subconta de pagamento, status da conta, estorno de pagamento |
| **Cliente** (Customer) | Checkout: criar pedido → pagar (PIX/cartão) → acompanhar status |

---

## 2. Autenticação (recap)

Todas as rotas protegidas usam **JWT** no header `Authorization: Bearer <token>`.

- **Cliente**: `POST /stores/{slug}/auth/register` ou `POST /stores/{slug}/auth/login` → `{ token, expiresAt }`.
- **Lojista**: `POST /auth/login` (ou `/auth/register` no cadastro inicial da loja) → `{ token, expiresAt }`.

O `token` carrega o `StoreId` e o papel; o front **não** envia StoreId — ele vem do token.

---

## 3. Fluxo do CLIENTE (checkout)

### 3.1. (Opcional) Pré-visualizar o pedido — `POST /stores/{slug}/orders/preview`
Use para mostrar subtotal/frete/desconto/total **sem criar** o pedido. Não recalcule no front; exiba o que vier.

Body (`RequestCreateOrder`):
```json
{
  "deliveryType": "Pickup",            // "Pickup" | "Delivery"
  "addressId": null,                    // obrigatório quando deliveryType = "Delivery"
  "couponCode": null,                   // opcional
  "items": [{ "productVariantId": "<uuid>", "quantity": 2 }]
}
```
Resposta (`ResponseOrderPreview`): `subtotal, deliveryFee, discountAmount, total, items[]`.

### 3.2. Criar o pedido — `POST /stores/{slug}/orders`
- Header recomendado: **`Idempotency-Key: <uuid>`** (evita pedido duplicado em retry/duplo-clique).
- Mesmo body do preview.
- **201** → `ResponseOrder` (`id`, `number`, `status` = `"Pending"`, `total`, `items[]`, …). Guarde o `id`.
- **409** → `ResponseInsufficientStock`:
  ```json
  { "errorMessages": ["..."], "unavailableItems": [
    { "productVariantId": "<uuid>", "productName": "...", "variantName": "...", "requested": 3, "available": 1 }
  ] }
  ```
  Mapeie `unavailableItems` por linha do carrinho.

### 3.3. Pagar o pedido — `POST /stores/{slug}/orders/{orderId}/payment`
Body (`RequestPayment`):
```jsonc
// PIX
{ "method": "Pix", "customerCpfCnpj": "12345678909" }

// Cartão de crédito
{
  "method": "CreditCard",
  "customerCpfCnpj": "12345678909",
  "creditCardToken": "<token do Asaas>",   // ver regra 3.5
  "installments": 3                          // 1..12
}
```

Campos obrigatórios e validações (espelham o back):
- `method`: aceitar **apenas `"Pix"` ou `"CreditCard"`** no seletor (outros valores → `409 METHOD_NOT_SUPPORTED`).
- `customerCpfCnpj`: **só dígitos**, 11 (CPF) ou 14 (CNPJ). Front deve remover máscara antes de enviar. Inválido → `400`.
- Cartão: `creditCardToken` obrigatório (`400` se vazio) e `installments` entre 1 e 12 (`400` fora da faixa).
- PIX ignora `creditCardToken`/`installments`.

Resposta **201** (`ResponsePayment`) — campos que o front consome:

| Campo | Uso no front |
|---|---|
| `status` | Estado do pagamento (string do enum — ver §5). **Não compare strings para decidir UX**; use os flags abaixo. |
| `isApproved` | `true` quando o cliente já pagou (Confirmed/Received). Use para a tela de sucesso. |
| `isFinal` | `true` em estado terminal (Failed/Refunded). Enquanto `false`, ainda há fluxo a acompanhar. |
| `orderStatus` | Status do pedido pós-cobrança (cartão já volta `"Confirmed"`; PIX volta `"Pending"`). |
| `method`, `amount`, `installments` | Resumo para a tela. |
| `pixCopyPaste` | **PIX**: string copia-e-cola. Botão "copiar". `null` no cartão. |
| `pixQrCodeBase64` | **PIX**: imagem do QR em base64 (`<img src="data:image/png;base64,{...}">`). `null` no cartão. |
| `invoiceUrl` | URL da fatura/comprovante quando houver (pode ser `null`). |
| `id`, `orderId`, `externalTransactionId`, `processedAt` | Referência/telemetria. |

Erros do checkout (corpo padrão `ResponseError` = `{ "errorMessages": ["..."] }`):
- **409** possíveis: pedido não está `Pending` (`ORDER_NOT_PAYABLE`), pedido já pago (`ORDER_ALREADY_PAID`),
  loja sem subconta apta (`STORE_ACCOUNT_NOT_APPROVED`), estoque insuficiente (`INSUFFICIENT_STOCK`),
  método não suportado (`METHOD_NOT_SUPPORTED`).
- **404**: pedido/cliente não encontrado.
- **400**: validação do body (CPF/CNPJ, token, parcelas).

### 3.4. Telas por método

**PIX** (após 201 com `status: "Created"`):
1. Renderizar QR (`pixQrCodeBase64`) + botão copiar (`pixCopyPaste`) + valor + instruções.
2. **Polling** do status do pedido (ver 3.6) até virar `Confirmed` → tela de sucesso.
   Mostrar um cronômetro/aviso de expiração e um botão "já paguei / atualizar".

**Cartão** (após 201 com `status: "Confirmed"`, `isApproved: true`):
1. Ir direto para a tela de sucesso (pedido já `Confirmed`). Sem polling.

### 3.5. ⚠️ Tokenização do cartão (regra crítica de segurança)
O back **nunca** recebe número de cartão. O front deve obter o `creditCardToken` via **tokenização
client-side do Asaas** (SDK/endpoint de tokenização do Asaas) e enviar **apenas o token**.
- Em **produção**: integrar a tokenização do Asaas (ambiente conforme `Asaas:Environment`).
- Em **desenvolvimento**: o back usa um gateway *fake* — **qualquer string não vazia** em `creditCardToken`
  é aceita. Isso permite testar o fluxo de cartão sem credenciais reais.

### 3.6. Acompanhar o status do pedido (polling do PIX)
**Não há GET de pagamento para o cliente.** O cliente acompanha pelo **pedido**:
`GET /stores/{slug}/orders` → `ResponseCustomerOrders` (`{ orders: ResponseOrder[] }`).
Localize o pedido pelo `id` e observe `status`:
- `Pending` → ainda não pago (continuar polling, ex.: a cada 3–5s, com timeout).
- `Confirmed` → pago/confirmado → parar polling e mostrar sucesso.
- `Cancelled` → falha/expiração → mostrar erro.

---

## 4. Fluxo do LOJISTA

### 4.1. Onboarding da subconta — `POST /store/payment-account` (Owner)
Body (`RequestCreateStorePaymentAccount`): `{ "mobilePhone": "11988887777" }` (override opcional; os demais
dados vêm da própria loja).
- **201** → `ResponseStorePaymentAccount`: `{ id, walletId, status, canReceivePayments, createdAt }`.
- **409** se já existir conta.

### 4.2. Status da subconta — `GET /store/payment-account` (StoreUser)
- **200** → `ResponseStorePaymentAccount`. Use `canReceivePayments` para **habilitar/bloquear o checkout**
  na loja e exibir um banner "complete seu cadastro de pagamentos" enquanto `status != "Approved"`.
- **404** se a loja ainda não criou a conta.

`status` possíveis: `Pending`, `Approved`, `Rejected` (exibir rótulo amigável). Segredos (apiKey/accountKey)
**não** são expostos — não tente lê-los.

### 4.3. Estorno — `POST /store/payments/{paymentId}/refund` (Manager)
- **200** → `ResponsePayment` (status `Refunded`).
- **409** se o pagamento não puder ser estornado; **404** se não encontrado; **502** em falha do provedor.
Exibir confirmação antes de chamar e tratar o `502` com mensagem de "tente novamente".

---

## 5. Enums (rotulagem no front)

Não hardcode regras de transição — onde existir endpoint de fluxo, consuma-o
(`GET /orders/status-flow` para pedidos). Para exibição:

- **PaymentMethod** (envio): `Pix`, `CreditCard`. (O enum do back tem mais valores, mas o checkout só aceita esses dois.)
- **PaymentStatus** (`ResponsePayment.status`): `Created`, `Confirmed`, `Received`, `Failed`, `Refunded`,
  `ChargebackRequested`, `ChargebackDispute`, `AwaitingChargebackReversal`.
  - Para UX do cliente, prefira os flags `isApproved`/`isFinal` em vez de comparar a string.
- **OrderStatus** (`ResponseOrder.status`): `Pending`, `Confirmed`, `Preparing`, `Ready`, `Shipped`, `Delivered`, `Cancelled`.
- **DeliveryType**: `Pickup`, `Delivery`.
- **StorePaymentAccountStatus**: `Pending`, `Approved`, `Rejected`.

---

## 6. Checklist de implementação (front)

**Cliente**
- [ ] Tela de checkout com seletor **PIX / Cartão** (somente esses dois).
- [ ] Campo **CPF/CNPJ do pagador** com máscara; enviar só dígitos (11 ou 14).
- [ ] Cartão: form com tokenização **client-side do Asaas** → enviar só `creditCardToken`; seletor de parcelas 1–12.
- [ ] PIX: exibir QR (`pixQrCodeBase64`) + copia-e-cola (`pixCopyPaste`) + valor; **polling** do status do pedido.
- [ ] Cartão: tela de sucesso imediata (sem polling).
- [ ] Header `Idempotency-Key` na criação do pedido.
- [ ] Tratamento de `409` (estoque/pagamento) e `400` (validação) com mensagens vindas de `errorMessages`.
- [ ] Bloquear "pagar" quando a loja não puder receber (sinalizado pelo `409 STORE_ACCOUNT_NOT_APPROVED`).

**Lojista**
- [ ] Onboarding da subconta (`POST /store/payment-account`) + tela de status (`GET`).
- [ ] Banner/gating do checkout enquanto `canReceivePayments === false`.
- [ ] Ação de estorno (`POST /store/payments/{paymentId}/refund`) com confirmação e tratamento de `502`.

**Tipos**
- [ ] Gerar os tipos TS a partir de [`docs/openapi.json`](./openapi.json) (ex.: `openapi-typescript`).
      Não digite os DTOs à mão — derive do spec.

---

## 7. Referências
- Contrato/schema completo: [`docs/openapi.json`](./openapi.json) (paths relevantes: `/stores/{slug}/orders`,
  `/stores/{slug}/orders/preview`, `/stores/{slug}/orders/{orderId}/payment`, `/store/payment-account`,
  `/store/payments/{paymentId}/refund`, `/orders/status-flow`).
- Regras de negócio do pagamento: `docs/asaas-payment-integration-plan.md`.
- Webhook (`/webhooks/asaas`) é **server-to-server** (Asaas → back). O front **não** chama esse endpoint.
