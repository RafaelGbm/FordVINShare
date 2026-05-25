# Ford VIN Share

**Nomes e RM's**

- Vinicius Monteiro Araújo — 555088
- Guilherme Almeida — 555180
- Rafael Duarte de Freitas — 558644
- Rafael Gaspar Bragança Martins — 557228
- Luiz Gustavo da Silva — 558358

App mobile (iOS, Android, Web) que cobre dois públicos da Ford a partir da
mesma base de código: **Cliente** (acompanhar garantia, agendar serviços,
encontrar concessionária, pontos, chat IA) e **Analista** (KPIs de VIN Share,
leads em risco, segmentação preditiva, Visão 360 do cliente).

O app **consome um backend Java/Spring Boot** hospedado no Azure
(`https://vinshare-api.azurewebsites.net/api/v1`, PostgreSQL). Sem Supabase,
sem mock — quando o back está fora, o app pode rodar em **modo demo**
(flag de ambiente, com fixtures realistas pré-populadas no React Query).

## Stack

- **Expo SDK 54** + React 19 + TypeScript
- **expo-router** (file-based routing em `app/`)
- **React Query** (cache, retry, refetch, persistência offline)
- **Zustand** (mínimo — só `user`/`role` da sessão atual)
- **axios** com interceptors (Bearer JWT, refresh transparente no 401)
- **expo-secure-store** para os tokens (LGPD — JWT nunca em AsyncStorage)
- **expo-notifications** + deep links `fordapp://`
- **expo-location** com fallback para São Paulo

## Estrutura

```
FordVINShare/
├── app/                          # expo-router (file-based routes)
│   ├── _layout.tsx               # Stack root + Providers (Query, Push, Deep Links)
│   ├── index.tsx                 # Bootstrap: auto-login via SecureStore
│   ├── (client)/                 # Tabs do cliente (home, scheduling, locator, points, chat, profile)
│   ├── (analyst)/                # Tabs do analista (dashboard, leads, segmentation)
│   ├── appointments.tsx          # "Meus agendamentos"
│   ├── customers/[customerId].tsx
│   ├── nps/[serviceId].tsx
│   └── odometer/[vehicleId].tsx
├── src/
│   ├── components/               # FordLogo, StateBox
│   ├── config/env.ts             # EXPO_PUBLIC_API_URL, EXPO_PUBLIC_DEMO_MODE
│   ├── hooks/                    # 17 hooks React Query + utilidades
│   ├── screens/                  # 13 telas (split client/analyst)
│   ├── services/                 # 13 services da API + api.ts (axios) + secureStorage + queryPersist
│   ├── types/index.ts            # Tipos compartilhados (User, UserRole)
│   └── utils/                    # store.ts (Zustand), demoMode.ts, deepLinks.ts, pushNotifications.ts
├── scripts/verify-backend.sh     # Smoke test contra o back real
├── app.json                      # Configuração Expo
├── eas.json                      # Perfis de build (dev/preview/production)
└── package.json
```

## Setup

```bash
# 1. Dependências
npm install

# 2. Variáveis de ambiente
cp .env.example .env
# Edite:
#   EXPO_PUBLIC_API_URL=https://vinshare-api.azurewebsites.net/api/v1
#   EXPO_PUBLIC_DEMO_MODE=false      (true se quiser rodar sem o back)

# 3. Rodar
npm start          # 'a' Android, 'i' iOS, 'w' Web
```

### Modo demonstração (sem backend)

Setar `EXPO_PUBLIC_DEMO_MODE=true` no `.env`. A LoginScreen passa a exibir um
painel com dois botões:

- **Cliente** → entra como João Silva (Ranger 2023), com veículos,
  agendamentos, pontos, chat e NPS pré-preenchidos
- **Analista** → entra como Ana Oliveira, com KPIs, leads, distribuição de
  segmentos e Visão 360 já populados

O React Query é semeado com fixtures (`src/utils/demoMode.ts`) antes das
telas montarem. Mutations (criar agendamento, resgatar prêmio, enviar
mensagem no chat) ainda tentam bater na API real e falham — o demo é só
pra apresentar navegação e estados visuais.

## Fluxos do app

### Cliente
- **Home**: status da garantia (`/me/vehicles` + `/vehicles/{id}/warranty`),
  alertas de quilometragem, últimos serviços, banner de NPS pendente
- **Agendar**: stepper de 3 passos integrado a `/service-types`,
  `/dealerships`, `/dealerships/{id}/availability` e `POST /appointments`
- **Localizador**: geolocalização real (`expo-location`) + filtros, com
  fallback automático pro centro de São Paulo
- **Pontos**: saldo + extrato + catálogo de rewards + resgate
- **Chat (Ford AI)**: sessão + histórico de mensagens; o backend integra
  com Claude API server-side, app só consome
- **Perfil**: `/me`, lista de veículos, atualização de odômetro, logout

### Analista
- **Dashboard**: KPIs (veículos em garantia, taxa VIN Share, receita
  estimada, leads em risco) + gráfico VIN Share + ranking de concessionárias
- **Leads**: filtros por status (`NOVO`/`EM_RISCO`/`PERDIDO`/`RECUPERADO`)
  + score de risco + ações de WhatsApp/Ligação
- **Segmentação**: donut + funil de fidelização (`FIEL`/`ECONOMICO`/
  `ESQUECIDO`/`ABANDONO`)
- **Visão 360**: LTV, histórico, timeline detalhada, check-in e conclusão
  de atendimento

## Identidade visual

| Token | Valor |
|---|---|
| Primária | `#003087` (Ford Blue) |
| Sucesso | `#1e8e3e` |
| Warning | `#f5a623` |
| Erro | `#ea4335` |
| Background | `#f5f5f7` |
| Cards | `borderRadius: 14-20`, sombra `opacity: 0.04-0.06` |
| Hero | Fundo Ford Blue + blob decorativo + card branco overlay (`borderTopRadius: 28`) |
| Splash/Icon | Logo oval Ford sobre fundo `#003087` |

## Autenticação

`POST /auth/login` retorna `{ accessToken, refreshToken, role, userId }`.
Tokens vão pro SecureStore; o interceptor do axios anexa
`Authorization: Bearer …` em toda chamada. Em `401`, dispara `POST
/auth/refresh` uma vez (deduplicado entre requests concorrentes) e refaz
a request original. Se o refresh falha, limpa SecureStore e redireciona
pro `/`.

Role lida do JWT decide se `app/index.tsx` redireciona pra `(client)` ou
`(analyst)`. ADMIN é tratado como analyst.

## Modo offline

`PersistQueryClientProvider` com `AsyncStorage` e allowlist em
`src/services/queryPersist.ts`. Persiste apenas leitura de baixo risco:

- `vehicles.list`
- `vehicles.warranty`
- `vehicles.alerts`
- `services.mine`

`gcTime: 24h`. `QUERY_CACHE_BUSTER` invalida o cache quando o shape evolui.

## Algoritmo de segmentação (backend)

O score de risco (0–100) é calculado server-side. Heurística:

| Critério | Peso |
|---|---|
| Última visita > 12 meses | +30 |
| Garantia vencendo < 60 dias | +20 |
| NPS < 7 | +25 |
| Km próximo de revisão | +15 |
| 3+ serviços último ano | −20 |
| NPS ≥ 9 | −10 |

Faixas que viram `status` no lead:

- score ≥ 80 → `PERDIDO`
- score ≥ 60 → `EM_RISCO`
- score < 20 → `RECUPERADO`
- demais → `NOVO`

## Qualidade

| Checa | Comando |
|---|---|
| Type check | `npx tsc --noEmit` |
| Lint | `npm run lint` |
| Testes | `npm test` |
| Validar back real | `EMAIL=… PASSWORD=… bash scripts/verify-backend.sh` |

Testes cobrem `parseDeepLink`, `shouldPersistQuery`, `ApiError`,
`<StateBox />`.

## Build (EAS)

Perfis em `eas.json` (`development` / `preview` / `production`). Antes
de subir builds standalone, criar projeto em https://expo.dev e colar o
`projectId` em `app.json` (`extra.eas.projectId`).

```bash
npm i -g eas-cli
eas login
eas build --profile preview --platform all
eas submit --platform android   # depois de production
eas submit --platform ios
```
