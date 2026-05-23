# 📜 CHANGELOG — Ford VIN Share

Registro cronológico de **tudo** que foi feito no projeto, agrupado por fases lógicas. Total: **~88 commits**.

---

## 🌱 Fase 0 — Setup inicial

3 commits que criaram o esqueleto do projeto.

| Commit | Descrição |
|---|---|
| `6223bbd` | chore: initial project structure with expo, navigation, and screen templates |
| `a10462a` | docs: complete project README with setup and structure |
| `217be4f` | feat: redesign HomeScreen with professional Ford-style UI |

**Entrega:** Expo + TypeScript + navegação `@react-navigation` + templates de todas as telas + primeira versão estilizada da HomeScreen.

---

## 🎨 Fase 1 — Design das 10 telas (Ford-inspired)

Replicar a identidade visual da Ford sem cópia 1:1 do FordPass.

### Fundação visual
| Commit | Descrição |
|---|---|
| `6ee01ce` | chore: migrate navigation to expo-router |
| `091b970` | chore: install react-native-svg and align expo dependency versions |
| `52994b2` | feat: add FordLogo component backed by Ford PNG asset |

### Telas do cliente
| Commit | Descrição |
|---|---|
| `444afec` | feat: redesign LoginScreen with Ford-inspired hero and demo profiles |
| `8412522` | feat: enhance HomeScreen with vehicle card, warranty bar and timeline |
| `18fe842` | feat: build SchedulingScreen with 3-step booking flow |
| `dede5aa` | feat: build LocatorScreen with stylized map and dealer cards |
| `dbd0373` | feat: build PointsScreen with loyalty card and rewards carousel |
| `3f23122` | feat: build ChatScreen with Ford AI conversational UI |
| `d39f09e` | feat: build ProfileScreen and wire it as a client tab |

### Telas do analista
| Commit | Descrição |
|---|---|
| `d24998a` | feat: enhance analyst DashboardScreen with KPIs, chart and rankings |
| `b2e5427` | feat: build analyst LeadsScreen with risk scoring and segments |
| `a5457e7` | feat: build analyst SegmentationScreen with donut, funnel and risk factors |

### Limpeza
| Commit | Descrição |
|---|---|
| `d7e638f` | refactor: drop @react-navigation prop types from screens |
| `36544a1` | docs: add PROGRESS.md tracking design progress and remaining work |

**Entrega:** 10 telas com design Ford-inspired (azul `#003087`, hero + card + blob), navegação migrada para `expo-router` file-based, logo Ford real como PNG.

---

## 🔌 Fase 2 — Fundação HTTP + Auth real

Estabelecer o cliente HTTP, gerenciamento de tokens e autenticação contra o backend Java.

| Commit | Descrição |
|---|---|
| `76b3e90` | chore: install API integration dependencies |
| `eff8b18` | feat: add HTTP client foundation for Java backend integration |
| `bd3f2c6` | chore: configure React Query and auth bootstrap in root layout |
| `86972a0` | docs: add API.md with backend contract reference |
| `c486e68` | feat: wire LoginScreen to real auth flow |
| `cb89dd1` | feat: auto-login from SecureStore on app start |
| `4321744` | refactor: revoke tokens via authService.logout before clearing store |

**Entrega:**
- `axios` com interceptors (Bearer + refresh transparente no 401 com fila compartilhada)
- `ApiError` normalizando RFC 7807 (`problem+json`)
- `expo-secure-store` para `accessToken` + `refreshToken` (LGPD)
- React Query como Provider global
- LoginScreen com form real (email + senha)
- Auto-login no entry point (lê token, chama `/me`, redireciona por role)
- Logout revoga no backend antes de limpar storage

---

## 🚗 Fase 3 — Integração com 13 services do contrato

Para cada service: arquivo HTTP em `src/services/*.service.ts`, hooks React Query em `src/hooks/use*.ts`, e wiring na tela correspondente.

### Cliente — Home (Vehicles + Services)
| Commit | Descrição |
|---|---|
| `203331b` | feat: add vehicles and services API clients |
| `a82d650` | feat: add React Query hooks for vehicles and services |
| `f979668` | feat: wire HomeScreen to vehicles and services APIs |

### Cliente — Locator (Dealerships)
| Commit | Descrição |
|---|---|
| `377ac1d` | feat: add dealerships API client |
| `7425022` | feat: add React Query hooks for dealerships |
| `83ef38c` | feat: wire LocatorScreen to dealerships API |

### Cliente — Scheduling (Appointments)
| Commit | Descrição |
|---|---|
| `9e21328` | feat: add appointments API client |
| `df4e127` | feat: add React Query hooks for appointments |
| `f69f4bb` | feat: wire SchedulingScreen to appointments API |

### Cliente — Points (Loyalty)
| Commit | Descrição |
|---|---|
| `776f8f8` | feat: add loyalty API client |
| `61111bd` | feat: add React Query hooks for loyalty |
| `e2141b9` | feat: wire PointsScreen to loyalty API |

### Cliente — Chat (Ford AI / Claude no back)
| Commit | Descrição |
|---|---|
| `c0fa742` | feat: add chat API client |
| `ced126e` | feat: add React Query hooks for chat |
| `ae6f99a` | feat: wire ChatScreen to chat API |

### Analista — Dashboard (Analytics)
| Commit | Descrição |
|---|---|
| `6f85f3e` | feat: add analytics API client |
| `55a5bb7` | feat: add React Query hooks for analytics |
| `e7cc3c2` | feat: wire analyst DashboardScreen to analytics API |

### Analista — Leads
| Commit | Descrição |
|---|---|
| `4ebfa30` | feat: add leads API client |
| `093321f` | feat: add React Query hooks for leads |
| `5108a39` | feat: wire analyst LeadsScreen to leads API |

### Analista — Segmentação
| Commit | Descrição |
|---|---|
| `522612b` | feat: add segments API client |
| `a2da316` | feat: add React Query hooks for segments |
| `40a40e1` | feat: wire analyst SegmentationScreen to segments API |

### Analista — Visão 360 do cliente
| Commit | Descrição |
|---|---|
| `b3e7c18` | feat: add customers 360 API client |
| `b7f6397` | feat: add React Query hooks for customers |

### NPS pós-serviço
| Commit | Descrição |
|---|---|
| `e557623` | feat: add NPS API client |
| `41cec9f` | feat: add React Query hooks for NPS |

### Devices (push token)
| Commit | Descrição |
|---|---|
| `30c8442` | feat: add devices API client |
| `90c8111` | feat: add React Query hooks for devices |

### Profile + /me
| Commit | Descrição |
|---|---|
| `6e77384` | feat: add useMe React Query hook |
| `ffd9b9b` | feat: migrate client ProfileScreen from mock to /me API |
| `e5e7380` | docs: add BACKEND.md integration guide |
| `b2584f0` | fix: drop accidental logout binding from HomeScreen bell icon |
| `0404ba5` | chore: regenerate package-lock.json |

**Entrega:** 13 services integrados, todas as 10 telas consumindo dados reais do back via React Query.

---

## 📲 Fase 4 — Features avançadas

| Commit | Descrição |
|---|---|
| `26e65f9` | refactor: read user name from useMe() in Home and Dashboard |
| `2e2372b` | feat: register the device's Expo push token after authentication |
| `41e1240` | feat: handle deepLink payloads from push notifications |
| `d7a61b9` | feat: add NPS post-service survey screen and home banner |
| `97979c7` | feat: add Customer360 screen for analysts |
| `c7d3edf` | feat: use real device location for dealer queries |
| `dab2a46` | feat: persist vehicles and services cache for offline home |
| `a6ad403` | refactor: share a StateBox component for loading/error/empty states |

**Entrega:**
- **Push notifications**: registro automático no login, deep links `fordapp://` (cold-start + warm-start)
- **NpsScreen**: modal de avaliação pós-serviço (0-10 + categorias + comentário)
- **Customer360Screen**: visão 360 do cliente acessada pelo lead
- **Geolocalização real** (`expo-location`) com fallback SP
- **Modo offline** (PersistQueryClient + AsyncStorage + allowlist)
- **StateBox compartilhado** para loading/error/empty consistente

---

## 🧹 Fase 5 — Cleanup + qualidade

| Commit | Descrição |
|---|---|
| `ae6dfd2` | chore: drop expo template leftovers and dead Supabase code |
| `f81950c` | docs: refresh PROGRESS and API to reflect the integration state |

**Entrega:**
- Deleção de 1.081 linhas de código morto (template Expo blank, `@react-navigation`, Supabase, mocks)
- TypeScript: 0 erros
- ESLint: 0 warnings (eram 14)
- Expo Doctor: 17/17 checks pass
- Documentação atualizada

---

## ✨ Fase 6 — Polimento final

| Commit | Descrição |
|---|---|
| `7ef0794` | feat: add Appointments screen, odometer update flow and live Profile stats |
| `913fc23` | feat: analyst check-in and complete actions from Customer 360 |
| `72fcbba` | chore: replace Expo template icons with Ford branding |
| `0ea0663` | test: add Jest + RNTL setup and first round of essential tests |
| `064e9c8` | chore: pin jest-expo to the version blessed by Expo SDK 54 |
| `db2dbb2` | docs: add OVERVIEW.md with the full project narrative |

**Entrega:**
- **AppointmentsScreen** (cliente) — filtros por status, cancelamento
- **UpdateOdometerScreen** (modal) — atualiza km do veículo via `PATCH /vehicles/{id}/odometer`
- **ProfileScreen stats reais** — services count, loyalty balance, vehicles count
- **Check-in / Concluir atendimento** no Customer 360 do analista (`PATCH .../check-in` e `/complete`)
- **Ícone do app + splash** gerados da logo Ford, com fundo azul Ford
- **EAS** configurado (`eas.json` com dev/preview/production) + `BUILD.md`
- **Testes**: Jest + RNTL + jest-expo, 4 suites, 20 testes passando
  - `parseDeepLink()` — 10 cases
  - `shouldPersistQuery()` — 5 cases
  - `ApiError` — 2 cases
  - `<StateBox />` — 4 cases

---

## 🎬 Fase 7 — Modo demonstração

| Commit | Descrição |
|---|---|
| `246b4c3` | feat: add demo mode so the app runs without a live Java backend |

**Entrega:**
- Flag `EXPO_PUBLIC_DEMO_MODE=true` no `.env`
- `src/utils/demoMode.ts` com fixtures realistas (cliente João Silva / Ranger 2023; analista Ana Oliveira com KPIs, leads, segmentos, Customer 360)
- LoginScreen mostra painel amarelo com botões "Cliente" / "Analista" quando flag está ativa
- React Query é pré-populado antes das telas montarem → tudo navegável sem backend
- Mutations ainda batem na API real (esperado — demo é só para leitura)

---

## 📈 Métricas finais

| Métrica | Valor |
|---|---|
| Commits totais | ~88 |
| Telas implementadas | 13 (10 principais + NpsScreen + UpdateOdometer + Customer360) |
| Services do contrato | 13 cobertos |
| Hooks React Query | 17 |
| Componentes compartilhados | FordLogo, StateBox |
| Testes | 4 suites, 20 testes |
| TypeScript erros | 0 |
| ESLint warnings | 0 |
| Expo Doctor | 17/17 |
| Linhas de código morto removidas | ~1.081 |

---

## 📚 Onde aprender mais

| Documento | Para que serve |
|---|---|
| [README.md](./README.md) | Visão de produto e roadmap |
| [OVERVIEW.md](./OVERVIEW.md) | Narrativa do projeto (decisões + estrutura) |
| [PROGRESS.md](./PROGRESS.md) | Estado das telas e funcionalidades |
| [API.md](./API.md) | Contrato do backend Java consumido aqui |
| [BACKEND.md](./BACKEND.md) | Guia de integração do back |
| [BUILD.md](./BUILD.md) | Como gerar builds via EAS |
| [CHANGELOG.md](./CHANGELOG.md) | Este documento — registro cronológico |

---

## 🟡 O que ainda depende de ação externa

Tudo do **código** está pronto, testado estaticamente e documentado. O que falta não é código:

- [ ] **Backend Java rodando** — usar `EXPO_PUBLIC_DEMO_MODE=false` no `.env` quando estiver de pé
- [ ] **OpenAPI gerado pelo back** — para regenerar types e validar shapes inferidos
- [ ] **Projeto no expo.dev** — colar `projectId` em `app.json` para push em build standalone
- [ ] **Domínios reais** — trocar `*.ford.example` em `eas.json`
- [ ] **Conta Apple Developer + Google Play** — para `eas submit`
- [ ] **Sentry ou similar** — para error tracking em produção

---

Desenvolvido por **Rafael Gaspar Martins** · Co-Authored-By: Claude Haiku 4.5
