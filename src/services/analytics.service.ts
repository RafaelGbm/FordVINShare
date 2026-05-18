import { api } from './api';

export type AnalyticsPeriod = '7d' | '30d' | '90d' | 'year';

export interface AnalyticsKpis {
  vehiclesUnderWarranty: number;
  vinSharePercent: number;
  estimatedRevenue: number;
  leadsAtRisk: number;
}

export interface KpisWithDelta extends AnalyticsKpis {
  vehiclesUnderWarrantyDelta?: number;
  vinSharePercentDelta?: number;
  estimatedRevenueDelta?: number;
  leadsAtRiskDelta?: number;
}

export interface VinSharePoint {
  label: string;          // weekday/month label as returned by the backend
  periodStart: string;    // ISO date for the bucket
  vinSharePercent: number;
}

export interface VinShareSeries {
  groupBy: 'day' | 'week' | 'month';
  from: string;
  to: string;
  averagePercent: number;
  peakPercent: number;
  targetPercent: number;
  points: VinSharePoint[];
}

export interface DealershipVinShare {
  dealershipId: string;
  dealershipName: string;
  vinSharePercent: number;
  estimatedRevenue: number;
  trend: 'UP' | 'DOWN' | 'FLAT';
}

export interface NpsSummary {
  score: number;
  responses: number;
  detractors: number;
  passives: number;
  promoters: number;
}

export const analyticsService = {
  async getKpis(period: AnalyticsPeriod = '7d'): Promise<KpisWithDelta> {
    const { data } = await api.get<KpisWithDelta>('/analytics/kpis', {
      params: { period },
    });
    return data;
  },

  async getVinShareSeries(params: {
    groupBy?: 'day' | 'week' | 'month';
    from?: string;
    to?: string;
  } = {}): Promise<VinShareSeries> {
    const { data } = await api.get<VinShareSeries>('/analytics/vin-share/series', {
      params,
    });
    return data;
  },

  async getVinShareByDealership(
    period: AnalyticsPeriod = '30d'
  ): Promise<DealershipVinShare[]> {
    const { data } = await api.get<DealershipVinShare[]>(
      '/analytics/vin-share/by-dealership',
      { params: { period } }
    );
    return data;
  },

  async getNps(params: { dealershipId?: string; from?: string; to?: string } = {}): Promise<NpsSummary> {
    const { data } = await api.get<NpsSummary>('/analytics/nps', { params });
    return data;
  },
};
