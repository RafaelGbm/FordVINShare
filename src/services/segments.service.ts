import { api } from './api';
import { LeadSegment } from './leads.service';
import { PaginatedResponse } from './services.service';

export interface SegmentBucket {
  segment: LeadSegment;
  count: number;
  percent: number;
  // Backend doesn't send these — left optional for future API growth + demo fixtures.
  avgTicket?: number;
  avgNps?: number;
}

/**
 * Backend returns the distribution as a flat array of buckets (no totals envelope).
 * The screen derives `totalCustomers` from the sum of `count`s.
 */
export type SegmentDistribution = SegmentBucket[];

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
