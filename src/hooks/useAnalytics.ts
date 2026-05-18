import { useQuery } from '@tanstack/react-query';

import { analyticsService, AnalyticsPeriod } from '../services/analytics.service';

export const analyticsKeys = {
  all: ['analytics'] as const,
  kpis: (period: AnalyticsPeriod) => [...analyticsKeys.all, 'kpis', period] as const,
  vinShareSeries: (groupBy: string) =>
    [...analyticsKeys.all, 'vin-share', 'series', groupBy] as const,
  byDealership: (period: AnalyticsPeriod) =>
    [...analyticsKeys.all, 'vin-share', 'by-dealership', period] as const,
  nps: (dealershipId?: string) => [...analyticsKeys.all, 'nps', dealershipId ?? 'all'] as const,
};

export function useKpis(period: AnalyticsPeriod = '7d') {
  return useQuery({
    queryKey: analyticsKeys.kpis(period),
    queryFn: () => analyticsService.getKpis(period),
  });
}

export function useVinShareSeries(groupBy: 'day' | 'week' | 'month' = 'day') {
  return useQuery({
    queryKey: analyticsKeys.vinShareSeries(groupBy),
    queryFn: () => analyticsService.getVinShareSeries({ groupBy }),
  });
}

export function useVinShareByDealership(period: AnalyticsPeriod = '30d') {
  return useQuery({
    queryKey: analyticsKeys.byDealership(period),
    queryFn: () => analyticsService.getVinShareByDealership(period),
  });
}
