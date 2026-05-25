# Resposta do back às pendências do mobile

> Documento espelho enviado pelo time do backend em **2026-05-24**, em resposta
> a [`BACKEND_PENDING.md`](../BACKEND_PENDING.md). Preservado verbatim para
> referência durante o ciclo de adaptação e validação.

**Data:** 2026-05-24
**Referente a:** `docs/backlog/pendencias.md` (espelho de `BACKEND_PENDING.md`)

Levantamento feito, causas identificadas, plano de ajustes em execução do nosso lado. Abaixo, item por item, o que vai mudar no back, o que o app vai precisar adaptar, e o que já está correto e não muda.

---

## Bugs (500)

### `/me/services` e `/me/appointments`

**Causa:** as rotas existem, mas com o prefixo errado. Implementamos como `/services/me` e `/appointments/me`, enquanto o contrato em `docs/api-endpoints-mobile.md` define sob `/me/...`.

**Decisão:** **o back vai mover** as rotas para `/me/services` e `/me/appointments`, alinhando com o contrato original. Nenhuma mudança no app.

**Quando:** próximo deploy do back.

### `/analytics/vin-share/series`

**Causa:** bug real no service, cast frágil que estourava `ClassCastException` em runtime, capturado pelo handler genérico que devolve 500.

**Decisão:** corrigido. Replicamos o padrão de unwrap que já era usado no `/analytics/kpis`.

### `/analytics/nps`

**Causa:** endpoint nunca foi implementado.

**Decisão:** **vamos implementar.** Shape de retorno:

```json
{
  "totalResponses": 1240,
  "averageScore": 8.3,
  "npsScore": 58.7,
  "promoters": 870,
  "passives": 240,
  "detractors": 130,
  "computedAt": "2026-05-24T10:30:00-03:00"
}
```

Aceita querystring opcional `?monthsBack=N` (default 12).

### `/api/v1/v3/api-docs`

**Causa:** trocamos o caminho do springdoc para `/api-docs`. O default histórico é `/v3/api-docs`, que é o que o gerador de tipos do app espera.

**Decisão:** **vamos voltar para `/v3/api-docs`.** Depois disso, o `pnpm gen:api-types` (ou equivalente) deve rodar sem ajuste no app.

### `/api/v1/docs/swagger-initializer.js`

Cosmético, sem ação prevista. O Swagger UI continua acessível em `/api/v1/docs` via redirect.

### Extra: por que rotas inexistentes retornavam 500 ao invés de 404

Também vamos ligar a flag `spring.mvc.throw-exception-if-no-handler-found=true`, que faz o Spring lançar `NoHandlerFoundException` em vez de cair no handler genérico. A partir daí, rotas inválidas retornam `404 application/problem+json`. O app não precisa adaptar nada, é higiene.

---

## Shapes divergentes

### 1. Envelope universal `{success, data, message, timestamp}`

**Decisão:** **vamos documentar no `api-endpoints-mobile.md`.** Mantém como está, é o padrão de toda resposta 2xx. Os exemplos de payload no doc passam a indicar apenas o conteúdo de `data`.

### 2. `/me` com `fullName: null` para ADMIN/ANALYST

**Causa:** o `User` não tinha `fullName`; só o `Customer` (que ADMIN e ANALYST não possuem). Por isso o front recebia `null`.

**Decisão:** **vamos adicionar `display_name` na tabela `users`** (migration nova) e popular o `fullName` do `/me` a partir dela quando não houver `Customer`. ADMIN e ANALYST passam a receber nome corretamente.

### 3. Lead minimalista

**Decisão:** **vamos enriquecer o `LeadResponseDTO`** com:

- `cpfMasked`
- `vehiclePlate`
- `daysSinceLastVisit`
- `status` (`NOVO | EM_RISCO | PERDIDO | RECUPERADO`), **derivado no back** pela mesma heurística que vocês usam hoje no app (`>=80 PERDIDO`, `>=60 EM_RISCO`, `<20 RECUPERADO`, resto `NOVO`). Daí em diante, a regra fica num único lugar.
- `warrantyStatus`
- `lastNpsScore`
- `updatedAt`
- `customerId` (campo novo, distinto de `id`)

**Importante sobre `customerId`:** o campo `id` que o back **já** devolve hoje **é exatamente** o `customer.getId()`. Vocês podem abrir a Visão 360 com `lead.id` agora mesmo, sem esperar a release. Adicionaremos o `customerId` separado para deixar o contrato explícito, mas não é bloqueio.

### 4. Filtro `?status=` em `/leads`

**Decisão:** **`/leads` passa a aceitar `?status=NOVO|EM_RISCO|PERDIDO|RECUPERADO`** além do `?segment=`. Filtro feito no back. O fallback client-side de vocês pode ser removido depois do deploy.

### 5. `/segments/distribution`

**Decisão:** **shape muda para o envelope esperado:**

```json
{
  "totalCustomers": 500,
  "buckets": [
    {
      "segment": "FIEL",
      "count": 150,
      "percent": 30.0,
      "avgTicket": 450.80,
      "avgNps": 8.4
    }
  ],
  "computedAt": "2026-05-24T10:30:00-03:00"
}
```

`avgTicket` e `avgNps` vêm computados no back.

**Atenção:** este é o único endpoint cujo shape muda. Vocês precisam atualizar o desempacote no app (o que hoje é um array vai virar `{ totalCustomers, buckets, computedAt }`).

### 6. `/segments/{segment}/customers`

**Decisão:** **shape muda.** Passa a retornar uma página de cliente real:

```json
{
  "customerId": "uuid",
  "name": "Fulano",
  "cpfMasked": "***.***.789-**",
  "segment": "ABANDONO",
  "riskScore": 78.4,
  "lastVisitAt": "2025-08-12",
  "estimatedLtv": 12450.00
}
```

O DTO antigo (com `topFeatures`, `modelVersion`, `predictedAt`) continuará disponível em **`GET /customers/{id}/segment`**, que é onde a predição ML faz sentido. Esse endpoint não muda.

### 7. `/analytics/vin-share/by-dealership`

**Decisão:** **vamos adicionar:**

- `estimatedRevenue` (soma de `total_amount` no período)
- `trend` (`UP | DOWN | FLAT`), comparando o período atual com o anterior de mesmo tamanho

Os campos existentes (`dealershipId`, `name`, `vehiclesServed`, `vehiclesTotal`, `sharePercent`) **continuam iguais**.

### 8. `expiresIn: 300`

**Decisão:** **vamos subir para 900** (15 minutos) no Azure. É só mexer em variável de ambiente, sem deploy. O refresh automático de vocês passa a rodar menos.

### 9. `AvailabilitySlot.time` com `:00:00` no final

**Decisão:** **vamos anotar o campo** com `@JsonFormat(pattern = "HH:mm")`. Passa a vir como `"08:00"`.

---

## Convenções confirmadas (sem mudança)

Tudo que vocês listaram em "Convenções confirmadas" e "Mantenha como está" continua exatamente como descrito. Não muda nada nesses endpoints e contratos.

---

## O que vocês precisam adaptar no app

Em ordem de impacto:

1. **`/segments/distribution`:** trocar o desempacote de `data` de array para `data.buckets` (item 5 acima). Esse é o **único shape mudando** que pode quebrar telas.
2. **Filtros de lead:** quando subir, vocês podem confiar no `?status=` do servidor e remover o fallback client-side (item 4).
3. **`AvailabilitySlot.time`:** se vocês têm parser que assume `HH:mm:ss`, ajustar. O novo formato é `HH:mm`. Em geral, parsers de hora aceitam os dois.
4. **`lead.id` já é o customerId:** podem abrir Visão 360 a partir do card de lead agora, sem esperar a release (item 3).
5. **Gerar types OpenAPI:** depois que `/v3/api-docs` voltar (provavelmente no próximo deploy), rodar a geração de tipos para pegar todos os novos campos de lead, segment, analytics.

---

## Plano de release

Faremos **em um único deploy** todas as alterações de código.

A mudança da env `JWT_ACCESS_MIN=15` no Azure já pode ser feita imediatamente, sem esperar deploy. Aviso assim que aplicar.

A previsão é deploy entre **2026-05-26 e 2026-05-28**, com tempo de validação em homologação no meio. Vou avisar antes de subir.

---

## Quando avisarmos que está em produção

Vocês podem rodar a checklist abaixo para validar tudo de uma vez:

```bash
# 1. expiresIn deve ser 900
curl -sS -X POST https://vinshare-api.azurewebsites.net/api/v1/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"claude-test@vinshare.dev","password":"<senha>"}' | jq '.data.expiresIn'

# 2. token para os próximos testes
TOKEN=$(curl -sS -X POST https://vinshare-api.azurewebsites.net/api/v1/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"claude-test@vinshare.dev","password":"<senha>"}' | jq -r '.data.accessToken')

# 3. cinco rotas que estavam em 500
for path in \
  "/me/services" \
  "/me/appointments" \
  "/analytics/vin-share/series" \
  "/analytics/nps" \
  "/v3/api-docs"; do
  echo "=== $path ==="
  curl -sS -o /dev/null -w "%{http_code}\n" \
    "https://vinshare-api.azurewebsites.net/api/v1$path" \
    -H "authorization: Bearer $TOKEN"
done

# 4. lead com novos campos
curl -sS "https://vinshare-api.azurewebsites.net/api/v1/leads?status=EM_RISCO&size=1" \
  -H "authorization: Bearer $TOKEN" | jq '.data.content[0]'

# 5. segments/distribution no novo envelope
curl -sS "https://vinshare-api.azurewebsites.net/api/v1/segments/distribution" \
  -H "authorization: Bearer $TOKEN" | jq '.data | keys'

# 6. slot de horário sem segundos
curl -sS "https://vinshare-api.azurewebsites.net/api/v1/dealerships/<id>/availability?date=2026-06-01" \
  -H "authorization: Bearer $TOKEN" | jq '.data.slots[0].time'
```

Os passos 3 a 6 devem retornar 200 e os payloads no formato descrito acima.

---

## Resumo executivo

| Pendência | Quem corrige | Quebra contrato? |
|---|---|---|
| `/me/services` 500 | Back | Não, alinha com contrato |
| `/me/appointments` 500 | Back | Não, alinha com contrato |
| `/analytics/vin-share/series` 500 | Back | Não |
| `/analytics/nps` 500 | Back (vai implementar) | Não |
| `/v3/api-docs` 500 | Back | Não |
| Envelope universal | Back (vai documentar) | Não |
| `/me` fullName null | Back | Não |
| Lead minimalista | Back (vai enriquecer) | Adições only |
| Filtro `?status=` | Back | Adições only |
| `/segments/distribution` shape | Back | **Sim, mobile adapta** |
| `/segments/{segment}/customers` shape | Back | Sim, mas tela ainda não existe |
| `vin-share/by-dealership` campos | Back | Adições only |
| `expiresIn: 300` | Back (env Azure) | Não |
| `AvailabilitySlot.time` | Back | Mudança cosmética |

**Praticamente tudo corrigimos do nosso lado, sem demandar mudança grande no app.** A única adaptação obrigatória é o desempacote do `/segments/distribution` (item 5).

Qualquer coisa, me chama no Slack.
