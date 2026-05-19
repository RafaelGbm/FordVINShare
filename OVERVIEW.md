# 🚗 Ford VIN Share — Visão geral do projeto

Documento narrativo do que foi construído: o produto, as decisões tomadas
e o caminho percorrido até a entrega atual.

> **Status**: pronto para integrar com o backend Java.
> **Stack**: Expo SDK 54 · React 19 · TypeScript · expo-router · React Query · Zustand · axios
> **Identidade**: Ford-inspired (azul `#003087`, logo oval real, splash + ícone customizados)

---

## 1. O produto

Aplicativo mobile (Android, iOS, Web) que cobre dois públicos da Ford com a mesma base de código:

### Cliente
- Acompanhar a garantia do veículo (`Garantia Ford Plus`)
- Receber alertas de manutenção baseados em KM
- Agendar serviços (revisão, troca de óleo, garantia, reparo)
- Localizar concessionárias por geolocalização
- Acumular e resgatar pontos do programa de fidelidade
- Conversar com um assistente IA (Ford AI) com sugestões de deep link
- Responder pesquisas de NPS pós-serviço
- Gerenciar o próprio perfil e veículos (atualizar km, ver histórico)
- Visualizar a lista de agendamentos (próximos, histórico, cancelados)

### Analista (concessionária)
- Dashboard com KPIs (veículos em garantia, taxa VIN Share, receita estimada, leads em risco)
- Gráfico VIN Share semanal com média, pico e meta
- Ranking de concessionárias
- Lista de leads segmentada (Novo / Em risco / Perdido / Recuperado) com score de risco
- Ações de WhatsApp e ligação com templates pré-definidos
- Distribuição de segmentos (Fiel / Econômico / Esquecido / Abandono) em donut e funil
- Visão 360 do cliente (LTV, histórico, timeline detalhada, agendamentos ativos)
- Registro de chegada (check-in) e conclusão de atendimento

---

## 2. Decisões arquiteturais importantes

Durante o projeto, várias escolhas foram feitas e documentadas como memória de longo prazo:

| Decisão | Por quê |
|---|---|
| **Backend Java** (não Supabase nem mock) | Cliente já tem o backend; o app só consome |
| **expo-router** (não @react-navigation) | Conflito de NavigationContainer + padrão mais moderno do Expo |
| **Design Ford-inspired** (não cópia 1:1 do FordPass) | Sem screenshots oficiais; criar algo original que respeita a identidade |
| **Zustand mínimo + React Query** | Cache, retry, loading/error de graça; Zustand só pra `user`/`role` |
| **SecureStore para tokens** | LGPD — JWT nunca em AsyncStorage |
| **Types manuais por enquanto** | Esperando OpenAPI do back; migrar geração automática depois |
| **PersistQueryClient com allowlist** | Modo offline da Home sem persistir dados sensíveis |

---

## 3. Linha do tempo do projeto

### Fase 1 — Design (10 telas)

Telas desenhadas seguindo o padrão Ford-inspired:
- **Cliente**: Login, Home, Scheduling, Locator, Points, Chat, Profile
- **Analista**: Dashboard, Leads, Segmentation

Padrões de design recorrentes:
- Hero azul Ford com blob decorativo
- Card branco overlay com `borderTopRadius: 28`
- Stats em row com dividers verticais
- StateBox compartilhado para loading/error/empty
- Tipografia bold com hierarquia forte
- CTAs azul Ford com sombra colorida

### Fase 2 — Migração de navegação

Removido `@react-navigation` em favor de `expo-router` file-based:
```
app/
├── _layout.tsx              (root Stack + providers)
├── index.tsx                (bootstrap → auto-login → redirect por role)
├── (client)/                (tabs do cliente)
├── (analyst)/               (tabs do analista)
├── nps/[serviceId].tsx      (modal)
├── customers/[customerId].tsx
├── odometer/[vehicleId].tsx (modal)
└── appointments.tsx
```

### Fase 3 — Integração com a API Java

13 services criados em `src/services/*.service.ts` cobrindo todos os endpoints do contrato:

| Service | Endpoints | Tela primária |
|---|---|---|
| `auth.service` | login, refresh, logout, /me | LoginScreen, bootstrap |
| `vehicles.service` | list, getById, warranty, alerts, odometer | HomeScreen |
| `services.service` | listMine, getById, listByVehicle | HomeScreen |
| `dealerships.service` | list, getById, availability | LocatorScreen |
| `appointments.service` | service-types, create, list, cancel, check-in, complete | SchedulingScreen, AppointmentsScreen, Customer360 |
| `loyalty.service` | balance, transactions, rewards, redeem | PointsScreen, ProfileScreen |
| `chat.service` | createSession, sendMessage, getHistory | ChatScreen |
| `devices.service` | register, unregister | bootstrap silencioso |
| `nps.service` | listPending, submit, get | NpsScreen, Home banner |
| `analytics.service` | kpis, vin-share series, by-dealership, nps | DashboardScreen |
| `leads.service` | list, getById, createAction | LeadsScreen |
| `segments.service` | distribution, customers, customer-segment | SegmentationScreen |
| `customers.service` | getById, get360, getTimeline | Customer360Screen |

Cada service tem um arquivo `useXxx.ts` em `src/hooks/` com hooks do React Query (`useQuery` / `useMutation` com `invalidateQueries` no sucesso).

### Fase 4 — Infraestrutura

**Cliente HTTP** (`src/services/api.ts`):
- axios com `baseURL` da env
- Interceptor de request: injeta `Authorization: Bearer` do SecureStore
- Interceptor de response: refresh transparente no 401 com fila compartilhada (uma única request de refresh, todas as falhas em paralelo aguardam)
- `ApiError` classe normalizando RFC 7807 (`problem+json`)
- Callback `onLogout` quando refresh falha → limpa SecureStore + `router.replace('/')`

**Persistência offline** (`src/services/queryPersist.ts`):
- `PersistQueryClientProvider` com `createAsyncStoragePersister`
- Allowlist: só persiste `vehicles.list`, `vehicles.warranty`, `vehicles.alerts` e `services.mine`
- `gcTime: 24h` para o cache não ser coletado antes da próxima abertura
- `QUERY_CACHE_BUSTER` para invalidar quando o shape evoluir

**Push notifications**:
- `getExpoPushRegistration()` pede permissão e obtém token
- `usePushRegistration` registra no backend logo após login (com `appVersion` + `consentAt` LGPD)
- `useNotificationDeepLinks` trata tap em foreground/background/cold-start
- `parseDeepLink()` traduz `fordapp://scheduling?vehicleId=...` → `/(client)/scheduling?vehicleId=...`

**Geolocalização** (`src/hooks/useUserLocation.ts`):
- Pede permissão foreground via `expo-location`
- Lê coordenadas atuais
- Fallback automático para o centro de São Paulo se permissão for negada ou GPS falhar
- LocatorScreen mostra banner amarelo quando estiver usando o fallback

### Fase 5 — Auditoria e limpeza

Após a integração completa:
- **TypeScript**: `tsc --noEmit` 0 erros
- **ESLint**: `expo lint` 0 warnings (eram 14)
- **Expo Doctor**: 17/17 checks
- Removido todo o legado do template Expo (`components/`, `hooks/`, `constants/`, `scripts/reset-project.js`, react-logo assets)
- Removido `@react-navigation/*` (não usado depois da migração)
- Removido `@supabase/supabase-js` e `src/services/supabase.ts` (não usado)
- Removido mocks no Zustand store
- 1.081 linhas de código morto deletadas

### Fase 6 — Polimento final

- **Tela "Meus agendamentos"** ligada a `useMyAppointments` + `useCancelAppointment`
- **Modal de atualizar odômetro** com validação (deve ser >= current_km e < +100k delta)
- **ProfileScreen stats reais** (services count, loyalty balance, vehicles count)
- **Check-in / Concluir atendimento** no Customer 360 do analista
- **Ícone do app** 1024×1024 gerado da logo Ford com fundo azul
- **Splash screen** Ford-azul com a logo centralizada
- **App rebatizado** para "Ford VIN Share" + bundle id `com.ford.vinshare`
- **Setup de testes** (Jest + RNTL + jest-expo)
- **20 testes essenciais** cobrindo parseDeepLink, shouldPersistQuery, ApiError, StateBox
- **EAS configurado** (`eas.json` com dev/preview/production)
- **BUILD.md** com guia de build e submit

---

## 4. Estrutura final do código

```
ford-vin-share/
├── app/                                # expo-router file-based routes
│   ├── _layout.tsx                     # Root Stack + Providers
│   ├── index.tsx                       # Bootstrap
│   ├── (client)/                       # Tabs cliente
│   ├── (analyst)/                      # Tabs analista
│   ├── nps/[serviceId].tsx
│   ├── customers/[customerId].tsx
│   ├── odometer/[vehicleId].tsx
│   └── appointments.tsx
├── src/
│   ├── components/
│   │   ├── FordLogo.tsx
│   │   └── StateBox.tsx
│   ├── config/env.ts
│   ├── hooks/                          # 17 hooks de React Query + utilidades
│   ├── screens/                        # 13 telas
│   ├── services/                       # 13 services + api + persistência
│   ├── types/index.ts                  # User, UserRole
│   ├── utils/store.ts                  # Zustand minimal
│   ├── utils/pushNotifications.ts
│   └── utils/deepLinks.ts
├── assets/images/
│   ├── app-icon.png                    # gerado da logo
│   ├── splash-icon.png                 # gerado da logo
│   └── Logo-ford-vector-transparent-PNG-removebg-preview.png
├── app.json                            # Expo config (scheme, plugins, icons)
├── eas.json                            # perfis de build
├── jest.config.js                      # preset jest-expo
├── .env.example
└── docs:
    ├── README.md
    ├── PROGRESS.md
    ├── API.md
    ├── BACKEND.md
    ├── BUILD.md
    └── OVERVIEW.md  ← você está aqui
```

---

## 5. Funcionalidades transversais

### Autenticação e sessão
1. Login form com validação (email + senha mín. 6 chars)
2. `POST /auth/login` retorna `{ accessToken, refreshToken, role, userId }`
3. Tokens salvos no SecureStore
4. App busca `/me` e popula o Zustand store
5. Redirect por role (CLIENT → `/(client)/home`, ANALYST → `/(analyst)/dashboard`)
6. Próxima abertura: bootstrap lê o token, chama `/me`, restaura sessão sem login
7. Logout: revoga no backend → limpa SecureStore → volta pro Login

### Tratamento de erros (RFC 7807)
Toda exceção do interceptor vira `ApiError` com shape:
```ts
{ title, status, detail?, instance?, errors? }
```
As telas tratam variants comuns:
- `401` → "Email ou senha incorretos"
- `409` → "Horário já reservado"
- `429` → "Muitas mensagens em pouco tempo"
- demais → `problem.detail || problem.title`

### Loading / error / empty
Componente compartilhado `<StateBox variant="loading|error|empty" />` usado em:
HomeScreen, LocatorScreen, DashboardScreen, AppointmentsScreen, UpdateOdometerScreen.

### Deep links
| URL push | Rota mobile |
|---|---|
| `fordapp://home` ou `vehicle` | `/(client)/home` |
| `fordapp://scheduling?...` | `/(client)/scheduling?...` |
| `fordapp://locator` | `/(client)/locator` |
| `fordapp://points` | `/(client)/points` |
| `fordapp://chat` | `/(client)/chat` |
| `fordapp://nps?serviceId=X` | `/nps/X` (modal) |
| `fordapp://dashboard` | `/(analyst)/dashboard` |
| `fordapp://leads` | `/(analyst)/leads` |
| `fordapp://segmentation` | `/(analyst)/segmentation` |

Funciona em cold-start (app fechado) e warm-start (app em background).

---

## 6. Qualidade

| Categoria | Ferramenta | Status |
|---|---|---|
| Type checking | `tsc --noEmit` | ✅ 0 erros |
| Linting | `expo lint` (ESLint) | ✅ 0 warnings |
| Tests | Jest + React Native Testing Library | ✅ 4 suites, 20 testes |
| Config | `expo-doctor` | ✅ 17/17 |

### O que está coberto por testes

- `parseDeepLink()`: 10 cases (hosts cliente/analista, nps com path-param, query forwarding, bare paths, edge cases)
- `shouldPersistQuery()`: 5 cases (allowlist + denylist + non-string keys)
- `ApiError`: 2 cases (herda Error, fallback de mensagem)
- `<StateBox />`: 4 cases (variants loading/error/empty + onRetry)

### O que **não** tem teste ainda

- Telas individuais (smoke tests)
- Hooks de React Query (precisaria de wrapper de mock)
- Fluxo de auth end-to-end
- Integração com backend real (depende do back estar de pé)

---

## 7. Build e distribuição

### Local
```bash
cp .env.example .env
# editar EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1
npm install
npm start    # 'a' Android, 'i' iOS, 'w' Web
```

### Cloud (EAS)
Perfis configurados em `eas.json`:

| Perfil | Distribuição | API URL placeholder |
|---|---|---|
| `development` | internal dev-client | localhost:8080 |
| `preview` | APK interno + IPA ad-hoc | api-hml.ford.example |
| `production` | App Store / Play Store | api.ford.example |

Comandos em `BUILD.md`. Antes de buildar:
1. Criar projeto no `expo.dev` e colar o `projectId` em `app.json` em `extra.eas.projectId`
2. Trocar as URLs `*.ford.example` pelos domínios reais

---

## 8. Identidade visual

| Token | Valor |
|---|---|
| Cor primária | `#003087` (Ford Blue) |
| Cor sucesso | `#1e8e3e` |
| Cor warning | `#f5a623` |
| Cor erro | `#ea4335` |
| Background app | `#f5f5f7` |
| Cards | `borderRadius: 14-20`, sombra `opacity: 0.04-0.06` |
| Hero | Fundo Ford Blue + blob 200px com `rgba(255,255,255,0.06)` |
| Logo | PNG oval Ford real em `assets/images/Logo-ford-...png` |
| Splash | Logo centralizada sobre fundo `#003087` |

---

## 9. O que **ainda** precisa de ação externa

Itens fora do escopo do código que dependem de você ou do time:

- [ ] Subir o **backend Java** localmente e validar todos os endpoints
- [ ] Gerar `openapi.yaml` no back e regenerar/conferir os types
- [ ] Criar projeto no `expo.dev` e colar `projectId` em `app.json`
- [ ] Trocar `api-hml.ford.example` / `api.ford.example` em `eas.json` pelos domínios reais
- [ ] Conta Apple Developer + Google Play para `eas submit`
- [ ] Domínio próprio com `.well-known/apple-app-site-association` para Universal Links (hoje só temos custom scheme `fordapp://`)
- [ ] Instrumentar Sentry ou Datadog para error tracking em produção

Tudo do lado de **código** está pronto, testado estaticamente e documentado.

---

## 10. Documentos relacionados

| Arquivo | Para que serve |
|---|---|
| [README.md](./README.md) | Visão de produto e roadmap (alto nível) |
| [API.md](./API.md) | Contrato do backend Java consumido aqui |
| [BACKEND.md](./BACKEND.md) | Guia de integração do back (vindo do time do server) |
| [PROGRESS.md](./PROGRESS.md) | Estado das telas e funcionalidades |
| [BUILD.md](./BUILD.md) | Como gerar builds via EAS |
| [OVERVIEW.md](./OVERVIEW.md) | Este documento — narrativa do projeto |

---

## 📞 Contato

Desenvolvido por **Rafael Gaspar Martins**
- Email: rafaelgasparmartins@icloud.com
- GitHub: [@RafaelGbm](https://github.com/RafaelGbm)

Co-Authored-By: Claude Haiku 4.5
