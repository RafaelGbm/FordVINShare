# 📋 Backend — Pendências do app mobile

Snapshot levantado em **2026-05-23** após bater em todos os endpoints com as contas de teste:
- `claude-test@vinshare.dev` (CLIENT)
- `owner@ford.com` (ADMIN)

O app já está adaptado pra rodar com o que o back devolve hoje (UI cai pra fallbacks quando campos estão ausentes), mas as pendências abaixo são o que falta pro produto ficar completo.

---

## 🔴 Bugs (endpoints retornando 500)

| Endpoint | Status | O que quebra no app |
|---|---|---|
| `GET /me/services` | **500** | Timeline da Home + contagem de serviços no Profile mostram erro |
| `GET /me/appointments` | **500** | AppointmentsScreen inteira inacessível |
| `GET /analytics/vin-share/series` | **500** | Gráfico VIN Share semanal do Dashboard analista fica vazio |
| `GET /analytics/nps` | **500** | NPS agregado do Dashboard (hook existe, sem consumo crítico) |
| `GET /api/v1/v3/api-docs` | **500** mesmo autenticado | Bloqueia geração de types via OpenAPI / leitura do contrato cru |
| `GET /api/v1/docs/swagger-initializer.js` | **500** | Cosmético — Swagger UI carrega via redirect alternativo |

> Reproduzir: logar (`POST /auth/login`) e chamar qualquer um dos endpoints acima com o `accessToken`. Resposta vem com `problem+json` de status 500.

---

## 🟡 Shapes divergentes (back ≠ contrato em `API.md`)

### 1. Envelope universal nas respostas 2xx (não documentado)

Toda resposta vem wrappada:

```json
{ "success": true, "data": <PAYLOAD>, "message": "...", "timestamp": "ISO" }
```

O app desempacota no interceptor do axios — funcional, mas vale documentar no `API.md` pra próximos consumidores.

### 2. `/me` pode devolver `fullName: null` e `phone: null`

Acontece com `owner@ford.com`. Sugestão: ou popular `fullName` no registro (já feito pro CLIENT) ou documentar que ADMIN pode vir sem nome.

### 3. `Lead` (em `/leads`) está com shape minimalista

**Hoje:**
```json
{ "id", "customerName", "vehicleModel", "lastVisitAt", "segment",
  "riskScore", "reason", "suggestedAction" }
```

**Faltam pro app exibir tudo que tem na UI:**
- `customerId` — **CRÍTICO**: sem isso o card não consegue abrir a Visão 360
- `cpfMasked` — mostrado no card do lead
- `vehiclePlate` — mostrado no card
- `status` (`NOVO | EM_RISCO | PERDIDO | RECUPERADO`) — hoje o app **deriva client-side** do `riskScore` (`>=80 PERDIDO`, `>=60 EM_RISCO`, `<20 RECUPERADO`, resto `NOVO`). Filtros funcionam por essa heurística.
- `daysSinceLastVisit` — derivado de `lastVisitAt`
- `warrantyStatus`
- `lastNpsScore`
- `updatedAt`

### 4. Filtro `?status=` em `/leads` é ignorado

Ao chamar `/leads?status=NOVO&size=5` o backend devolveu leads de `ESQUECIDO` e `ABANDONO`. Hoje o app ignora o filtro do server e filtra client-side. Implementar no back é desejável.

### 5. `GET /segments/distribution` retorna array direto

**Hoje:**
```json
[{ "segment": "FIEL", "count": 150, "percent": 30.0 }, ...]
```

**Esperado em `API.md`:**
```json
{ "totalCustomers": ..., "buckets": [{...}], "computedAt": "ISO" }
```

Também falta nos buckets: `avgTicket` e `avgNps` (são usados no card "Lista" da SegmentationScreen — hoje aparecem só com `count`).

### 6. `GET /segments/{segment}/customers` retorna predições ML, não perfis de cliente

**Hoje:**
```json
{ "customerId", "segment", "riskScore", "topFeatures", "modelVersion", "predictedAt" }
```

**Falta pro app conseguir mostrar uma lista navegável de clientes do segmento:**
- `name`
- `cpfMasked`
- `lastVisitAt`
- `estimatedLtv`

(Hook existe mas tela de drill-down ainda não foi feita — pode ser implementada quando o back tiver os campos.)

### 7. `GET /analytics/vin-share/by-dealership` campos diferentes

**Hoje:**
```json
{ "dealershipId", "name", "vehiclesServed", "vehiclesTotal", "sharePercent" }
```

**Faltam pra UI:**
- `trend` (`UP | DOWN | FLAT`) — seta de tendência no card da concessionária
- `estimatedRevenue` — receita estimada por concessionária

O app hoje mostra `vehiclesServed/vehiclesTotal` no lugar da receita quando ela está ausente.

### 8. Token de acesso curto: `expiresIn: 300` (5 min)

Sugestão: subir pra 900–1800. 5 minutos é muito agressivo — o refresh automático no app funciona, mas adiciona round-trips constantes.

### 9. `AvailabilitySlot.time` vem com segundos

Exemplo: `"08:00:00"`. O app renderiza cru — fica feio. Sugestão: enviar `"HH:MM"`.

---

## 🟢 Mantenha como está

Estes endpoints estão alinhados (apenas envelope a documentar):

- `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`, `POST /auth/logout`, `GET /me`
- `GET /me/vehicles`, `PATCH /vehicles/{id}/odometer`
- `GET /service-types`, `POST /appointments`, `PATCH /appointments/{id}/cancel|check-in|complete`
- `GET /dealerships`, `GET /dealerships/{id}`, `GET /dealerships/{id}/availability`
- `GET /me/loyalty/balance`, `GET /me/loyalty/transactions` (Spring `Page<T>`)
- `GET /loyalty/rewards`, `POST /me/loyalty/redeem`
- `POST /chat/sessions`, `POST /chat/sessions/{id}/messages`, `GET /chat/sessions/{id}/messages`
- `GET /me/surveys/pending`, `POST /services/{id}/nps`, `GET /services/{id}/nps`
- `POST /me/devices`, `DELETE /me/devices/{token}`
- `GET /analytics/kpis`
- `GET /leads` (paginação Spring), `GET /leads/{id}`, `POST /leads/{id}/actions`
- `GET /customers/{id}`, `GET /customers/{id}/360`, `GET /customers/{id}/timeline`

---

## 📐 Convenções confirmadas

- **Base URL**: `https://vinshare-api.azurewebsites.net/api/v1`
- **Erros**: `application/problem+json` RFC 7807 ✅
- **Paginação**: Spring `Page<T>` (com `pageable`, `last`, `first`, `empty`, `numberOfElements`)
- **Datas**: ISO 8601 com timezone para `*At`; `lastVisitAt` é date-only (`YYYY-MM-DD`)
- **Money**: número decimal, 2 casas
- **CPF**: já mascarado pelo back quando enviado (`***.***.789-**`)

---

## 🔮 Próximos passos do app (depois que o back resolver o acima)

1. Trocar o filtro de leads client-side por server-side (`?status=`)
2. Mostrar `cpfMasked`, `vehiclePlate`, `warrantyStatus`, `NPS` no card do lead
3. Habilitar navegação para Customer 360 a partir do card do lead (via `customerId`)
4. Mostrar `avgTicket`/`avgNps`/`estimatedRevenue`/`trend` quando voltarem
5. Reabilitar timeline da Home (depende de `/me/services` 200)
6. Reabilitar `AppointmentsScreen` (depende de `/me/appointments` 200)
7. Gerar types via `openapi-typescript-codegen` quando `/v3/api-docs` voltar
