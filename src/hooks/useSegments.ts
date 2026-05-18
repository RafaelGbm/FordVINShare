import { useQuery } from '@tanstack/react-query';

import { LeadSegment } from '../services/leads.service';
import { segmentsService } from '../services/segments.service';

export const segmentKeys = {
  all: ['segments'] as const,
  distribution: () => [...segmentKeys.all, 'distribution'] as const,
  customers: (segment: LeadSegment, page: number, size: number) =>
    [...segmentKeys.all, 'customers', segment, page, size] as const,
  customerInfo: (customerId: string) =>
    [...segmentKeys.all, 'customer-info', customerId] as const,
};

export function useSegmentDistribution() {
  return useQuery({
    queryKey: segmentKeys.distribution(),
    queryFn: () => segmentsService.getDistribution(),
    staleTime: 60_000,
  });
}

export function useSegmentCustomers(
  segment: LeadSegment | undefined,
  page = 0,
  size = 20
) {
  return useQuery({
    queryKey: segmentKeys.customers(segment ?? 'FIEL', page, size),
    queryFn: () => segmentsService.listCustomers(segment!, { page, size }),
    enabled: !!segment,
  });
}

export function useCustomerSegment(customerId: string | undefined) {
  return useQuery({
    queryKey: segmentKeys.customerInfo(customerId ?? ''),
    queryFn: () => segmentsService.getCustomerSegment(customerId!),
    enabled: !!customerId,
  });
}
