# 🔌 Ford VIN Share API — Contrato

> Backend: **Java (Spring Boot)**
> Base URL dev: `http://localhost:8080/api/v1`
> Swagger: `http://localhost:8080/api/docs`

---

## 🛡️ Convenções

- **Prefixo**: `/api/v1`
- **Auth**: `Authorization: Bearer <accessToken>` (JWT)
- **Papéis**: `CLIENT`, `ANALYST`, `ADMIN` (lidos do token)
- **Datas**: ISO 8601 com timezone (`2026-05-20T14:30:00-03:00`)
- **IDs**: UUID v4
- **Paginação**: `?page=0&size=20&sort=createdAt,desc`

### Envelope de listas paginadas

```json
{
  "content": [],
  "page": 0,
  "size": 20,
  "totalElements": 0,
  "totalPages": 0
}
```

### Erros (RFC 7807 — `application/problem+json`)

```json
{
  "type": "https://api.ford.fiap/errors/validation",
  "title": "Dados inválidos",
  "status": 400,
  "detail": "O campo email é obrigatório",
  "instance": "/api/v1/auth/login",
  "errors": [{ "field": "email", "message": "obrigatório" }]
}
```

**Códigos**: `400` validação · `401` token inválido · `403` sem permissão · `404` não encontrado · `409` conflito · `429` rate limit · `5xx` servidor

---

## 🔐 Autenticação

| Método | Path | Papel |
|---|---|---|
| POST | `/auth/login` | público |
| POST | `/auth/refresh` | público |
| POST | `/auth/logout` | autenticado |
| GET | `/me` | autenticado |

**`POST /auth/login`** → `{ email, password }`

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "role": "CLIENT",
  "userId": "uuid"
}
```

---

## 🚗 Cliente

### Veículos e garantia

| Método | Path | Tela |
|---|---|---|
| GET | `/me/vehicles` | Home |
| GET | `/vehicles/{vehicleId}` | Detalhe |
| GET | `/vehicles/{vehicleId}/warranty` | Card garantia |
| GET | `/vehicles/{vehicleId}/maintenance-alerts` | Alertas KM |
| PATCH | `/vehicles/{vehicleId}/odometer` | Atualiza KM |

**Warranty status**: `ACTIVE` · `EXPIRING_SOON` (≤60d) · `EXPIRED`

### Concessionárias

| Método | Path | Tela |
|---|---|---|
| GET | `/dealerships?lat=&lng=&radiusKm=&service=` | Localizador |
| GET | `/dealerships/{id}` | Detalhe |
| GET | `/dealerships/{id}/availability?serviceType=&date=` | Slots |

### Agendamento

| Método | Path | Tela |
|---|---|---|
| GET | `/service-types` | Step 1 |
| POST | `/appointments` | Confirmar |
| GET | `/me/appointments?status=` | Histórico |
| GET | `/appointments/{id}` | Detalhe |
| PATCH | `/appointments/{id}/cancel` | Cancelar |

**Service types**: `REVIEW` · `OIL_CHANGE` · `WARRANTY` · `REPAIR`
**Appointment status**: `SCHEDULED` · `CHECKED_IN` · `COMPLETED` · `CANCELED` · `NO_SHOW`

### Histórico

| Método | Path | Tela |
|---|---|---|
| GET | `/me/services?vehicleId=` | Home timeline |
| GET | `/services/{id}` | Detalhe |

### NPS pós-serviço

| Método | Path |
|---|---|
| GET | `/me/surveys/pending` |
| POST | `/services/{serviceId}/nps` |
| GET | `/services/{serviceId}/nps` |

**`POST /services/{id}/nps`**:
```json
{
  "score": 9,
  "comment": "...",
  "likedCategories": ["ATENDIMENTO", "TEMPO_DE_ESPERA"],
  "improvementCategories": ["PREÇO"]
}
```

**Categorias**: `ATENDIMENTO` · `TEMPO_DE_ESPERA` · `PREÇO` · `QUALIDADE_DO_SERVIÇO` · `COMUNICAÇÃO` · `INSTALAÇÕES`

### Programa de fidelidade

| Método | Path | Tela |
|---|---|---|
| GET | `/me/loyalty/balance` | Saldo |
| GET | `/me/loyalty/transactions` | Extrato |
| GET | `/loyalty/rewards` | Catálogo |
| POST | `/me/loyalty/redeem` | Resgate |

### Chatbot (Claude API roda no backend)

| Método | Path |
|---|---|
| POST | `/chat/sessions` |
| POST | `/chat/sessions/{sessionId}/messages` |
| GET | `/chat/sessions/{sessionId}/messages` |

**Response inclui `suggestedActions[]`** → renderizar como botões deep link:
```json
{ "type": "OPEN_SCHEDULING", "label": "Agendar revisão" }
```

⚠️ Rate limit: 20 msgs/min/usuário → `429`

### Notificações push

| Método | Path |
|---|---|
| POST | `/me/devices` |
| DELETE | `/me/devices/{token}` |

Payload de push traz `deepLink` (ex.: `fordapp://scheduling?vehicleId=...`)

**Cenários de push**:
1. Garantia ativa + revisão gratuita liberada (job diário)
2. 3 dias após `complete` pedindo NPS
3. KM próximo da revisão

---

## 📊 Analista

### Dashboard VIN Share

| Método | Path | Tela |
|---|---|---|
| GET | `/analytics/kpis?period=` | KPIs topo |
| GET | `/analytics/vin-share?dealershipId=&model=&period=` | Indicador |
| GET | `/analytics/vin-share/series?groupBy=month&from=&to=` | Gráfico linha |
| GET | `/analytics/vin-share/by-dealership?period=` | Gráfico barras |
| GET | `/analytics/nps?dealershipId=&from=&to=` | NPS agregado |

**KPIs response**:
```json
{
  "vehiclesUnderWarranty": 1280,
  "vinSharePercent": 62.4,
  "estimatedRevenue": 845200.00,
  "leadsAtRisk": 84
}
```

### Leads

| Método | Path | Tela |
|---|---|---|
| GET | `/leads?status=&segment=&dealershipId=` | Lista |
| GET | `/leads/{id}` | Detalhe |
| POST | `/leads/{id}/actions` | Acionar cliente |

**Status**: `NOVO` · `EM_RISCO` · `PERDIDO` · `RECUPERADO`

**`POST /leads/{id}/actions`**:
```json
{ "channel": "WHATSAPP", "templateId": "RETORNO_REVISAO_DESCONTO" }
```

### Segmentação

| Método | Path | Tela |
|---|---|---|
| GET | `/segments/distribution` | Pizza chart |
| GET | `/segments/{segment}/customers` | Lista |
| GET | `/customers/{id}/segment` | Segmento do cliente |

**Segmentos**: `FIEL` · `ECONOMICO` · `ESQUECIDO` · `ABANDONO`

### Visão 360

| Método | Path |
|---|---|
| GET | `/customers/{id}` |
| GET | `/customers/{id}/360` |
| GET | `/customers/{id}/timeline?from=&to=` |
| GET | `/vehicles/{vehicleId}/services` |

---

## 🗺️ Mapa Tela → Endpoints

### Cliente

| Tela | Endpoints |
|---|---|
| **Login** | `POST /auth/login` |
| **Home** | `GET /me` · `/me/vehicles` · `/vehicles/{id}/warranty` · `/vehicles/{id}/maintenance-alerts` · `/me/services` |
| **Agendamento** | `GET /service-types` · `/dealerships?...` · `/dealerships/{id}/availability` · `POST /appointments` |
| **Localizador** | `GET /dealerships?lat=&lng=&radiusKm=&service=` · `/dealerships/{id}` |
| **NPS** | `GET /me/surveys/pending` · `POST /services/{id}/nps` |
| **Pontos** | `GET /me/loyalty/balance` · `/me/loyalty/transactions` · `/loyalty/rewards` · `POST /me/loyalty/redeem` |
| **Chatbot** | `POST /chat/sessions` · `POST /chat/sessions/{id}/messages` · `GET /chat/sessions/{id}/messages` |
| **Notificações** | `POST /me/devices` no onboarding |

### Analista

| Tela | Endpoints |
|---|---|
| **Login** | `POST /auth/login` |
| **Dashboard** | `GET /analytics/kpis` · `/analytics/vin-share` · `/analytics/vin-share/series` · `/analytics/vin-share/by-dealership` |
| **Leads** | `GET /leads?status=&segment=` · `/leads/{id}` · `POST /leads/{id}/actions` |
| **Visão 360** | `GET /customers/{id}/360` · `/customers/{id}/timeline` · `/vehicles/{id}/services` |
| **Segmentação** | `GET /segments/distribution` · `/segments/{segment}/customers` · `/customers/{id}/segment` |

---

## ⚠️ Inconsistências do design atual com o contrato

Ajustar quando integrar:

| Tela | Hoje (mock) | API espera |
|---|---|---|
| LeadsScreen filtros | `Fiel` | `RECUPERADO` |
| SegmentationScreen segmentos | `Fiel / Novo / Em risco / Perdido` | `FIEL / ECONOMICO / ESQUECIDO / ABANDONO` |
| SchedulingScreen serviços | `Revisão / Óleo / Pneus / Diagnóstico` (4 custom) | `REVIEW / OIL_CHANGE / WARRANTY / REPAIR` |
| HomeScreen warranty | só "ativa" | `ACTIVE / EXPIRING_SOON / EXPIRED` |
| ChatScreen | mock local de respostas | `POST /chat/sessions/{id}/messages` + render `suggestedActions[]` |

---

## 📱 Práticas obrigatórias no app

- **Tokens**: usar **Expo SecureStore** (NUNCA AsyncStorage) para `accessToken` e `refreshToken`
- **Refresh automático**: interceptor HTTP que tenta `POST /auth/refresh` em `401` e refaz a request
- **Role-based routing**: ler `role` do token (ou `/me`) para escolher stack `(client)` vs `(analyst)`
- **Modo offline**: persistir respostas de `/me/vehicles`, `/vehicles/{id}/warranty` e `/me/services` em AsyncStorage
- **Deep links**: notificações trazem `deepLink` → mapear no Expo Router
- **LGPD**: CPF **sempre** mascarado pelo backend (`***.***.789-**`); confirmar consentimento antes de `POST /me/devices`

---

## 🔭 Próximos passos

1. OpenAPI (`openapi.yaml`) do backend → gerar cliente TypeScript com `openapi-typescript-codegen`
2. Ambiente de homologação com 500 clientes / 1.500 serviços / 30 concessionárias
3. Postman collection com login + refresh já configurados
