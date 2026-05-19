# 📊 Ford VIN Share — Progresso do Projeto

> Última atualização: **2026-05-19**

---

## ✅ Concluído

### 🏗️ Arquitetura
- [x] Expo SDK 54 + TypeScript + React 19
- [x] **expo-router** (file-based routing) substituindo `@react-navigation`
- [x] Estrutura `app/` com route groups `(client)` e `(analyst)` + rotas modais (`/nps/[serviceId]`, `/customers/[customerId]`)
- [x] **Zustand** mínimo (`user`, `role`, `setUser`, `logout`) — restante vem da API via React Query
- [x] **React Query** com `staleTime: 30s`, `gcTime: 24h` e `retry: 1`
- [x] **PersistQueryClientProvider** + AsyncStorage para modo offline da Home (allowlist: vehicles/warranty/alerts/services)
- [x] **expo-secure-store** para `accessToken` + `refreshToken` (LGPD)
- [x] **axios** com interceptors: injeta `Authorization: Bearer`, refresh transparente no 401 com fila compartilhada
- [x] **ApiError** classe normalizando RFC 7807 (`problem+json`)
- [x] Push registration (`expo-notifications`) + deep links `fordapp://` no cold/warm-start
- [x] Geolocalização real (`expo-location`) com fallback SP

### 🔌 Integração com a API Java
Todos os 13 services do contrato implementados em `src/services/*.service.ts`:

| Service | Endpoints | Tela |
|---|---|---|
| `auth.service` | login, refresh, logout, /me | LoginScreen, splash |
| `vehicles.service` | list, getById, warranty, alerts, odometer | HomeScreen, ProfileScreen |
| `services.service` | listMine, getById, listByVehicle | HomeScreen |
| `dealerships.service` | list, getById, availability | LocatorScreen, SchedulingScreen |
| `appointments.service` | serviceTypes, create, listMine, cancel, getById | SchedulingScreen, AppointmentsScreen |
| `loyalty.service` | balance, transactions, rewards, redeem | PointsScreen, ProfileScreen |
| `chat.service` | createSession, sendMessage, getHistory | ChatScreen |
| `devices.service` | register, unregister | bootstrap silencioso |
| `nps.service` | listPending, submit, get | NpsScreen, banner Home |
| `analytics.service` | kpis, vin-share series, by-dealership, nps | DashboardScreen analista |
| `leads.service` | list, getById, createAction | LeadsScreen |
| `segments.service` | distribution, customers, customer-segment | SegmentationScreen |
| `customers.service` | getById, get360, getTimeline | Customer360Screen |

### 🎨 Telas implementadas

**Cliente (6 abas + 1 modal):**
- LoginScreen — form email/senha real, redirect por role
- HomeScreen — vehicle card + warranty + alerts + timeline + NPS banner + promo
- SchedulingScreen — stepper 3 passos integrado com `useServiceTypes` + `useDealerships` + `useDealershipAvailability` + `useCreateAppointment`
- LocatorScreen — search + filtros por ServiceType + mock map + cards reais
- PointsScreen — saldo + tier + carousel rewards + extrato + redeem
- ChatScreen — sessão + histórico + suggestedActions + 429 handling
- ProfileScreen — dados de `/me` + veículos + preferências + logout
- NpsScreen (modal) — score 0-10 + categorias + comentário

**Analista (3 abas + 1 push):**
- DashboardScreen — KPIs + chart VIN Share + insights + top dealers
- LeadsScreen — filtros por status + cards com risk score + ações
- SegmentationScreen — donut + funil + distribuição
- Customer360Screen — visão 360 acessada por toque no lead

---

## 🟡 Pendências conhecidas

### Funcionalmente
- [ ] Backend Java rodando contra o app (ainda não exercitado)
- [ ] Types vindos de OpenAPI (esperando `openapi.yaml`) — hoje os shapes são manuais
- [ ] Tela do analista para `PATCH /appointments/{id}/check-in` e `/complete`
- [ ] Botão de edição de endereço no Profile (sem endpoint no contrato)
- [ ] Atualização do telefone/email no Profile (sem endpoint no contrato)

### Visual/qualidade
- [ ] Ícone do app e splash com identidade Ford definitiva
- [ ] Universal Links em domínio próprio (hoje só `fordapp://`)
- [ ] EAS Build configurado para distribuição
- [ ] Error tracking (Sentry ou equivalente)

---

## 🎨 Design System Ford-Inspired

| Token | Valor |
|---|---|
| Primária | `#003087` (Azul Ford) |
| Background | `#f5f5f7` |
| Hero | Azul Ford + blob decorativo + scroll content com `borderTopRadius: 28` |
| Cards | `borderRadius: 14-20`, sombra `opacity: 0.04-0.06` |
| Tipografia | Sans-serif bold, hierarquia forte |
| Status badges | Dot colorido + texto |
| Componente compartilhado de estado | `<StateBox variant="loading|error|empty" />` |

---

## 📂 Estrutura de Pastas

```
app/
├── _layout.tsx              # Root Stack + Providers (Query, Push, DeepLinks)
├── index.tsx                # Bootstrap (auto-login) → Login | Redirect
├── (client)/
│   ├── _layout.tsx          # Tabs cliente
│   ├── home.tsx, scheduling.tsx, locator.tsx, points.tsx, chat.tsx, profile.tsx
├── (analyst)/
│   ├── _layout.tsx          # Tabs analista
│   └── dashboard.tsx, leads.tsx, segmentation.tsx
├── nps/[serviceId].tsx      # Modal slide-from-bottom
└── customers/[customerId].tsx  # Slide-from-right (analista)

src/
├── components/
│   ├── FordLogo.tsx
│   └── StateBox.tsx
├── config/env.ts            # EXPO_PUBLIC_API_URL
├── hooks/                   # useAuth, useVehicles, useServices, useDealerships,
│                            #  useAppointments, useLoyalty, useChat, useDevices,
│                            #  useNps, useAnalytics, useLeads, useSegments,
│                            #  useCustomers, useUserLocation, usePushRegistration,
│                            #  useNotificationDeepLinks
├── screens/                 # 13 telas
├── services/                # 13 services + api.ts + secureStorage + queryPersist
├── types/index.ts           # User, UserRole (mínimo)
├── utils/store.ts           # Zustand
├── utils/pushNotifications.ts
└── utils/deepLinks.ts
```

---

## 📋 Como rodar localmente

```bash
# 1. Instalar
npm install

# 2. Configurar API
cp .env.example .env
# Edite EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1

# 3. Subir o backend Java (não incluso neste repo)

# 4. Rodar o app
npm start
# pressione 'a' (Android), 'i' (iOS) ou 'w' (Web)
```

### 🎬 Modo demonstração (sem backend)

Quando o backend Java não estiver disponível, defina no `.env`:

```bash
EXPO_PUBLIC_DEMO_MODE=true
```

A LoginScreen passa a exibir um painel amarelo com dois botões:

- **Cliente** → entra como João Silva (Ranger 2023) com veículos, agendamentos, pontos, chat e pesquisa NPS preenchidos
- **Analista** → entra como Ana Oliveira com KPIs, gráfico VIN Share, leads, distribuição de segmentos e visão 360 já populados

O React Query é semeado com fixtures realistas (`src/utils/demoMode.ts`) antes das telas montarem, então tudo carrega instantaneamente. Apenas as **mutations** (criar agendamento, resgatar prêmio, enviar mensagem no chat, etc.) tentam bater na API real e falham — o demo serve para apresentar navegação e estados visuais, não para escrever dados.

---

## 📚 Referências

- `API.md` — contrato detalhado do back consumido aqui
- `BACKEND.md` — guia de integração do back (vindo do time do server)
