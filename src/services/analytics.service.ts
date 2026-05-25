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
  label: string;          // human-friendly bucket label ("Abr/26")
  periodStart: string;    // ISO date for the bucket (YYYY-MM-DD)
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

/**
 * Raw point as returned by the back today: a flat array with `month` (date) +
 * `vehiclesWithService`. Wrapped into the envelope-shaped VinShareSeries by the
 * service so the screen has stable fields.
 */
interface VinShareRawPoint {
  month: string;
  vehiclesWithService: number;
  vinSharePercent: number;
}

const MONTH_LABEL = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export interface DealershipVinShare {
  dealershipId: string;
  name: string;
  vehiclesServed: number;
  vehiclesTotal: number;
  sharePercent: number;
  trend: 'UP' | 'DOWN' | 'FLAT';
  estimatedRevenue: number;
}

export interface NpsSummary {
  totalResponses: number;
  averageScore: number;
  npsScore: number;
  promoters: number;
  passives: number;
  detractors: number;
  computedAt: string;
}

export const analyticsService = {
  async getKpis(period: AnalyticsPeriod = '7d'): Promise<KpisWithDelta> {
    const { data } = await api.get<KpisWithDelta>('/analytics/kpis', {
      params: { period },
    });
    return data;
  },

  // Backend ships a flat array of monthly buckets; ignores ?groupBy. Wrap into
  // the envelope shape and derive averagePercent/peakPercent from the points so
  // the screen has stable fields. targetPercent is a fixed product goal (70%).
  async getVinShareSeries(params: {
    groupBy?: 'day' | 'week' | 'month';
    from?: string;
    to?: string;
  } = {}): Promise<VinShareSeries> {
    const { data } = await api.get<VinShareRawPoint[] | VinShareSeries>(
      '/analytics/vin-share/series',
      { params }
    );
    if (!Array.isArray(data)) return data;
    const percents = data.map((p) => p.vinSharePercent);
    const average = percents.length
      ? percents.reduce((acc, n) => acc + n, 0) / percents.length
      : 0;
    const peak = percents.length ? Math.max(...percents) : 0;
    return {
      groupBy: params.groupBy ?? 'month',
      from: params.from ?? data[0]?.month ?? '',
      to: params.to ?? data[data.length - 1]?.month ?? '',
      averagePercent: average,
      peakPercent: peak,
      targetPercent: 70,
      points: data.map((p) => {
        const d = new Date(p.month);
        const yy = String(d.getUTCFullYear()).slice(-2);
        return {
          label: `${MONTH_LABEL[d.getUTCMonth()]}/${yy}`,
          periodStart: p.month,
          vinSharePercent: p.vinSharePercent,
        };
      }),
    };
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

  async getNps(params: { monthsBack?: number } = {}): Promise<NpsSummary> {
    const { data } = await api.get<NpsSummary>('/analytics/nps', { params });
    return data;
  },
};
