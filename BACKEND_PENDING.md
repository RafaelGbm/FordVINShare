# 📋 Backend — Pendências do app mobile

Snapshot levantado em **2026-05-23** após bater em todos os endpoints com as contas de teste:
- `claude-test@vinshare.dev` (CLIENT)
- `owner@ford.com` (ADMIN)

O app já está adaptado pra rodar com o que o back devolve hoje (UI cai pra fallbacks quando campos estão ausentes), mas as pendências abaixo são o que falta pro produto ficar completo.

---

## ✅ Status: 11/14 deployado pelo back em 2026-05-24 (deploy antecipado!)

Time do back acusou recebimento, e o deploy aconteceu antes do previsto.
Documento espelho da resposta deles em
[`docs/BACKEND_RESPONSE_2026-05-24.md`](docs/BACKEND_RESPONSE_2026-05-24.md).

**Validado em 2026-05-24** (rodar `scripts/verify-backend.sh` quando os
itens 🔴 abaixo caírem).

| Item desta lista | Status |
|---|---|
| `/me/services` 500 | ✅ **200** (mudou de `/services/me` → `/me/services`) |
| `/me/appointments` 500 | ✅ **200** (mudou de `/appointments/me` → `/me/appointments`) |
| `/analytics/vin-share/series` 500 | 🔴 **ainda 500** — ClassCastException não entrou no deploy |
| `/analytics/nps` 500 | ✅ **200** com shape exato do contrato |
| `/api/v1/v3/api-docs` 500 | ✅ **200** (OpenAPI pronto pra `openapi-typescript`) |
| Envelope `{success, data, ...}` | ✅ Documentado no contrato |
| `/me` fullName null | 🟡 OK pra CLIENT; **ADMIN ainda `null`** (migration `display_name` em `users` não aplicada) |
| Lead minimalista | ✅ Todos os 8 campos novos shipados (`cpfMasked`, `vehiclePlate`, `status`, `warrantyStatus`, `daysSinceLastVisit`, `customerId`, `updatedAt`, `lastNpsScore`) |
| Filtro `?status=` em `/leads` | ✅ Funcionando server-side |
| `/segments/distribution` shape | ✅ Envelope com `avgTicket`/`avgNps` por bucket |
| `/segments/{segment}/customers` shape | ✅ Perfil real `{name, cpfMasked, lastVisitAt, estimatedLtv, ...}` |
| `/analytics/vin-share/by-dealership` campos | ✅ `estimatedRevenue` + `trend` presentes |
| `expiresIn: 300` | 🔴 **ainda 300** — env var `JWT_ACCESS_MIN=15` no Azure não foi flipped |
| `AvailabilitySlot.time` | ✅ `"08:00"` (sem segundos) |

Legenda: ✅ deployado e funcionando · 🟡 deployado parcialmente · 🔴 falta.

### 🔴 Itens remanescentes (3) — pingar o back

1. **`JWT_ACCESS_MIN=15` no Azure** — env var, não-deploy. Suposto ser imediato.
2. **`/analytics/vin-share/series` ainda 500** — ClassCastException foi corrigido no code mas pode não ter entrado nesse deploy.
3. **Migration `display_name` em `users`** — sem isso, ADMIN/ANALYST recebem `fullName: null` em `/me`.

Quando os 3 caírem: rodar `scripts/verify-backend.sh` pra validação completa, e fazer o cleanup unificado no app (remover `deriveLeadStatus`/`daysSinceLastVisit` client-side, simplificar `segmentsService.getDistribution`, gerar types via OpenAPI).

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
