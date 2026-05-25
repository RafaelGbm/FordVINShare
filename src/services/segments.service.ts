import { api } from './api';
import { LeadSegment } from './leads.service';
import { PaginatedResponse } from './services.service';

export interface SegmentBucket {
  segment: LeadSegment;
  count: number;
  percent: number;
  // Backend ships these in the future envelope deploy; absent in the current flat array.
  avgTicket?: number;
  avgNps?: number;
}

export interface SegmentDistribution {
  totalCustomers: number;
  buckets: SegmentBucket[];
  computedAt?: string;
}

export interface SegmentCustomer {
  customerId: string;
  segment: LeadSegment;
  riskScore: number;
  topFeatures: string[] | null;
  modelVersion: string;
  predictedAt: string;
  // Backend doesn't send these yet — kept optional so the future "drill-down" UI compiles.
  name?: string;
  cpfMasked?: string;
  lastVisitAt?: string | null;
  estimatedLtv?: number;
}

export interface CustomerSegmentInfo {
  customerId: string;
  segment: LeadSegment;
  riskScore: number;
  reasons: string[];
  computedAt: string;
}

export const segmentsService = {
  // Backend ships a flat array today and the envelope after the 2026-05-28 deploy.
  // Normalize both into the envelope so the screen has one shape to consume.
  async getDistribution(): Promise<SegmentDistribution> {
    const { data } = await api.get<SegmentDistribution | SegmentBucket[]>(
      '/segments/distribution'
    );
    if (Array.isArray(data)) {
      return {
        totalCustomers: data.reduce((acc, b) => acc + b.count, 0),
        buckets: data,
      };
    }
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
