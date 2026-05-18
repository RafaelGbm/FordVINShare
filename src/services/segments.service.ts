import { api } from './api';
import { LeadSegment } from './leads.service';
import { PaginatedResponse } from './services.service';

export interface SegmentBucket {
  segment: LeadSegment;
  count: number;
  percent: number;
  avgTicket: number;
  avgNps: number;
}

export interface SegmentDistribution {
  totalCustomers: number;
  buckets: SegmentBucket[];
  computedAt: string;
}

export interface SegmentCustomer {
  customerId: string;
  name: string;
  cpfMasked: string;
  segment: LeadSegment;
  riskScore: number;
  lastVisitAt: string | null;
  estimatedLtv: number;
}

export interface CustomerSegmentInfo {
  customerId: string;
  segment: LeadSegment;
  riskScore: number;
  reasons: string[];
  computedAt: string;
}

export const segmentsService = {
  async getDistribution(): Promise<SegmentDistribution> {
    const { data } = await api.get<SegmentDistribution>('/segments/distribution');
    return data;
  },

  async listCustomers(
    segment: LeadSegment,
    params: { page?: number; size?: number } = {}
  ): Promise<PaginatedResponse<SegmentCustomer>> {
    const { data } = await api.get<PaginatedResponse<SegmentCustomer>>(
      `/segments/${segment}/customers`,
      { params }
    );
    return data;
  },

  async getCustomerSegment(customerId: string): Promise<CustomerSegmentInfo> {
    const { data } = await api.get<CustomerSegmentInfo>(
      `/customers/${customerId}/segment`
    );
    return data;
  },
};
