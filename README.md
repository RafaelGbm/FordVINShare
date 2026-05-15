# Ford VIN Share

App mobile e web para Ford que demonstra um sistema integrado de garantia, agendamento de serviços e análise de dados de concessionárias. O projeto é split em dois fluxos principais: **Cliente** e **Analista**.

## 📋 Estrutura do Projeto

```
FordVINShare/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.tsx          # Tela de login com toggle Cliente/Analista
│   │   ├── client/                   # Fluxo do cliente
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── SchedulingScreen.tsx
│   │   │   ├── LocatorScreen.tsx
│   │   │   ├── PointsScreen.tsx
│   │   │   ├── ChatScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   └── analyst/                  # Fluxo do analista
│   │       ├── DashboardScreen.tsx
│   │       ├── LeadsScreen.tsx
│   │       └── SegmentationScreen.tsx
│   ├── navigation/
│   │   └── types.ts                 # Tipos de navegação
│   ├── services/
│   │   └── supabase.ts              # Queries Supabase
│   ├── types/
│   │   └── index.ts                 # Tipos TypeScript
│   ├── utils/
│   │   ├── store.ts                 # Zustand store + mock data
│   │   └── helpers.ts               # Funções utilitárias
│   ├── constants/
│   │   └── index.ts                 # Cores, constantes
│   └── styles/
├── App.tsx                           # Arquivo raiz com navegação
├── app.json                          # Configuração Expo
├── .env.example                      # Variáveis de ambiente
└── package.json
```

## 🚀 Setup Inicial

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

Adicione suas chaves:
- `EXPO_PUBLIC_SUPABASE_URL` - URL do seu projeto Supabase
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Chave anônima do Supabase
- `EXPO_PUBLIC_CLAUDE_API_KEY` - Chave da API Claude (para chatbot)

### 3. Rodar o app

```bash
npm start
```

Então escolha a plataforma:
- **i** - iOS
- **a** - Android
- **w** - Web

## 📱 Fluxos do App

### Cliente
- **Home**: Status da garantia, alertas de revisão, últimos serviços
- **Agendar**: Selecionar tipo de serviço, concessionária e data
- **Localizador**: Mapa com concessionárias próximas + filtros
- **Pontos**: Extrato de pontos acumulados e tabela de resgate
- **Chat (IA)**: Assistente inteligente com Claude API
- **Perfil**: Dados do cliente e preferências

### Analista
- **Dashboard**: KPIs, gráficos VIN Share, top concessionárias
- **Leads**: Lista de clientes segmentada por urgência ("Em Risco", "Perdido", "Novo")
- **Segmentação**: Análise de distribuição de clientes por segmento
- **Detalhes do Cliente**: Visão 360 com histórico completo

## 🎨 Design System

**Cores Ford:**
- Primária: `#003087` (Azul Ford)
- Secundária: `#1a73e8`
- Sucesso: `#34a853`
- Alerta: `#fbbc04`
- Erro: `#ea4335`

## 🔐 Autenticação

Atualmente usa **mock data** para demonstração:
- Cliente 1: João Silva (Fiesta 2022 - Garantia Ativa)
- Cliente 2: Maria Santos (EcoSport 2021 - Garantia Vencida)
- Analista: Ana Oliveira (Concessionária SP)

No fluxo de login, escolha um perfil e o app simula autenticação.

## 💾 Estado da Aplicação

Usa **Zustand** para gerenciar estado global:
- Dados do usuário autenticado
- Role (cliente/analista)
- Veículos do cliente
- Loading states

## 📊 IA Preditiva

A segmentação de clientes usa um algoritmo de score baseado em regras:

```
Score = 
  +30 se última visita > 12 meses
  +20 se garantia vencendo < 60 dias
  +25 se NPS < 7
  +15 se km próximo de revisão
  -20 se 3+ serviços último ano
  -10 se NPS >= 9

Score > 80 → "Perdido"
Score > 60 → "Em Risco"
Score < 20 → "Fiel"
```

## 🗄️ Supabase

O app espera as seguintes tabelas no Supabase:

- `users` - Dados dos clientes e analistas
- `vehicles` - Veículos registrados
- `services` - Histórico de serviços
- `dealers` - Concessionárias parceiras
- `nps` - Avaliações NPS pós-serviço
- `points` - Saldo de pontos por cliente
- `leads` - Classificação de leads e risco

Veja `.env.example` para configurar a conexão.

## 🤖 Claude API

O chat de suporte integra a Claude API para respostas inteligentes:
- Contexto do cliente injetado (modelo, garantia, etc.)
- Respostas personalizadas sobre serviços, agendamento, peças
- Recomendações baseadas em histórico

## 📦 Dependências Principais

- **expo** - Framework React Native
- **@react-navigation** - Navegação com tab + stack
- **@supabase/supabase-js** - Backend as a Service
- **zustand** - State management
- **react-native-reanimated** - Animações
- **expo-notifications** - Notificações push
- **expo-location** - Geolocalização

## 🚧 Roadmap

- [x] Estrutura base com Expo + TypeScript
- [x] Sistema de navegação (cliente + analista)
- [x] Login com toggle para demos
- [x] Home screen com status de garantia
- [x] Dashboard do analista com KPIs
- [ ] Integração real com Supabase
- [ ] Dataset fake com 500 clientes
- [ ] Mapa com concessionárias
- [ ] Chat IA com Claude API
- [ ] Notificações push
- [ ] Modo offline com AsyncStorage
- [ ] Animações com Reanimated

## 👥 Personas

### Cliente
Usuário que possui um veículo Ford e quer:
- Acompanhar sua garantia
- Agendar revisões
- Encontrar concessionárias próximas
- Acumular pontos de fidelidade
- Obter suporte via IA

### Analista / Concessionária
Usuário que gerencia uma concessionária Ford e quer:
- Ver métricas de VIN Share
- Identificar leads para resgate
- Acompanhar evolução mensal
- Segmentar clientes por risco
- Tomar ações proativas

## 📞 Contato & Contribuição

Desenvolvido por Rafael Gaspar Martins
- Email: rafaelgasparmartins@icloud.com
- GitHub: @RafaelGbm

---

**Status:** Conceito em desenvolvimento | **Versão:** 0.1.0
