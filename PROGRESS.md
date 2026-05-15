# 📊 Ford VIN Share — Progresso do Projeto

> Snapshot: **2026-05-14**
> Status: Em desenvolvimento — foco em design Ford-inspired

---

## ✅ Concluído

### 🏗️ Arquitetura
- [x] Estrutura base com Expo + TypeScript
- [x] Migração de `@react-navigation` para **expo-router** (file-based routing)
- [x] Estrutura `app/` com route groups `(client)` e `(analyst)`
- [x] Auth flow com redirect via `router.replace()`
- [x] Componente `FordLogo` reusável usando PNG real

### 🎨 Telas do Cliente
- [x] **LoginScreen** — Hero azul Ford + logo PNG + toggle de role + cards de perfil demo + CTA principal + "Escanear VIN"
- [x] **HomeScreen** — Hero greeting + vehicle card + warranty Ford Plus (barra de progresso) + quick actions 2x2 + timeline vertical de serviços + promo banner
- [x] **SchedulingScreen** — Stepper 3 passos (Serviço → Local → Data) + resumo final + CTA footer fixo
- [x] **LocatorScreen** — Search bar + mock de mapa (grid + pins) + filtros + cards de concessionárias com Rota/Ligar
- [x] **PointsScreen** — Card de pontos translúcido + tier Ford Gold + recompensas em carousel + extrato

---

## ⏳ Pendente

### 🎨 Telas do Cliente
- [ ] **ChatScreen** — Assistente IA (Claude API)
- [ ] **ProfileScreen** — Dados do cliente + preferências

### 📊 Telas do Analista
- [ ] **DashboardScreen** — Aprimorar (KPIs, gráficos VIN Share, top concessionárias)
- [ ] **LeadsScreen** — Lista segmentada por urgência (Em Risco / Perdido / Novo)
- [ ] **SegmentationScreen** — Análise de distribuição de clientes por segmento

### 🔌 Integração (depois do design)
- [ ] Consumo de **API Java** (backend definido pelo cliente — NÃO usar Supabase nem mock)
- [ ] Autenticação real
- [ ] Animações com Reanimated
- [ ] Notificações push
- [ ] Modo offline com AsyncStorage

---

## 🎨 Design System Ford-Inspired

| Elemento | Padrão |
|----------|--------|
| Cor primária | `#003087` (Azul Ford) |
| Background | `#f5f5f7` |
| Cards | `borderRadius: 14-20`, sombra sutil (`opacity: 0.04-0.06`) |
| Hero | Azul Ford + blob decorativo + scroll content com `borderTopRadius: 28` |
| Tipografia | Sans-serif bold, hierarquia forte |
| Status badges | Dot colorido + texto (verde ativo, laranja warning) |
| CTAs | Azul Ford sólido + sombra colorida + ícone seta |

---

## 📂 Estrutura de Pastas

```
app/
├── _layout.tsx              # Root Stack (expo-router)
├── index.tsx                # Login (redirect se autenticado)
├── (client)/
│   ├── _layout.tsx          # Tabs cliente
│   ├── home.tsx, scheduling.tsx, locator.tsx, points.tsx, chat.tsx
└── (analyst)/
    ├── _layout.tsx          # Tabs analista
    └── dashboard.tsx, leads.tsx, segmentation.tsx

src/
├── components/
│   └── FordLogo.tsx         # Logo Ford reusável
├── screens/
│   ├── LoginScreen.tsx
│   ├── client/              # HomeScreen, SchedulingScreen, etc.
│   └── analyst/             # DashboardScreen, LeadsScreen, etc.
├── utils/store.ts           # Zustand + mock data (temporário)
└── constants/index.ts       # COLORS, etc.

assets/
└── images/
    └── Logo-ford-vector-transparent-PNG-removebg-preview.png
```

---

## 📋 Histórico de Commits Recentes

```
d7e638f  refactor: drop @react-navigation prop types from screens
dbd0373  feat: build PointsScreen with loyalty card and rewards carousel
dede5aa  feat: build LocatorScreen with stylized map and dealer cards
18fe842  feat: build SchedulingScreen with 3-step booking flow
8412522  feat: enhance HomeScreen with vehicle card, warranty bar and timeline
444afec  feat: redesign LoginScreen with Ford-inspired hero and demo profiles
52994b2  feat: add FordLogo component backed by Ford PNG asset
091b970  chore: install react-native-svg and align expo dependency versions
6ee01ce  chore: migrate navigation to expo-router
```
