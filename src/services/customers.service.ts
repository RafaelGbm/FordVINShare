import { api } from './api';
import { AppointmentSummary } from './appointments.service';
import { LeadSegment } from './leads.service';
import { ServiceRecord } from './services.service';
import { Vehicle } from './vehicles.service';

export interface CustomerProfile {
  id: string;
  name: string;
  cpfMasked: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface CustomerLifetime {
  totalSpent: number;
  totalServices: number;
  avgTicket: number;
  avgNps: number;
  firstServiceAt: string;
  lastServiceAt: string;
}

export interface Customer360 {
  customer: CustomerProfile;
  vehicles: Vehicle[];
  segment: LeadSegment;
  riskScore: number;
  lifetime: CustomerLifetime;
  recentServices: ServiceRecord[];
  activeAppointments: AppointmentSummary[];
}

export type TimelineEventType =
  | 'SERVICE'
  | 'APPOINTMENT'
  | 'NPS'
  | 'REDEEM'
  | 'LEAD_ACTION'
  | 'WARRANTY_EVENT';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  occurredAt: string;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface ListTimelineParams {
  from?: string;
  to?: string;
}

export const customersService = {
  async getById(customerId: string): Promise<CustomerProfile> {
    const { data } = await api.get<CustomerProfile>(`/customers/${customerId}`);
    return data;
  },

  async get360(customerId: string): Promise<Customer360> {
    const { data } = await api.get<Customer360>(`/customers/${customerId}/360`);
    return data;
  },

  async getTimeline(
    customerId: string,
    params: ListTimelineParams = {}
  ): Promise<TimelineEvent[]> {
    const { data } = await api.get<TimelineEvent[]>(
      `/customers/${customerId}/timeline`,
      { params }
    );
    return data;
  },
};
