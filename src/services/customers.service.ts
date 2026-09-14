import { api } from './api';
import { LeadSegment } from './leads.service';
import { WarrantyStatus } from './vehicles.service';

export interface CustomerProfile {
  id: string;
  name: string;
  cpfMasked: string;
  email: string | null;
  phone: string;
}

/**
 * Vehicle summary as returned by /customers/{id}/360 — narrower than the
 * full `Vehicle` type (no `plate`/`version`), and the backend only ever
 * returns one, not the array the type in `vehicles.service.ts` implies.
 */
export interface Customer360Vehicle {
  id: string;
  model: string;
  year: number;
  currentKm: number;
  warrantyStatus: WarrantyStatus;
}

export interface CustomerLifetime {
  totalSpent: number;
  totalServices: number;
  avgTicket: number;
  avgNps: number;
}

export interface Customer360 {
  customer: CustomerProfile;
  vehicle: Customer360Vehicle;
  segment: LeadSegment;
  riskScore: number;
  lifetime: CustomerLifetime;
}

/**
 * Shape the backend actually sends: segment is an object (name + riskScore)
 * rather than a bare enum, and lifetime stats come under a different key
 * with fewer fields — no `avgTicket` (derived below) and no first/last
 * service dates at all.
 */
interface RawCustomer360 {
  customer: CustomerProfile;
  vehicle: Customer360Vehicle;
  segment: { name: LeadSegment; riskScore: number };
  lifetimeStats: { servicesCount: number; totalSpent: number; averageNps: number };
}

function normalizeCustomer360(raw: RawCustomer360): Customer360 {
  const { servicesCount, totalSpent, averageNps } = raw.lifetimeStats;
  return {
    customer: raw.customer,
    vehicle: raw.vehicle,
    segment: raw.segment.name,
    riskScore: raw.segment.riskScore,
    lifetime: {
      totalSpent,
      totalServices: servicesCount,
      avgTicket: servicesCount > 0 ? totalSpent / servicesCount : 0,
      avgNps: averageNps,
    },
  };
}

export type TimelineEventType =
  | 'SERVICE'
  | 'APPOINTMENT'
  | 'NPS'
  | 'REDEEM'
  | 'LEAD_ACTION'
  | 'WARRANTY_EVENT';

export interface TimelineEvent {
  /** Synthesized client-side — the backend does not send an id for these. */
  id: string;
  type: TimelineEventType;
  occurredAt: string;
  title: string;
  description: string;
}

/** Shape the backend actually sends: the date field is `at`, and there's no id. */
interface RawTimelineEvent {
  at: string;
  type: TimelineEventType;
  title: string;
  description: string;
}

function normalizeTimelineEvent(raw: RawTimelineEvent, index: number): TimelineEvent {
  return {
    id: `${raw.type}-${raw.at}-${index}`,
    type: raw.type,
    occurredAt: raw.at,
    title: raw.title,
    description: raw.description,
  };
}

export interface ListTimelineParams {
  from?: string;
  to?: string;
}

export const customersService = {
  async get360(customerId: string): Promise<Customer360> {
    const { data } = await api.get<RawCustomer360>(`/customers/${customerId}/360`);
    return normalizeCustomer360(data);
  },

  async getTimeline(
    customerId: string,
    params: ListTimelineParams = {}
  ): Promise<TimelineEvent[]> {
    const { data } = await api.get<RawTimelineEvent[]>(`/customers/${customerId}/timeline`, {
      params,
    });
    return data.map(normalizeTimelineEvent);
  },
};
