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
sem mock: todas as telas leem e escrevem na API real.

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
│   ├── config/env.ts             # EXPO_PUBLIC_API_URL
│   ├── constants/index.ts        # Design tokens (cores, spacing, radius, tipografia)
│   ├── hooks/                    # 17 hooks React Query + utilidades
│   ├── screens/                  # 14 telas (split client/analyst)
│   ├── services/                 # 13 services da API + api.ts (axios) + secureStorage + queryPersist
│   ├── types/index.ts            # Tipos compartilhados (User, UserRole, IconName)
│   └── utils/                    # store.ts (Zustand), deepLinks.ts, pushNotifications.ts
├── scripts/verify-backend.sh     # Smoke test contra o back real
├── app.json                      # Configuração Expo (inclui o eas.projectId)
├── eas.json                      # Perfis de build (development/preview/production)
└── package.json
```

## Setup

```bash
# 1. Dependências
npm install

# 2. Variáveis de ambiente
cp .env.example .env
# O padrão já aponta pro backend no Azure.

# 3. Rodar
npm start          # 'a' Android, 'i' iOS, 'w' Web
```

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

## Telas

Capturas do APK de `preview` rodando contra o backend no Azure. Convenção de
nomes e roteiro de captura em [`docs/screenshots/`](docs/screenshots/README.md).

### Cliente

| | | |
|---|---|---|
| ![Login](docs/screenshots/01-login.png)<br>**Login** | ![Home](docs/screenshots/02-cliente-home.png)<br>**Home** | ![Agendar](docs/screenshots/03-cliente-agendar.png)<br>**Agendar** |
| ![Localizador](docs/screenshots/04-cliente-localizador.png)<br>**Localizador** | ![Pontos](docs/screenshots/05-cliente-pontos.png)<br>**Pontos** | ![Chat](docs/screenshots/06-cliente-chat.png)<br>**Chat Ford AI** |
| ![Perfil](docs/screenshots/07-cliente-perfil.png)<br>**Perfil** | ![Agendamentos](docs/screenshots/08-cliente-agendamentos.png)<br>**Meus agendamentos** | ![NPS](docs/screenshots/09-cliente-nps.png)<br>**Pesquisa NPS** |
| ![Odômetro](docs/screenshots/10-cliente-odometro.png)<br>**Atualizar odômetro** | | |

### Analista

| | | |
|---|---|---|
| ![Dashboard](docs/screenshots/11-analista-dashboard.png)<br>**Dashboard** | ![Leads](docs/screenshots/12-analista-leads.png)<br>**Leads em risco** | ![Segmentação](docs/screenshots/13-analista-segmentacao.png)<br>**Segmentação** |
| ![Visão 360](docs/screenshots/14-analista-visao360.png)<br>**Visão 360** | | |

## Identidade visual

Tudo vive em [`src/constants/index.ts`](src/constants/index.ts). **Não existe
literal hexadecimal em nenhuma tela** — o `grep` abaixo tem que continuar
voltando vazio:

```bash
grep -rE "#[0-9a-fA-F]{3,8}" src app --include=*.tsx --include=*.ts \
  | grep -v src/constants
```

### Cores

| Grupo | Tokens |
|---|---|
| Marca | `primary #003087` (Ford Blue) · `primaryBright #0a4bb8` · `primaryTint #f0f5ff` · `primaryTintStrong #e8efff` · `primaryBorder #c5d4f0` · `secondary #1a73e8` |
| Sucesso | `success #1e8e3e` · `successTint #e9f7ee` |
| Atenção | `warning #f5a623` · `warningStrong #ffc966` · `warningTint #fff4e0` · `warningText #a36b00` |
| Erro | `danger #ea4335` · `dangerTint #fce8e6` · `dangerText #c62828` |
| Neutros | `background #f5f5f7` · `surface #fff` · `surfaceAlt #eef0f3` · `surfaceMuted #f0f2f5` · `border #e6e8eb` · `borderStrong #c5cdd9` · `dark #202124` · `gray #80868b` |
| Categóricas | `ACCENTS`: violet, purple, purpleDark, pink, coral, teal — para avatares, categorias de prêmio e tipos de evento na timeline. Sem significado de status. |

Os `rgba(255,255,255,x)` sobre o hero azul continuam inline: são variações de
opacidade sobre um mesmo fundo, não cores do sistema.

### Layout e tipografia

| Token | Uso |
|---|---|
| `SPACING` | `xs 4` → `xxl 24` |
| `RADIUS` | `sm 8` · `md 12` · `lg 14` · `xl 20` · `hero 28` · `pill` |
| `SHADOWS` | `card` (opacity 0.04) e `raised` (0.06) |
| `TYPOGRAPHY` | `heroTitle` · `title` · `sectionTitle` · `body` · `label` · `caption` |
| Hero | Fundo Ford Blue + blob decorativo + card branco overlay (`borderTopRadius: 28`) |
| Splash/Icon | Logo oval Ford sobre fundo `#003087` |

Nomes de ícone são tipados (`IconName` em `src/types`), então um glifo escrito
errado vira erro de compilação em vez de um quadrado vazio em runtime.

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

31 testes em 4 suítes:

| Suíte | Cobre |
|---|---|
| `services/__tests__/api` | `ApiError`, o envelope de resposta e a tradução de erros que o backend não descreve (401 sem corpo, 5xx, timeout, falta de rede) |
| `services/__tests__/queryPersist` | Allowlist de persistência do cache |
| `utils/__tests__/deepLinks` | `parseDeepLink` |
| `components/__tests__/StateBox` | Estados de loading/erro/vazio |

Antes de apresentar, rodar o smoke test contra o backend no ar:

```bash
EMAIL=… PASSWORD=… bash scripts/verify-backend.sh
```

## Build (EAS)

O `projectId` já está em `app.json` (`extra.eas.projectId`). Perfis em
`eas.json` — **todos geram APK**, inclusive `production`:

| Perfil | API | Uso |
|---|---|---|
| `development` | `localhost:8080` | Dev client |
| `preview` | Azure | APK interno para testes |
| `production` | Azure | Entrega final (`autoIncrement`) |

```bash
npm i -g eas-cli
eas login
eas build --profile preview --platform android    # APK para instalar direto
eas build --profile production --platform android # entrega final
```

> `production` está configurado como `buildType: apk` porque a entrega da
> sprint pede um APK instalável. Para publicar na Play Store, trocar para
> `app-bundle` (a loja não aceita APK) e então rodar `eas submit`.
