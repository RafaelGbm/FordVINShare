/**
 * Demo fixtures + cache seeding helpers.
 *
 * Activated by EXPO_PUBLIC_DEMO_MODE=true. Lets the app run with no
 * backend by pre-populating React Query with realistic-looking data
 * before the screens mount. Mutations (create appointment, redeem,
 * send chat message, etc.) will still try to hit the API and fail —
 * use the demo to showcase navigation and visual states, not to drive
 * write operations.
 */
import type { QueryClient } from '@tanstack/react-query';

import { Me } from '../services/auth.service';
import { authKeys } from '../hooks/useAuth';
import { vehicleKeys } from '../hooks/useVehicles';
import { serviceKeys } from '../hooks/useServices';
import { dealershipKeys } from '../hooks/useDealerships';
import { appointmentKeys } from '../hooks/useAppointments';
import { loyaltyKeys } from '../hooks/useLoyalty';
import { npsKeys } from '../hooks/useNps';
import { chatKeys } from '../hooks/useChat';
import { analyticsKeys } from '../hooks/useAnalytics';
import { leadKeys } from '../hooks/useLeads';
import { segmentKeys } from '../hooks/useSegments';
import { customerKeys } from '../hooks/useCustomers';

import { Vehicle, Warranty, MaintenanceAlert } from '../services/vehicles.service';
import { ServiceRecord, PaginatedResponse } from '../services/services.service';
import { Dealership } from '../services/dealerships.service';
import {
  AppointmentSummary,
  ServiceTypeOption,
} from '../services/appointments.service';
import {
  LoyaltyBalance,
  LoyaltyTransaction,
  Reward,
} from '../services/loyalty.service';
import { PendingSurvey } from '../services/nps.service';
import { ChatMessage, ChatSession } from '../services/chat.service';
import {
  KpisWithDelta,
  VinShareSeries,
  DealershipVinShare,
} from '../services/analytics.service';
import { Lead } from '../services/leads.service';
import { SegmentDistribution } from '../services/segments.service';
import { Customer360, TimelineEvent } from '../services/customers.service';

/* ─────────────────────────────────────────────
 * Fixtures
 * ───────────────────────────────────────────── */

export const DEMO_CLIENT: Me = {
  userId: 'demo-client-1',
  role: 'CLIENT',
  fullName: 'João Silva',
  email: 'joao.silva@email.com',
  phone: '+5511988887777',
  createdAt: '2022-08-12T10:00:00-03:00',
};

export const DEMO_ANALYST: Me = {
  userId: 'demo-analyst-1',
  role: 'ANALYST',
  fullName: 'Ana Oliveira',
  email: 'ana.oliveira@ford.com.br',
  phone: '+5511999991111',
  createdAt: '2020-02-01T09:00:00-03:00',
};

const DEMO_VEHICLE: Vehicle = {
  id: 'demo-vehicle-1',
  model: 'Ranger',
  version: 'Raptor 3.0 V6',
  year: 2023,
  plate: 'ABC-1D23',
  currentKm: 28450,
  warrantyStatus: 'ACTIVE',
};

const DEMO_WARRANTY: Warranty = {
  vehicleId: DEMO_VEHICLE.id,
  status: 'ACTIVE',
  startDate: '2023-04-10',
  endDate: '2026-04-10',
  daysRemaining: 332,
  freeRevisionAvailable: true,
  nextFreeRevisionAt: '2026-06-15',
};

const DEMO_ALERTS: MaintenanceAlert[] = [
  {
    type: 'OIL_CHANGE',
    title: 'Troca de óleo recomendada',
    kmThreshold: 30000,
    currentKm: 28450,
    kmRemaining: 1550,
  },
];

const DEMO_SERVICES: PaginatedResponse<ServiceRecord> = {
  content: [
    {
      id: 'svc-1',
      vehicleId: DEMO_VEHICLE.id,
      dealership: 'Ford SP Centro',
      serviceType: 'REVIEW',
      performedAt: '2026-02-10T11:00:00-03:00',
      totalAmount: 0,
      summary: 'Revisão dos 20.000 km',
    },
    {
      id: 'svc-2',
      vehicleId: DEMO_VEHICLE.id,
      dealership: 'Ford Tatuapé',
      serviceType: 'OIL_CHANGE',
      performedAt: '2025-11-22T09:30:00-03:00',
      totalAmount: 380,
      summary: 'Troca de óleo + filtros originais',
    },
    {
      id: 'svc-3',
      vehicleId: DEMO_VEHICLE.id,
      dealership: 'Ford SP Centro',
      serviceType: 'REPAIR',
      performedAt: '2025-07-04T14:00:00-03:00',
      totalAmount: 1240,
      summary: 'Alinhamento + balanceamento',
    },
  ],
  number: 0,
  size: 20,
  totalElements: 12,
  totalPages: 1,
};

const DEMO_DEALERSHIPS: Dealership[] = [
  {
    id: 'dlr-1',
    name: 'Ford SP Centro',
    address: 'Av. Paulista, 1500',
    city: 'São Paulo',
    state: 'SP',
    phone: '+551133334444',
    lat: -23.561,
    lng: -46.656,
    distanceKm: 1.8,
    openingHours: 'Seg-Sex 08:00-18:00; Sáb 08:00-12:00',
    services: ['REVIEW', 'OIL_CHANGE', 'WARRANTY', 'REPAIR'],
  },
  {
    id: 'dlr-2',
    name: 'Ford Tatuapé',
    address: 'R. Tuiuti, 850',
    city: 'São Paulo',
    state: 'SP',
    phone: '+551122223333',
    lat: -23.541,
    lng: -46.578,
    distanceKm: 5.7,
    openingHours: 'Seg-Sex 08:00-18:00',
    services: ['REVIEW', 'OIL_CHANGE'],
  },
  {
    id: 'dlr-3',
    name: 'Ford Morumbi',
    address: 'Av. Giovanni Gronchi, 220',
    city: 'São Paulo',
    state: 'SP',
    phone: '+551144445555',
    lat: -23.624,
    lng: -46.715,
    distanceKm: 8.1,
    openingHours: 'Seg-Sáb 08:00-20:00 (24h emergências)',
    services: ['REVIEW', 'WARRANTY', 'REPAIR'],
  },
];

const DEMO_SERVICE_TYPES: ServiceTypeOption[] = [
  { id: 'REVIEW', label: 'Revisão programada', freeWithWarranty: true },
  { id: 'OIL_CHANGE', label: 'Troca de óleo', freeWithWarranty: false },
  { id: 'WARRANTY', label: 'Atendimento em garantia', freeWithWarranty: true },
  { id: 'REPAIR', label: 'Reparo', freeWithWarranty: false },
];

const DEMO_APPOINTMENTS: AppointmentSummary[] = [
  {
    id: 'app-1',
    status: 'SCHEDULED',
    vehicle: { id: DEMO_VEHICLE.id, model: DEMO_VEHICLE.model },
    dealership: { id: 'dlr-1', name: 'Ford SP Centro' },
    serviceType: 'REVIEW',
    scheduledAt: '2026-05-25T10:00:00-03:00',
    createdAt: '2026-05-14T09:30:00-03:00',
  },
  {
    id: 'app-2',
    status: 'COMPLETED',
    vehicle: { id: DEMO_VEHICLE.id, model: DEMO_VEHICLE.model },
    dealership: { id: 'dlr-2', name: 'Ford Tatuapé' },
    serviceType: 'OIL_CHANGE',
    scheduledAt: '2025-11-22T09:30:00-03:00',
    createdAt: '2025-11-15T18:00:00-03:00',
  },
  {
    id: 'app-3',
    status: 'CANCELED',
    vehicle: { id: DEMO_VEHICLE.id, model: DEMO_VEHICLE.model },
    dealership: { id: 'dlr-1', name: 'Ford SP Centro' },
    serviceType: 'REPAIR',
    scheduledAt: '2025-09-02T14:00:00-03:00',
    createdAt: '2025-08-25T11:20:00-03:00',
  },
];

const DEMO_LOYALTY_BALANCE: LoyaltyBalance = {
  balance: 1850,
  expiringIn30Days: 200,
};

const DEMO_LOYALTY_TX: PaginatedResponse<LoyaltyTransaction> = {
  content: [
    {
      id: 'tx-1',
      type: 'EARN',
      label: 'Revisão Preventiva',
      points: 350,
      createdAt: '2026-02-10T11:00:00-03:00',
    },
    {
      id: 'tx-2',
      type: 'EARN',
      label: 'Indicação — Carlos M.',
      points: 200,
      createdAt: '2026-02-02T15:00:00-03:00',
    },
    {
      id: 'tx-3',
      type: 'SPEND',
      label: 'Resgate: 10% off peças',
      points: -400,
      createdAt: '2026-01-20T10:30:00-03:00',
    },
    {
      id: 'tx-4',
      type: 'EARN',
      label: 'Troca de óleo',
      points: 150,
      createdAt: '2025-11-22T09:30:00-03:00',
    },
  ],
  number: 0,
  size: 10,
  totalElements: 4,
  totalPages: 1,
};

const DEMO_REWARDS: Reward[] = [
  {
    id: 'rwd-1',
    name: 'Revisão Premium',
    description: 'Inclui troca de óleo + filtros',
    pointsCost: 2000,
    category: 'SERVICE',
  },
  {
    id: 'rwd-2',
    name: '20% off Acessórios',
    description: 'Cupom para a loja oficial',
    pointsCost: 800,
    category: 'PARTS',
  },
  {
    id: 'rwd-3',
    name: 'Lavagem Detalhada',
    description: 'Externa + interna + cera',
    pointsCost: 500,
    category: 'SERVICE',
  },
  {
    id: 'rwd-4',
    name: 'Boné Ford Mustang',
    description: 'Edição limitada',
    pointsCost: 1200,
    category: 'LIFESTYLE',
  },
];

const DEMO_PENDING_SURVEYS: PendingSurvey[] = [
  {
    serviceId: 'svc-1',
    serviceType: 'REVIEW',
    dealership: 'Ford SP Centro',
    performedAt: '2026-02-10T11:00:00-03:00',
  },
];

const DEMO_CHAT_SESSION: ChatSession = {
  sessionId: 'demo-session',
  startedAt: '2026-05-19T10:30:00-03:00',
};

const DEMO_CHAT_HISTORY: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'assistant',
    content:
      'Olá, João! Sou a Ford AI, sua assistente virtual. Posso te ajudar com agendamentos, garantia, pontos, dúvidas técnicas da sua Ranger 2023 e muito mais. 🚗',
    createdAt: '2026-05-19T10:30:00-03:00',
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: 'Como posso te ajudar hoje?',
    createdAt: '2026-05-19T10:30:00-03:00',
    suggestedActions: [
      { type: 'OPEN_SCHEDULING', label: 'Agendar revisão' },
      { type: 'OPEN_POINTS', label: 'Ver meus pontos' },
    ],
  },
];

const DEMO_KPIS: KpisWithDelta = {
  vehiclesUnderWarranty: 1280,
  vinSharePercent: 62.4,
  estimatedRevenue: 845200,
  leadsAtRisk: 84,
  vehiclesUnderWarrantyDelta: 12,
  vinSharePercentDelta: 4.2,
  estimatedRevenueDelta: -2.1,
  leadsAtRiskDelta: -3,
};

const DEMO_SERIES: VinShareSeries = {
  groupBy: 'day',
  from: '2026-05-13',
  to: '2026-05-19',
  averagePercent: 63,
  peakPercent: 85,
  targetPercent: 70,
  points: [
    { label: 'Seg', periodStart: '2026-05-13', vinSharePercent: 55 },
    { label: 'Ter', periodStart: '2026-05-14', vinSharePercent: 62 },
    { label: 'Qua', periodStart: '2026-05-15', vinSharePercent: 48 },
    { label: 'Qui', periodStart: '2026-05-16', vinSharePercent: 72 },
    { label: 'Sex', periodStart: '2026-05-17', vinSharePercent: 85 },
    { label: 'Sáb', periodStart: '2026-05-18', vinSharePercent: 78 },
    { label: 'Dom', periodStart: '2026-05-19', vinSharePercent: 42 },
  ],
};

const DEMO_DEALER_RANK: DealershipVinShare[] = [
  { dealershipId: 'dlr-1', name: 'Ford SP Centro', vehiclesServed: 74, vehiclesTotal: 100, sharePercent: 74, estimatedRevenue: 48000, trend: 'UP' },
  { dealershipId: 'dlr-2', name: 'Ford Tatuapé', vehiclesServed: 68, vehiclesTotal: 100, sharePercent: 68, estimatedRevenue: 38000, trend: 'UP' },
  { dealershipId: 'dlr-3', name: 'Ford Morumbi', vehiclesServed: 62, vehiclesTotal: 100, sharePercent: 62, estimatedRevenue: 32000, trend: 'DOWN' },
  { dealershipId: 'dlr-4', name: 'Ford Pinheiros', vehiclesServed: 54, vehiclesTotal: 100, sharePercent: 54, estimatedRevenue: 24000, trend: 'UP' },
];

const DEMO_LEADS: PaginatedResponse<Lead> = {
  content: [
    {
      id: 'lead-1',
      customerId: 'cust-1',
      customerName: 'Carlos Mendes',
      cpfMasked: '***.***.111-**',
      vehicleModel: 'Ranger',
      vehiclePlate: 'EFG-7H89',
      lastVisitAt: '2024-12-04',
      status: 'PERDIDO',
      segment: 'ABANDONO',
      riskScore: 87,
      reason: 'Cliente fora da rede há mais de 12 meses',
      suggestedAction: 'Oferecer revisão com 20% de desconto',
      daysSinceLastVisit: 420,
      warrantyStatus: 'EXPIRED',
      lastNpsScore: 5,
      recommendedAction: 'Oferecer revisão com 20% de desconto',
      updatedAt: '2026-05-18T10:00:00-03:00',
    },
    {
      id: 'lead-2',
      customerId: 'cust-2',
      customerName: 'Patrícia Costa',
      cpfMasked: '***.***.222-**',
      vehicleModel: 'EcoSport',
      vehiclePlate: 'XYZ-4M21',
      lastVisitAt: '2025-08-26',
      status: 'EM_RISCO',
      segment: 'ESQUECIDO',
      riskScore: 72,
      reason: 'Cliente atrasou janela de revisão',
      suggestedAction: 'Convidar para revisão pré-vencimento',
      daysSinceLastVisit: 270,
      warrantyStatus: 'EXPIRING_SOON',
      lastNpsScore: 6,
      recommendedAction: 'Convidar para revisão pré-vencimento',
      updatedAt: '2026-05-18T10:00:00-03:00',
    },
    {
      id: 'lead-3',
      customerId: 'cust-3',
      customerName: 'Mariana Alves',
      cpfMasked: '***.***.333-**',
      vehicleModel: 'Bronco',
      vehiclePlate: 'NEW-2024',
      lastVisitAt: '2026-04-23',
      status: 'NOVO',
      segment: 'FIEL',
      riskScore: 15,
      reason: 'Cliente novo na rede',
      suggestedAction: 'Boas-vindas e cadastro no programa',
      daysSinceLastVisit: 30,
      warrantyStatus: 'ACTIVE',
      lastNpsScore: 9,
      recommendedAction: 'Boas-vindas e cadastro no programa',
      updatedAt: '2026-05-18T10:00:00-03:00',
    },
    {
      id: 'lead-4',
      customerId: 'cust-4',
      customerName: 'Felipe Santos',
      cpfMasked: '***.***.444-**',
      vehicleModel: 'Mustang',
      vehiclePlate: 'GT5-0023',
      lastVisitAt: '2026-03-24',
      status: 'RECUPERADO',
      segment: 'FIEL',
      riskScore: 8,
      reason: 'Cliente recuperado por campanha',
      suggestedAction: 'Acompanhar próxima revisão',
      daysSinceLastVisit: 60,
      warrantyStatus: 'ACTIVE',
      lastNpsScore: 10,
      recommendedAction: 'Acompanhar próxima revisão',
      updatedAt: '2026-05-18T10:00:00-03:00',
    },
  ],
  number: 0,
  size: 200,
  totalElements: 4,
  totalPages: 1,
};

const DEMO_SEGMENT_DISTRIBUTION: SegmentDistribution = [
  { segment: 'FIEL', count: 420, percent: 32.8, avgTicket: 1200, avgNps: 9.1 },
  { segment: 'ECONOMICO', count: 280, percent: 21.9, avgTicket: 580, avgNps: 7.4 },
  { segment: 'ESQUECIDO', count: 308, percent: 24.1, avgTicket: 720, avgNps: 6.2 },
  { segment: 'ABANDONO', count: 270, percent: 21.1, avgTicket: 320, avgNps: 4.8 },
];

const DEMO_CUSTOMER_360: Customer360 = {
  customer: {
    id: 'cust-1',
    name: 'Carlos Mendes',
    cpfMasked: '***.***.111-**',
    email: 'carlos.mendes@email.com',
    phone: '+5511977776666',
    createdAt: '2019-05-12T00:00:00-03:00',
  },
  vehicles: [
    {
      id: 'veh-c1',
      model: 'Ranger',
      version: 'XL 2.2',
      year: 2019,
      plate: 'EFG-7H89',
      currentKm: 92000,
      warrantyStatus: 'EXPIRED',
    },
  ],
  segment: 'ABANDONO',
  riskScore: 87,
  lifetime: {
    totalSpent: 14200,
    totalServices: 8,
    avgTicket: 1775,
    avgNps: 5.3,
    firstServiceAt: '2019-06-01T10:00:00-03:00',
    lastServiceAt: '2024-12-04T14:00:00-03:00',
  },
  recentServices: [
    {
      id: 's-c1',
      vehicleId: 'veh-c1',
      dealership: 'Ford SP Centro',
      serviceType: 'REPAIR',
      performedAt: '2024-12-04T14:00:00-03:00',
      totalAmount: 2300,
      summary: 'Reparo no sistema de freios',
    },
  ],
  activeAppointments: [],
};

const DEMO_TIMELINE: TimelineEvent[] = [
  {
    id: 'tl-1',
    type: 'WARRANTY_EVENT',
    occurredAt: '2024-05-01T00:00:00-03:00',
    title: 'Garantia vencida',
    description: 'Garantia de fábrica expirou — elegível para Ford Plus',
  },
  {
    id: 'tl-2',
    type: 'SERVICE',
    occurredAt: '2024-12-04T14:00:00-03:00',
    title: 'Reparo nos freios',
    description: 'R$ 2.300 · Ford SP Centro',
  },
  {
    id: 'tl-3',
    type: 'NPS',
    occurredAt: '2024-12-08T10:00:00-03:00',
    title: 'NPS coletado',
    description: 'Score 5 — citou tempo de espera',
  },
];

/* ─────────────────────────────────────────────
 * Seed
 * ───────────────────────────────────────────── */

export type DemoRole = 'CLIENT' | 'ANALYST';

export function getDemoUser(role: DemoRole): Me {
  return role === 'ANALYST' ? DEMO_ANALYST : DEMO_CLIENT;
}

/**
 * Pre-populates the React Query cache with realistic fake data so the
 * screens can render without hitting the backend.
 */
export function seedDemoCache(qc: QueryClient, role: DemoRole) {
  qc.setQueryData(authKeys.me(), getDemoUser(role));

  if (role === 'CLIENT') {
    qc.setQueryData(vehicleKeys.list(), [DEMO_VEHICLE]);
    qc.setQueryData(vehicleKeys.warranty(DEMO_VEHICLE.id), DEMO_WARRANTY);
    qc.setQueryData(vehicleKeys.alerts(DEMO_VEHICLE.id), DEMO_ALERTS);

    qc.setQueryData(
      serviceKeys.mine({ vehicleId: DEMO_VEHICLE.id, size: 3 }),
      DEMO_SERVICES
    );
    qc.setQueryData(serviceKeys.mine({ size: 1 }), {
      ...DEMO_SERVICES,
      content: DEMO_SERVICES.content.slice(0, 1),
      size: 1,
    });

    qc.setQueryData(
      dealershipKeys.list({ lat: -23.55, lng: -46.63, radiusKm: 20, service: undefined }),
      DEMO_DEALERSHIPS
    );

    qc.setQueryData(appointmentKeys.serviceTypes(), DEMO_SERVICE_TYPES);
    qc.setQueryData(appointmentKeys.mine(), DEMO_APPOINTMENTS);

    qc.setQueryData(loyaltyKeys.balance(), DEMO_LOYALTY_BALANCE);
    qc.setQueryData(loyaltyKeys.transactions(0, 10), DEMO_LOYALTY_TX);
    qc.setQueryData(loyaltyKeys.rewards(), DEMO_REWARDS);

    qc.setQueryData(npsKeys.pending(), DEMO_PENDING_SURVEYS);

    qc.setQueryData(chatKeys.history(DEMO_CHAT_SESSION.sessionId), DEMO_CHAT_HISTORY);
  } else {
    qc.setQueryData(analyticsKeys.kpis('7d'), DEMO_KPIS);
    qc.setQueryData(analyticsKeys.vinShareSeries('day'), DEMO_SERIES);
    qc.setQueryData(analyticsKeys.byDealership('30d'), DEMO_DEALER_RANK);

    qc.setQueryData(leadKeys.list({ size: 200 }), DEMO_LEADS);

    qc.setQueryData(segmentKeys.distribution(), DEMO_SEGMENT_DISTRIBUTION);

    qc.setQueryData(customerKeys.v360('cust-1'), DEMO_CUSTOMER_360);
    qc.setQueryData(customerKeys.timeline('cust-1', {}), DEMO_TIMELINE);
  }
}

export const DEMO_CHAT_SESSION_ID = DEMO_CHAT_SESSION.sessionId;
