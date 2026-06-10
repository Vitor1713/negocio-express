# Credenciais do Lojista (teste)

Lojista (Owner) criado via `POST /auth/register` na API local (`http://localhost:5248`).

## Login do painel

- **E-mail:** `lojista.teste@negocioexpress.com`
- **Senha:** `Lojista@123`
- **Store slug:** `loja-teste-express`

> O login do painel (`POST /auth/login`) **exige o `storeSlug`** no corpo —
> sem ele a API responde `401 E-mail ou senha inválidos`.

## Loja vinculada

- **Nome:** Loja Teste Express
- **Slug:** `loja-teste-express` (vitrine: `/stores/loja-teste-express`)
- **CNPJ:** 88.337.532/0001-60
- **E-mail da loja:** contato@lojateste.com
- **Telefone:** (11) 99999-0000
- **Categoria:** `Restaurant`
- **Plano:** Gostosao (`019e7eea-7910-7891-a02a-e0d1c6d777a6`, trial 30 dias)

## Papel / token

- `store_role`: **Owner**
- `role`: `StoreUser`
- `store_id`: `019e8ab8-ae2c-7ad0-aa9d-d67d7d78c830`
- `user id`: `019e8ab8-ad50-71d8-8de0-2d72610adb9a`
