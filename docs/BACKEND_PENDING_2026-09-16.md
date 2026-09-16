# Pendências do mobile para o back — 2026-09-16

> Resumo enxuto, só com o que é responsabilidade do back. Detalhes completos,
> reprodução passo a passo e o histórico de cada item estão em
> [`BACKEND_PENDING_2026-09-12.md`](./BACKEND_PENDING_2026-09-12.md).
> Este documento existe porque o item 1 foi reproduzido de novo hoje, agora
> no APK final instalado num aparelho físico — não é mais só um achado de
> teste, é o que o usuário final vê.

---

## 1. 🔴 `POST /appointments` retorna 500 para clientes novos — CRÍTICO

**Reproduzido de novo hoje**, no APK final, com uma conta de cliente real
tentando marcar o primeiro serviço pelo fluxo normal do app (Agendar →
Serviço → Concessionária → Data/Hora → Confirmar). Requisição:

```
POST /appointments
{"vehicleId": "...", "dealershipId": "...", "serviceTypeId": "REVIEW", "scheduledAt": "..."}

→ 500 { "title": "Erro interno", "detail": "Ocorreu um erro ao processar a requisição..." }
```

Já isolamos (ver item 5 do doc de 12/09 para a tabela completa de testes):
não é o `dealershipId`, não é o `serviceTypeId`, não é o formato de
`scheduledAt`, não é `loyalty_accounts` nem `customer_segments` faltando.
O `vehicleId` é válido (`GET /me/vehicles` funciona normalmente). O erro
parece depender do estado do `customer` — nossa suspeita é lógica que
assume histórico prévio (algum serviço/agendamento anterior) e quebra
quando o cliente é novo, sem tratar o caso vazio.

**Impacto:** qualquer cliente Ford que acabou de se cadastrar não consegue
marcar seu primeiro serviço. É o fluxo mais importante do app.

**O que precisamos:** stack trace (logs do Azure) ou uma reprodução local
com um cliente sem histórico. Podemos passar os IDs exatos usados no teste
se ajudar.

---

## 2. `JWT_ACCESS_MIN` ainda em 300, combinado subir pra 900 em maio

```bash
curl -sS -X POST https://vinshare-api.azurewebsites.net/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"<conta>","password":"<senha>"}' | jq '.data.expiresIn'
# → 300 (esperado: 900)
```

Só variável de ambiente no Azure, sem deploy — foi o que ficou combinado em
[`BACKEND_RESPONSE_2026-05-24.md`](./BACKEND_RESPONSE_2026-05-24.md#8-expiresin-300).
Não bloqueia nada (o app renova sozinho no 401), mas segue pendente.

---

## 3. `GET /customers/{id}` não existe (404 de rota, não de recurso)

Não aparece em `/v3/api-docs`. Precisamos só de uma confirmação: é
intencional? Se sim, ok, já removemos o uso no app. Se não, está faltando
tanto na implementação quanto na spec.

---

## 4. Inconsistência `Page` vs array nos endpoints de listagem

`/me/appointments`, `/me/services`, `/me/loyalty/transactions`, `/leads` e
`/segments/{segment}/customers` devolvem `Page` do Spring; `/me/vehicles`,
`/me/surveys/pending`, `/service-types`, `/dealerships`, `/loyalty/rewards`
e `/analytics/vin-share/by-dealership` devolvem array puro. O app já aceita
os dois formatos, então isso não trava nada — só pedimos para decidirem um
padrão e documentarem na spec, porque hoje depende de qual dev implementou
cada rota.

---

## 5. `GET /dealerships` devolve 500 (não 400) quando falta `lat`/`lng`

```
GET /dealerships                     → 500
GET /dealerships?lat=..&lng=..       → 200
```

Sem impacto no app (sempre mandamos `lat`/`lng`), mas um parâmetro
obrigatório faltando deveria ser `400` com `errors: [{field, message}]`,
igual já acontece no `/auth/login` — hoje é indistinguível de uma queda real
do servidor.

---

## 6. Sugestão (sem prioridade nossa): falta endpoint de agendamentos por cliente

Não existe `GET /customers/{id}/appointments` na spec. Isso impede a tela
de Visão 360 (analista) de mostrar os agendamentos ativos de um cliente
específico — tivemos que remover essa seção da tela porque não tinha como
alimentá-la. Registrado aqui só para o roadmap, não é bug.

---

## Resumo

| # | Item | Responsável | Bloqueia usuário final? |
|---|---|---|---|
| 1 | `POST /appointments` 500 p/ cliente novo | **Back — investigar (crítico)** | **Sim, todo cliente novo** |
| 2 | `JWT_ACCESS_MIN` ainda 300 | Back — env Azure | Não |
| 3 | `GET /customers/{id}` 404 | Back — confirmar intenção | Não |
| 4 | `Page` vs array sem padrão | Back — documentar | Não, app já adapta |
| 5 | `/dealerships` 500 sem lat/lng | Back — trocar por 400 | Não, app sempre envia |
| 6 | Sem endpoint de agendamentos por cliente | Back — feature futura | Não |

O item 1 é o único que realmente importa agora: é reprodutível para
qualquer cliente novo e afeta o fluxo principal do app em produção.
