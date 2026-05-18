# 🔌 Ford VIN Share — Guia de Integração Backend

> Tudo que o app mobile precisa do backend **Java / Spring Boot**.
> Complemento operacional do contrato em [API.md](API.md).
> Snapshot: **2026-05-18**

---

## 🚀 Setup local

### Variável de ambiente

Arquivo `.env` na raiz (cópia de [.env.example](.env.example)):

```env
EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1
```

> Lido em [src/config/env.ts](src/config/env.ts). Se não estiver setada, o app falha no boot com mensagem explícita.

### Backend rodando

- **Base URL**: `http://localhost:8080/api/v1`
- **Swagger**: `http://localhost:8080/api/docs`
- **CORS**: liberar origens `http://localhost:8081` (Expo Metro) e `http://localhost:19006` (Expo Web)

### Para dispositivo físico (Expo Go)

Trocar `localhost` pelo IP da máquina na mesma rede Wi-Fi:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.10:8080/api/v1
```

---

## 🔐 Autenticação

### Fluxo

1. App chama `POST /auth/login` com `{ email, password }`
2. Backend devolve `accessToken` + `refreshToken` (JWT) + `role`
3. Tokens persistidos em **Expo SecureStore** ([src/services/secureStorage.ts](src/services/secureStorage.ts)) — nunca AsyncStorage
4. Interceptor request anexa `Authorization: Bearer <accessToken>` em toda chamada ([src/services/api.ts:61](src/services/api.ts#L61))
5. Em `401`, interceptor tenta `POST /auth/refresh` **uma vez** (deduplicado via `refreshPromise` compartilhado) e refaz a request original ([src/services/api.ts:74](src/services/api.ts#L74))
6. Se o refresh falhar, limpa SecureStore e dispara `onUnauthenticated` → redireciona para `/` (login)

### Requisitos do backend

- **Access token**: expira em `expiresIn` segundos (sugestão 900 = 15min); claim `role` = `CLIENT` | `ANALYST` | `ADMIN`
- **Refresh token**: rotacionar a cada `/auth/refresh` (devolver novo par)
- **Logout**: `POST /auth/logout` deve invalidar o refresh token server-side

### Endpoints auth

| Método | Path | Service | Hook |
|---|---|---|---|
| POST | `/auth/login` | [auth.service.ts:36](src/services/auth.service.ts#L36) | — |
| POST | `/auth/refresh` | [auth.service.ts:42](src/services/auth.service.ts#L42) | — |
| POST | `/auth/logout` | [auth.service.ts:53](src/services/auth.service.ts#L53) | — |
| GET | `/me` | [auth.service.ts:62](src/services/auth.service.ts#L62) | [`useMe`](src/hooks/useAuth.ts) |

---

## 📦 Convenções de payload

### Erros — RFC 7807 (`application/problem+json`)

Todo `4xx`/`5xx` deve seguir:

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

> O app já normaliza tudo em [`ApiError`](src/services/api.ts#L32) — basta o backend respeitar o envelope.

### Paginação

```json
{
  "content": [],
  "page": 0,
  "size": 20,
  "totalElements": 0,
  "totalPages": 0
}
```

Query params: `?page=0&size=20&sort=createdAt,desc`.
Tipo TypeScript: [`PaginatedResponse<T>`](src/services/services.service.ts#L15).

### Tipos

- **IDs**: UUID v4
- **Datas**: ISO 8601 com timezone (`2026-05-20T14:30:00-03:00`)
- **Dinheiro**: número decimal (não centavos), 2 casas
- **Percentuais**: 0–100 (não 0–1)

---

## ✅ Endpoints integrados no app

Tabela viva — cada linha: endpoint backend → service → hook → tela. Atualizar sempre que plugar um endpoint novo.

### Auth / Cliente

| Endpoint | Service | Hook | Tela |
|---|---|---|---|
| `POST /auth/login` | [auth.service.ts](src/services/auth.service.ts) | — | [LoginScreen](src/screens/LoginScreen.tsx) |
| `POST /auth/refresh` | auth | — | (automático via interceptor) |
| `POST /auth/logout` | auth | — | [ProfileScreen](src/screens/client/ProfileScreen.tsx) |
| `GET /me` | auth | [`useMe`](src/hooks/useAuth.ts) | [ProfileScreen](src/screens/client/ProfileScreen.tsx) |
| `GET /me/vehicles` | [vehicles.service.ts](src/services/vehicles.service.ts) | `useMyVehicles` | Home, Scheduling, Profile |
| `GET /vehicles/{id}/warranty` | vehicles | `useVehicleWarranty` | Home |
| `GET /vehicles/{id}/maintenance-alerts` | vehicles | `useMaintenanceAlerts` | Home |
| `PATCH /vehicles/{id}/odometer` | vehicles | — | (service pronto, não consumido) |
| `GET /me/services` | [services.service.ts](src/services/services.service.ts) | `useMyServices` | Home timeline |
| `GET /service-types` | [appointments.service.ts](src/services/appointments.service.ts) | `useServiceTypes` | Scheduling step 1 |
| `POST /appointments` | appointments | `useCreateAppointment` | Scheduling confirm |
| `GET /me/appointments` | appointments | `useMyAppointments` | (hook pronto, sem tela) |
| `PATCH /appointments/{id}/cancel` | appointments | `useCancelAppointment` | (hook pronto, sem tela) |
| `GET /dealerships` | [dealerships.service.ts](src/services/dealerships.service.ts) | `useDealerships` | Locator, Scheduling |
| `GET /dealerships/{id}/availability` | dealerships | `useDealershipAvailability` | Scheduling step 3 |
| `GET /me/loyalty/balance` | [loyalty.service.ts](src/services/loyalty.service.ts) | `useLoyaltyBalance` | Points |
| `GET /me/loyalty/transactions` | loyalty | `useLoyaltyTransactions` | Points extrato |
| `GET /loyalty/rewards` | loyalty | `useLoyaltyRewards` | Points carousel |
| `POST /me/loyalty/redeem` | loyalty | `useRedeemReward` | Points resgate |
| `POST /chat/sessions` | [chat.service.ts](src/services/chat.service.ts) | `useCreateChatSession` | Chat |
| `POST /chat/sessions/{id}/messages` | chat | `useSendChatMessage` | Chat |
| `GET /chat/sessions/{id}/messages` | chat | `useChatHistory` | Chat |

### Analista

| Endpoint | Service | Hook | Tela |
|---|---|---|---|
| `GET /analytics/kpis?period=` | [analytics.service.ts](src/services/analytics.service.ts) | `useKpis` | Dashboard |
| `GET /analytics/vin-share/series` | analytics | `useVinShareSeries` | Dashboard linha |
| `GET /analytics/vin-share/by-dealership` | analytics | `useVinShareByDealership` | Dashboard barras |
| `GET /analytics/nps` | analytics | — | (service pronto, não consumido) |
| `GET /leads` | [leads.service.ts](src/services/leads.service.ts) | [`useLeads`](src/hooks/useLeads.ts) | [LeadsScreen](src/screens/analyst/LeadsScreen.tsx) |
| `GET /leads/{id}` | leads | [`useLead`](src/hooks/useLeads.ts) | (hook pronto, sem tela de detalhe) |
| `POST /leads/{id}/actions` | leads | [`useCreateLeadAction`](src/hooks/useLeads.ts) | LeadsScreen (botões Ligar/WhatsApp) |
| `GET /segments/distribution` | [segments.service.ts](src/services/segments.service.ts) | [`useSegmentDistribution`](src/hooks/useSegments.ts) | [SegmentationScreen](src/screens/analyst/SegmentationScreen.tsx) |
| `GET /segments/{segment}/customers` | segments | [`useSegmentCustomers`](src/hooks/useSegments.ts) | (hook pronto, sem tela de drill-down) |
| `GET /customers/{id}/segment` | segments | [`useCustomerSegment`](src/hooks/useSegments.ts) | (hook pronto, sem tela) |
| `GET /customers/{id}` | [customers.service.ts](src/services/customers.service.ts) | [`useCustomer`](src/hooks/useCustomers.ts) | (hook pronto, sem tela) |
| `GET /customers/{id}/360` | customers | [`useCustomer360`](src/hooks/useCustomers.ts) | (hook pronto, sem tela de Visão 360) |
| `GET /customers/{id}/timeline` | customers | [`useCustomerTimeline`](src/hooks/useCustomers.ts) | (hook pronto, sem tela) |

### Cross-cutting (sem tela ainda, prontos para integrar)

| Endpoint | Service | Hook |
|---|---|---|
| `GET /me/surveys/pending` | [nps.service.ts](src/services/nps.service.ts) | [`usePendingSurveys`](src/hooks/useNps.ts) |
| `GET /services/{id}/nps` | nps | [`useNps`](src/hooks/useNps.ts) |
| `POST /services/{id}/nps` | nps | [`useSubmitNps`](src/hooks/useNps.ts) |
| `POST /me/devices` | [devices.service.ts](src/services/devices.service.ts) | [`useRegisterDevice`](src/hooks/useDevices.ts) |
| `DELETE /me/devices/{token}` | devices | [`useUnregisterDevice`](src/hooks/useDevices.ts) |

---

## 📐 Tipos DTO de referência

Todos os tipos abaixo já existem no app — copiar como contrato espelho no Java.

### Leads → [src/services/leads.service.ts](src/services/leads.service.ts)

```ts
type LeadStatus = 'NOVO' | 'EM_RISCO' | 'PERDIDO' | 'RECUPERADO';
type LeadSegment = 'FIEL' | 'ECONOMICO' | 'ESQUECIDO' | 'ABANDONO';
type LeadActionChannel = 'WHATSAPP' | 'EMAIL' | 'SMS' | 'CALL';

interface Lead {
  id: string;
  customerId: string;
  customerName: string;
  cpfMasked: string;           // "***.***.789-**"
  vehicleModel: string;
  vehiclePlate: string;
  status: LeadStatus;
  segment: LeadSegment;
  riskScore: number;           // 0–100
  daysSinceLastVisit: number;
  warrantyStatus: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
  lastNpsScore: number | null;
  recommendedAction: string;   // "Ligar oferecendo revisão gratuita"
  updatedAt: string;           // ISO
}

// POST /leads/{id}/actions
interface LeadActionInput {
  channel: LeadActionChannel;
  templateId: string;          // "RETORNO_REVISAO_DESCONTO" | "LIGACAO_RETENCAO" | ...
  notes?: string;
}
interface LeadActionResult {
  actionId: string;
  sentAt: string;
  channel: LeadActionChannel;
}
```

**Templates esperados pelo backend** (já dispatchados pelo app):
- `RETORNO_REVISAO_DESCONTO` — disparado por LeadsScreen ao tocar **WhatsApp**
- `LIGACAO_RETENCAO` — disparado por LeadsScreen ao tocar **Ligar**

### Segments → [src/services/segments.service.ts](src/services/segments.service.ts)

```ts
interface SegmentBucket {
  segment: LeadSegment;
  count: number;
  percent: number;             // 0–100
  avgTicket: number;
  avgNps: number;
}
interface SegmentDistribution {
  totalCustomers: number;
  buckets: SegmentBucket[];    // sempre 4 buckets, mesmo com count=0
  computedAt: string;          // ISO
}
interface SegmentCustomer {
  customerId: string;
  name: string;
  cpfMasked: string;
  segment: LeadSegment;
  riskScore: number;
  lastVisitAt: string | null;
  estimatedLtv: number;
}
interface CustomerSegmentInfo {
  customerId: string;
  segment: LeadSegment;
  riskScore: number;
  reasons: string[];           // ex: ["12+ meses sem visita", "NPS < 7"]
  computedAt: string;
}
```

> O frontend assume que `buckets` contém os 4 segmentos sempre (mesmo zerados), e ordena na UI por `FIEL → ECONOMICO → ESQUECIDO → ABANDONO`. Se vier faltando algum, o app preenche com zeros, mas é melhor o backend devolver completo.

### Customers (Visão 360) → [src/services/customers.service.ts](src/services/customers.service.ts)

```ts
interface CustomerProfile {
  id: string;
  name: string;
  cpfMasked: string;
  email: string;
  phone: string;
  createdAt: string;
}
interface CustomerLifetime {
  totalSpent: number;
  totalServices: number;
  avgTicket: number;
  avgNps: number;
  firstServiceAt: string;
  lastServiceAt: string;
}
interface Customer360 {
  customer: CustomerProfile;
  vehicles: Vehicle[];                  // mesmo DTO de /me/vehicles
  segment: LeadSegment;
  riskScore: number;
  lifetime: CustomerLifetime;
  recentServices: ServiceRecord[];      // sugerido: últimas 5
  activeAppointments: AppointmentSummary[];
}
type TimelineEventType =
  | 'SERVICE' | 'APPOINTMENT' | 'NPS' | 'REDEEM' | 'LEAD_ACTION' | 'WARRANTY_EVENT';
interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  occurredAt: string;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
}
```

### NPS → [src/services/nps.service.ts](src/services/nps.service.ts)

```ts
type NpsCategory =
  | 'ATENDIMENTO' | 'TEMPO_DE_ESPERA' | 'PRECO'
  | 'QUALIDADE_DO_SERVICO' | 'COMUNICACAO' | 'INSTALACOES';

interface PendingSurvey {
  serviceId: string;
  serviceType: 'REVIEW' | 'OIL_CHANGE' | 'WARRANTY' | 'REPAIR';
  dealership: string;
  performedAt: string;
}

// POST /services/{id}/nps
interface SubmitNpsInput {
  score: number;               // 0–10
  comment?: string;
  likedCategories: NpsCategory[];
  improvementCategories: NpsCategory[];
}
interface NpsResponse extends SubmitNpsInput {
  serviceId: string;
  submittedAt: string;
}
```

> Atenção: o app usa `PRECO` / `QUALIDADE_DO_SERVICO` / `COMUNICACAO` / `INSTALACOES` **sem acentos** (compatibilidade com enums Java). O [API.md:131](API.md) original tem acentos — esta versão sem acentos é o contrato vigente.

### Devices (push) → [src/services/devices.service.ts](src/services/devices.service.ts)

```ts
type DevicePlatform = 'ios' | 'android';

interface RegisterDeviceInput {
  expoPushToken: string;       // ExponentPushToken[xxx]
  platform: DevicePlatform;
  appVersion: string;
  consentAt: string;           // ISO — LGPD: exige consentimento explícito
}
interface DeviceRegistration {
  id: string;
  expoPushToken: string;
  platform: DevicePlatform;
  appVersion: string;
  registeredAt: string;
}
```

Push payload do backend deve carregar:
```json
{
  "title": "Sua revisão está chegando",
  "body": "Agende com 10% off em qualquer concessionária Ford",
  "data": { "deepLink": "fordapp://scheduling?vehicleId=uuid" }
}
```

---

## 📊 Status por tela

| Tela | Integração | Observação |
|---|---|---|
| [LoginScreen](src/screens/LoginScreen.tsx) | ✅ `authService.login` | |
| [HomeScreen](src/screens/client/HomeScreen.tsx) | ✅ vehicles + warranty + alerts + services | |
| [SchedulingScreen](src/screens/client/SchedulingScreen.tsx) | ✅ vehicles + dealerships + availability + create | |
| [LocatorScreen](src/screens/client/LocatorScreen.tsx) | ✅ dealerships | |
| [PointsScreen](src/screens/client/PointsScreen.tsx) | ✅ loyalty completo | |
| [ChatScreen](src/screens/client/ChatScreen.tsx) | ✅ chat sessions/messages | |
| [ProfileScreen](src/screens/client/ProfileScreen.tsx) | ✅ `useMe` + `useMyVehicles` | |
| [DashboardScreen](src/screens/analyst/DashboardScreen.tsx) | ✅ analytics KPIs + séries | |
| [LeadsScreen](src/screens/analyst/LeadsScreen.tsx) | ✅ `useLeads` + `useCreateLeadAction` | Counts/filter computados client-side a partir de 1 fetch (`size=200`) |
| [SegmentationScreen](src/screens/analyst/SegmentationScreen.tsx) | ✅ `useSegmentDistribution` | Funil derivado dos buckets; risk factors ainda hard-coded |

---

## ❌ Pendências do backend

### Endpoints que precisam ser implementados (frontend já tem service + hook prontos)

| Domínio | Endpoint | DTO esperado |
|---|---|---|
| Leads | `GET /leads`, `GET /leads/{id}`, `POST /leads/{id}/actions` | ver [Leads DTO](#leads--srcservicesleadsserviceTs) acima |
| Segmentação | `GET /segments/distribution`, `GET /segments/{segment}/customers`, `GET /customers/{id}/segment` | ver [Segments DTO](#segments--srcservicessegmentsserviceTs) |
| Visão 360 | `GET /customers/{id}`, `/360`, `/timeline` | ver [Customers DTO](#customers-visão-360--srcservicescustomersserviceTs) |
| NPS | `GET /me/surveys/pending`, `POST/GET /services/{id}/nps` | ver [NPS DTO](#nps--srcservicesnpsserviceTs) |
| Push | `POST /me/devices`, `DELETE /me/devices/{token}` | ver [Devices DTO](#devices-push--srcservicesdevicesserviceTs) |
| Analytics extra | `GET /analytics/nps` | `NpsSummary` em [analytics.service.ts:43](src/services/analytics.service.ts#L43) |

### Telas que ainda precisam ser construídas no frontend (hooks já prontos)

- **Detalhe do lead** (consome `useLead`)
- **Drill-down de segmento** (consome `useSegmentCustomers`)
- **Visão 360 do cliente** (consome `useCustomer360` + `useCustomerTimeline`)
- **Modal/tela de NPS pós-serviço** (consome `usePendingSurveys` + `useSubmitNps`)
- **Histórico de agendamentos** (consome `useMyAppointments` + `useCancelAppointment`)
- **Onboarding de push notifications** (consome `useRegisterDevice` com `consentAt`)

---

## 🧱 Padrão para implementar um novo domínio

Sequência ao integrar um endpoint novo:

1. **Service** — `src/services/<dominio>.service.ts`:
   - Exportar tipos (`Lead`, `LeadStatus`, …)
   - Exportar objeto `<dominio>Service` com métodos que chamam `api.get/post/…`
   - Devolver `data` direto (não `AxiosResponse`)
2. **Hook** — `src/hooks/use<Dominio>.ts`:
   - Exportar `<dominio>Keys` factory (`all`, `list(params)`, `detail(id)`, …)
   - Usar `useQuery` para leitura, `useMutation` + `qc.invalidateQueries` para escrita
   - Padrão `enabled: !!id` quando depende de params opcionais
3. **Consumir na tela** — importar hook, ler `{ data, isLoading, error }`, tratar `ApiError`:
   ```tsx
   if (error instanceof ApiError) console.warn(error.problem.detail);
   ```
4. **Invalidação**: mutações relacionadas devem invalidar as keys afetadas (ver exemplo em [useLoyalty.ts:39](src/hooks/useLoyalty.ts#L39) ou [useLeads.ts:31](src/hooks/useLeads.ts#L31)).
5. **Atualizar este BACKEND.md**: adicionar linha na tabela de [endpoints integrados](#-endpoints-integrados-no-app) e mover de [pendências](#-pendências-do-backend) se já tinha sido prometido.

---

## 🔒 LGPD & Segurança

- **CPF**: backend **sempre** mascara (`***.***.789-**`). App nunca recebe CPF cheio. Campos: `Lead.cpfMasked`, `SegmentCustomer.cpfMasked`, `CustomerProfile.cpfMasked`.
- **Tokens**: SecureStore only.
- **Push opt-in**: registrar `consentAt` ISO antes de `POST /me/devices`. Backend deve recusar requests sem `consentAt`.
- **Roles**: ler `role` do JWT ou de `/me`; tela `(client)` ou `(analyst)` é escolhida em [app/_layout.tsx](app/_layout.tsx).

---

## 🗑️ Cleanup pendente no frontend

- [src/services/supabase.ts](src/services/supabase.ts) — **deletar**. Projeto migrou para backend Java; arquivo é resquício.
- Mock data em [src/utils/store.ts](src/utils/store.ts) — `getMockUser` não é mais usado, pode ser removido.

---

## 📋 Checklist de prontidão do backend

- [ ] Swagger publicado em `/api/docs`
- [ ] OpenAPI YAML versionado (`openapi.yaml`) → permite gerar cliente TS com `openapi-typescript-codegen`
- [ ] CORS liberando Expo Metro (`localhost:8081`) e Expo Web (`localhost:19006`)
- [ ] Refresh token com rotação
- [ ] `application/problem+json` em todos os erros
- [ ] CPF mascarado server-side em **todos** os DTOs
- [ ] Ambiente de homologação com seed: 500 clientes, 1.500 serviços, 30 concessionárias, 100+ leads
- [ ] Postman collection com login + refresh pré-configurados
- [ ] Endpoints pendentes implementados (ver [pendências](#-pendências-do-backend))
- [ ] Templates de mensagem cadastrados (`RETORNO_REVISAO_DESCONTO`, `LIGACAO_RETENCAO`, …) para `POST /leads/{id}/actions`

---

## 🔭 Referências cruzadas

| Tópico | Arquivo |
|---|---|
| Contrato detalhado | [API.md](API.md) |
| Status visual do projeto | [PROGRESS.md](PROGRESS.md) |
| Cliente HTTP + interceptors | [src/services/api.ts](src/services/api.ts) |
| Auth bootstrap | [src/services/auth.service.ts](src/services/auth.service.ts) |
| SecureStore wrapper | [src/services/secureStorage.ts](src/services/secureStorage.ts) |
| Provider React Query | [app/_layout.tsx](app/_layout.tsx) |
| Variáveis de ambiente | [src/config/env.ts](src/config/env.ts) · [.env.example](.env.example) |
| Services (todos) | [src/services/](src/services/) |
| Hooks React Query (todos) | [src/hooks/](src/hooks/) |
